begin;

create or replace function public.update_run_progress(
  p_run_id uuid,
  p_score integer,
  p_phase integer default 1,
  p_combo integer default 0,
  p_total_captures integer default 0,
  p_gold_captures integer default 0,
  p_powerups integer default 0,
  p_client_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_run public.run_sessions%rowtype;
  v_safe_meta jsonb;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_run_id is null then
    raise exception 'run session required';
  end if;

  if p_score is null or p_score < 0 or p_score > 5000 then
    raise exception 'invalid progress score';
  end if;

  select *
    into v_run
  from public.run_sessions
  where id = p_run_id
    and user_id = v_uid
  limit 1;

  if not found then
    raise exception 'run not found';
  end if;

  if v_run.status <> 'started' then
    raise exception 'run already finished';
  end if;

  if v_run.started_at < now() - interval '2 hours' then
    update public.run_sessions
    set status = 'expired',
        finished_at = now(),
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'progress_after_expiration')
    where id = v_run.id;
    raise exception 'run expired';
  end if;

  v_safe_meta := case
    when p_client_meta is null or jsonb_typeof(p_client_meta) <> 'object' then '{}'::jsonb
    else p_client_meta
  end;

  update public.run_sessions
  set progress_updates = coalesce(progress_updates, 0) + 1,
      last_progress_at = now(),
      max_score_seen = greatest(coalesce(max_score_seen, 0), p_score),
      max_phase_seen = greatest(coalesce(max_phase_seen, 1), greatest(1, coalesce(p_phase, 1))),
      max_combo_seen = greatest(coalesce(max_combo_seen, 0), greatest(0, coalesce(p_combo, 0))),
      total_captures_seen = greatest(coalesce(total_captures_seen, 0), greatest(0, coalesce(p_total_captures, 0))),
      gold_captures_seen = greatest(coalesce(gold_captures_seen, 0), greatest(0, coalesce(p_gold_captures, 0))),
      powerups_seen = greatest(coalesce(powerups_seen, 0), greatest(0, coalesce(p_powerups, 0))),
      client_meta = coalesce(client_meta, '{}'::jsonb) || v_safe_meta
  where id = v_run.id;

  return jsonb_build_object(
    'ok', true,
    'run_id', v_run.id,
    'progress_updates', coalesce(v_run.progress_updates, 0) + 1,
    'score_seen', greatest(coalesce(v_run.max_score_seen, 0), p_score)
  );
end;
$$;

revoke all on function public.update_run_progress(uuid, integer, integer, integer, integer, integer, integer, jsonb) from public;
grant execute on function public.update_run_progress(uuid, integer, integer, integer, integer, integer, integer, jsonb) to authenticated;

create or replace function public.submit_score_secure(
  p_run_id uuid,
  p_score integer,
  p_skin text default null,
  p_client_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_name text;
  v_run public.run_sessions%rowtype;
  v_old_score integer;
  v_final_score integer;
  v_new_record boolean;
  v_duration_seconds numeric;
  v_max_allowed integer;
  v_pps_limit numeric;
  v_safe_meta jsonb;
  v_progress_grace integer;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_run_id is null then
    raise exception 'run session required';
  end if;

  if p_score is null or p_score < 0 then
    raise exception 'invalid score';
  end if;

  if p_score > 5000 then
    raise exception 'score exceeds absolute cap';
  end if;

  select *
    into v_run
  from public.run_sessions
  where id = p_run_id
    and user_id = v_uid
  limit 1;

  if not found then
    raise exception 'run not found';
  end if;

  if v_run.status <> 'started' then
    raise exception 'run already finished';
  end if;

  if v_run.started_at < now() - interval '2 hours' then
    update public.run_sessions
    set status = 'expired',
        finished_at = now(),
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'submit_after_expiration')
    where id = v_run.id;
    raise exception 'run expired';
  end if;

  if v_run.mode = 'zen' then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'zen_not_ranked')
    where id = v_run.id;
    raise exception 'zen mode is not ranked';
  end if;

  v_duration_seconds := extract(epoch from (now() - v_run.started_at));
  if v_duration_seconds < 3 then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'run_too_short', 'duration_seconds', v_duration_seconds)
    where id = v_run.id;
    raise exception 'run too short';
  end if;

  v_pps_limit := 10;
  v_max_allowed := greatest(35, floor(v_duration_seconds * v_pps_limit) + 25);

  if p_score > v_max_allowed then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object(
          'reason', 'score_above_server_limit',
          'duration_seconds', v_duration_seconds,
          'max_allowed', v_max_allowed,
          'submitted', p_score
        )
    where id = v_run.id;
    raise exception 'score exceeds server limit';
  end if;

  if p_score >= 20 and coalesce(v_run.progress_updates, 0) < 1 then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'missing_progress_checkpoints')
    where id = v_run.id;
    raise exception 'missing progress checkpoints';
  end if;

  if p_score >= 80 and coalesce(v_run.progress_updates, 0) < 2 then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'insufficient_progress_checkpoints')
    where id = v_run.id;
    raise exception 'insufficient progress checkpoints';
  end if;

  if p_score >= 160 and coalesce(v_run.progress_updates, 0) < 3 then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'high_score_without_progress')
    where id = v_run.id;
    raise exception 'high score requires more checkpoints';
  end if;

  if p_score >= 40 and coalesce(v_run.total_captures_seen, 0) < 3 then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'too_few_captures_for_score')
    where id = v_run.id;
    raise exception 'score does not match capture history';
  end if;

  v_progress_grace := least(
    90,
    greatest(
      12,
      floor(extract(epoch from (now() - coalesce(v_run.last_progress_at, v_run.started_at))) * 5) + 10
    )
  );

  if p_score > coalesce(v_run.max_score_seen, 0) + v_progress_grace then
    update public.run_sessions
    set status = 'finished',
        finished_at = now(),
        submitted_score = p_score,
        submitted_skin = p_skin,
        server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object(
          'reason', 'score_jump_exceeds_progress_window',
          'score_seen', coalesce(v_run.max_score_seen, 0),
          'submitted', p_score,
          'grace', v_progress_grace
        )
    where id = v_run.id;
    raise exception 'score jump exceeds progress window';
  end if;

  select name::text
    into v_name
  from public.profiles
  where id = v_uid;

  if v_name is null then
    raise exception 'profile without nickname';
  end if;

  select score
    into v_old_score
  from public.rankings
  where user_id = v_uid;

  v_safe_meta := case
    when p_client_meta is null or jsonb_typeof(p_client_meta) <> 'object' then '{}'::jsonb
    else p_client_meta
  end;

  update public.run_sessions
  set status = 'finished',
      finished_at = now(),
      submitted_score = p_score,
      submitted_skin = p_skin,
      max_score_seen = greatest(coalesce(max_score_seen, 0), p_score),
      client_meta = coalesce(client_meta, '{}'::jsonb) || v_safe_meta,
      server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object(
        'duration_seconds', v_duration_seconds,
        'max_allowed', v_max_allowed,
        'progress_updates', coalesce(v_run.progress_updates, 0),
        'accepted', true
      )
  where id = v_run.id;

  insert into public.rankings (user_id, name, score, skin)
  values (v_uid, v_name, p_score, p_skin)
  on conflict (user_id)
  do update
    set score = greatest(public.rankings.score, excluded.score),
        name  = excluded.name,
        skin  = case
                  when excluded.score > public.rankings.score then excluded.skin
                  else public.rankings.skin
                end;

  select score
    into v_final_score
  from public.rankings
  where user_id = v_uid;

  v_new_record := v_old_score is null or p_score > v_old_score;

  return jsonb_build_object(
    'ok', true,
    'submitted', p_score,
    'stored', v_final_score,
    'new_record', v_new_record,
    'duration_seconds', v_duration_seconds,
    'max_allowed', v_max_allowed,
    'run_id', v_run.id,
    'progress_updates', coalesce(v_run.progress_updates, 0)
  );
end;
$$;

revoke all on function public.submit_score_secure(uuid, integer, text, jsonb) from public;
grant execute on function public.submit_score_secure(uuid, integer, text, jsonb) to authenticated;

create or replace function public.submit_score(
  p_score integer,
  p_skin text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_run_id uuid;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  perform public.cleanup_run_sessions(v_uid);

  select id
    into v_run_id
  from public.run_sessions
  where user_id = v_uid
    and status = 'started'
  order by started_at desc
  limit 1;

  if v_run_id is null then
    raise exception 'run session required';
  end if;

  return public.submit_score_secure(v_run_id, p_score, p_skin, '{}'::jsonb);
end;
$$;

revoke all on function public.submit_score(integer, text) from public;
grant execute on function public.submit_score(integer, text) to authenticated;

commit;
