begin;

create extension if not exists citext;
create extension if not exists pgcrypto;

-- =========================================================
-- 1) PROFILES
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name citext not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'name'
      and udt_name <> 'citext'
  ) then
    begin
      alter table public.profiles
        alter column name type citext using name::citext;
    exception when others then
      null;
    end;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_name_unique'
  ) then
    alter table public.profiles
      add constraint profiles_name_unique unique (name);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_name_format_chk'
  ) then
    alter table public.profiles
      add constraint profiles_name_format_chk
      check (
        char_length(name::text) between 3 and 16
        and name::text ~ '^[A-Za-z0-9]+$'
      );
  end if;
end
$$;

create index if not exists idx_profiles_name on public.profiles(name);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable" on public.profiles;
drop policy if exists "Profiles insert own" on public.profiles;
drop policy if exists "Profiles update own" on public.profiles;
drop policy if exists "Profiles delete own" on public.profiles;

create policy "Profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;

-- =========================================================
-- 2) RANKINGS
-- =========================================================

create table if not exists public.rankings (
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  skin text,
  score integer not null default 0
);

alter table public.rankings
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.rankings
  add column if not exists name text;

alter table public.rankings
  add column if not exists skin text;

alter table public.rankings
  add column if not exists score integer default 0;

alter table public.rankings
  alter column score set default 0;

update public.rankings
set score = 0
where score is null;

alter table public.rankings
  alter column score set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rankings_user_id_unique'
  ) then
    alter table public.rankings
      add constraint rankings_user_id_unique unique (user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rankings_score_nonnegative_chk'
  ) then
    alter table public.rankings
      add constraint rankings_score_nonnegative_chk
      check (score >= 0);
  end if;
end
$$;

create index if not exists idx_rankings_user on public.rankings(user_id);
create index if not exists idx_rankings_score_desc on public.rankings(score desc);

alter table public.rankings enable row level security;

drop policy if exists "Rankings are readable" on public.rankings;
drop policy if exists "Rankings insert own" on public.rankings;
drop policy if exists "Rankings update own" on public.rankings;
drop policy if exists "Rankings delete own" on public.rankings;

create policy "Rankings are readable"
on public.rankings
for select
to anon, authenticated
using (true);

revoke insert, update, delete on public.rankings from anon, authenticated;
grant select on public.rankings to anon, authenticated;

create or replace function public.rankings_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.score < 0 then
    raise exception 'score must be >= 0';
  end if;

  if tg_op = 'UPDATE' then
    if new.user_id is distinct from old.user_id then
      raise exception 'user_id cannot be changed';
    end if;

    if new.score < old.score then
      raise exception 'score cannot decrease';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_rankings_guard on public.rankings;

create trigger trg_rankings_guard
before insert or update
on public.rankings
for each row
execute function public.rankings_guard();

-- =========================================================
-- 3) NICKNAME / ACCOUNT RPCS
-- =========================================================

create or replace function public.set_nickname(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_name text;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_name := upper(trim(p_name));

  if v_name !~ '^[A-Z0-9]{3,16}$' then
    raise exception 'invalid nickname';
  end if;

  begin
    insert into public.profiles (id, name)
    values (v_uid, v_name)
    on conflict (id)
    do update set name = excluded.name;
  exception
    when unique_violation then
      raise exception 'nickname already in use';
  end;

  update public.rankings
  set name = v_name
  where user_id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'name', v_name
  );
end;
$$;

revoke all on function public.set_nickname(text) from public;
grant execute on function public.set_nickname(text) to authenticated;

create or replace function public.delete_my_account_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  delete from public.rankings
  where user_id = v_uid;

  delete from public.profiles
  where id = v_uid;

  return jsonb_build_object(
    'ok', true,
    'deleted_profile', true,
    'deleted_ranking', true
  );
end;
$$;

revoke all on function public.delete_my_account_data() from public;
grant execute on function public.delete_my_account_data() to authenticated;

-- =========================================================
-- 4) RUN SESSIONS
-- =========================================================

create table if not exists public.run_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'normal',
  status text not null default 'started',
  started_at timestamptz not null default now(),
  finished_at timestamptz null,
  submitted_score integer null,
  submitted_skin text null,
  client_meta jsonb not null default '{}'::jsonb,
  server_notes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  progress_updates integer not null default 0,
  last_progress_at timestamptz null,
  max_score_seen integer not null default 0,
  max_phase_seen integer not null default 1,
  max_combo_seen integer not null default 0,
  total_captures_seen integer not null default 0,
  gold_captures_seen integer not null default 0,
  powerups_seen integer not null default 0,
  constraint run_sessions_mode_chk check (mode in ('normal', 'zen')),
  constraint run_sessions_status_chk check (status in ('started', 'finished', 'abandoned', 'expired')),
  constraint run_sessions_score_chk check (submitted_score is null or submitted_score >= 0)
);

alter table public.run_sessions
  add column if not exists progress_updates integer not null default 0,
  add column if not exists last_progress_at timestamptz null,
  add column if not exists max_score_seen integer not null default 0,
  add column if not exists max_phase_seen integer not null default 1,
  add column if not exists max_combo_seen integer not null default 0,
  add column if not exists total_captures_seen integer not null default 0,
  add column if not exists gold_captures_seen integer not null default 0,
  add column if not exists powerups_seen integer not null default 0;

create index if not exists idx_run_sessions_user_status_started_at
  on public.run_sessions(user_id, status, started_at desc);

create index if not exists idx_run_sessions_started_at
  on public.run_sessions(started_at desc);

create index if not exists idx_run_sessions_last_progress_at
  on public.run_sessions(last_progress_at desc);

alter table public.run_sessions enable row level security;

drop policy if exists "Run sessions disabled direct read" on public.run_sessions;
drop policy if exists "Run sessions disabled direct write" on public.run_sessions;

create policy "Run sessions disabled direct read"
on public.run_sessions
for select
to anon, authenticated
using (false);

create policy "Run sessions disabled direct write"
on public.run_sessions
for insert
to anon, authenticated
with check (false);

revoke all on public.run_sessions from anon, authenticated;

create or replace function public.cleanup_run_sessions(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.run_sessions
  set status = 'expired',
      finished_at = coalesce(finished_at, now()),
      server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'expired_timeout')
  where user_id = p_uid
    and status = 'started'
    and started_at < now() - interval '2 hours';
end;
$$;

revoke all on function public.cleanup_run_sessions(uuid) from public;

create or replace function public.start_run_session(
  p_mode text default 'normal',
  p_client_meta jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_mode text;
  v_run_id uuid;
  v_started_at timestamptz;
begin
  v_uid := auth.uid();

  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_mode := lower(trim(coalesce(p_mode, 'normal')));
  if v_mode not in ('normal', 'zen') then
    raise exception 'invalid run mode';
  end if;

  perform public.cleanup_run_sessions(v_uid);

  update public.run_sessions
  set status = 'abandoned',
      finished_at = now(),
      server_notes = coalesce(server_notes, '{}'::jsonb) || jsonb_build_object('reason', 'new_run_started')
  where user_id = v_uid
    and status = 'started';

  insert into public.run_sessions (user_id, mode, status, client_meta)
  values (
    v_uid,
    v_mode,
    'started',
    case
      when p_client_meta is null or jsonb_typeof(p_client_meta) <> 'object' then '{}'::jsonb
      else p_client_meta
    end
  )
  returning id, started_at into v_run_id, v_started_at;

  return jsonb_build_object(
    'ok', true,
    'run_id', v_run_id,
    'mode', v_mode,
    'started_at', v_started_at
  );
end;
$$;

revoke all on function public.start_run_session(text, jsonb) from public;
grant execute on function public.start_run_session(text, jsonb) to authenticated;

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

-- =========================================================
-- 5) ANALYTICS
-- =========================================================

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null,
  user_id uuid null references auth.users(id) on delete set null,
  event_name text not null,
  client_ts timestamptz null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists idx_analytics_events_created_at on public.analytics_events(created_at desc);
create index if not exists idx_analytics_events_event_name on public.analytics_events(event_name);
create index if not exists idx_analytics_events_user_id on public.analytics_events(user_id);
create index if not exists idx_analytics_events_session_id on public.analytics_events(session_id);

alter table public.analytics_events enable row level security;

drop policy if exists "Analytics disabled direct read" on public.analytics_events;
drop policy if exists "Analytics disabled direct write" on public.analytics_events;

create policy "Analytics disabled direct read"
on public.analytics_events
for select
to anon, authenticated
using (false);

create policy "Analytics disabled direct write"
on public.analytics_events
for insert
to anon, authenticated
with check (false);

revoke all on public.analytics_events from anon, authenticated;

create or replace function public.log_analytics_events(p_events jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_count integer := 0;
  v_item jsonb;
begin
  v_uid := auth.uid();

  if p_events is null or jsonb_typeof(p_events) <> 'array' then
    raise exception 'invalid analytics payload';
  end if;

  for v_item in select value from jsonb_array_elements(p_events) loop
    exit when v_count >= 100;

    insert into public.analytics_events (
      session_id,
      user_id,
      event_name,
      client_ts,
      payload
    ) values (
      coalesce(v_item->>'session_id', 'unknown'),
      v_uid,
      left(coalesce(v_item->>'event_name', 'unknown'), 64),
      case
        when (v_item ? 'client_ts') then (v_item->>'client_ts')::timestamptz
        else null
      end,
      coalesce(v_item->'payload', '{}'::jsonb)
    );

    v_count := v_count + 1;
  end loop;

  return jsonb_build_object('ok', true, 'inserted', v_count);
end;
$$;

revoke all on function public.log_analytics_events(jsonb) from public;
grant execute on function public.log_analytics_events(jsonb) to anon, authenticated;

create or replace view public.analytics_run_end_v1 as
select
  coalesce((client_ts at time zone 'utc')::date, created_at::date) as event_day,
  created_at,
  session_id,
  user_id,
  coalesce(payload->>'client_run_id', payload->>'run_id') as run_ref,
  coalesce(payload->>'mode', 'unknown') as mode,
  coalesce(payload->>'source', 'unknown') as source,
  coalesce((payload->>'score')::int, (payload->>'final_score')::int, 0) as score,
  coalesce((payload->>'phase')::int, (payload->>'final_phase')::int, 1) as phase,
  coalesce((payload->>'duration_seconds')::numeric, 0) as duration_seconds,
  coalesce(payload->>'death_reason', 'unknown') as death_reason,
  coalesce((payload->>'captures')::int, 0) as captures,
  coalesce((payload->>'captures_easy')::int, 0) as captures_easy,
  coalesce((payload->>'captures_medium')::int, 0) as captures_medium,
  coalesce((payload->>'captures_hard')::int, 0) as captures_hard,
  coalesce((payload->>'captures_gold')::int, 0) as captures_gold,
  coalesce((payload->>'gold_captures')::int, 0) as gold_captures,
  coalesce((payload->>'powerups_collected')::int, 0) as powerups_collected,
  coalesce((payload->>'best_combo_run')::int, 0) as best_combo_run,
  coalesce((payload->>'pause_count')::int, 0) as pause_count,
  coalesce((payload->>'tutorial_step')::int, 0) as tutorial_step,
  coalesce((payload->>'new_record')::boolean, false) as new_record,
  payload->>'selected_skin' as selected_skin,
  payload->>'selected_bg' as selected_bg
from public.analytics_events
where event_name = 'game_over';

create or replace view public.analytics_daily_funnel_v1 as
with per_session as (
  select
    coalesce((client_ts at time zone 'utc')::date, created_at::date) as event_day,
    session_id,
    bool_or(event_name = 'app_open') as opened,
    bool_or(event_name = 'game_start') as started,
    bool_or(event_name = 'first_release') as first_release,
    bool_or(event_name = 'game_over') as finished
  from public.analytics_events
  group by 1, 2
)
select
  event_day,
  count(*) filter (where opened) as sessions_opened,
  count(*) filter (where started) as sessions_started_run,
  count(*) filter (where first_release) as sessions_first_release,
  count(*) filter (where finished) as sessions_finished_run,
  round(100.0 * count(*) filter (where started) / nullif(count(*) filter (where opened), 0), 2) as open_to_start_pct,
  round(100.0 * count(*) filter (where first_release) / nullif(count(*) filter (where started), 0), 2) as start_to_first_release_pct,
  round(100.0 * count(*) filter (where finished) / nullif(count(*) filter (where started), 0), 2) as start_to_finish_pct
from per_session
group by event_day
order by event_day desc;

create or replace view public.analytics_source_daily_v1 as
select
  event_day,
  mode,
  source,
  count(*) as runs,
  round(avg(score)::numeric, 2) as avg_score,
  round(avg(duration_seconds)::numeric, 2) as avg_duration_seconds,
  round(percentile_cont(0.5) within group (order by score)::numeric, 2) as median_score,
  round(100.0 * avg(case when new_record then 1 else 0 end)::numeric, 2) as new_record_rate_pct
from public.analytics_run_end_v1
group by event_day, mode, source
order by event_day desc, runs desc;

create or replace view public.analytics_powerups_daily_v1 as
select
  coalesce((client_ts at time zone 'utc')::date, created_at::date) as event_day,
  coalesce(payload->>'type', 'unknown') as powerup_type,
  count(*) as picks,
  round(avg(coalesce((payload->>'score')::numeric, 0)), 2) as avg_score_at_pick,
  round(avg(coalesce((payload->>'phase')::numeric, 1)), 2) as avg_phase_at_pick
from public.analytics_events
where event_name = 'powerup_collected'
group by event_day, powerup_type
order by event_day desc, picks desc;

create or replace view public.analytics_phase_daily_v1 as
select
  coalesce((client_ts at time zone 'utc')::date, created_at::date) as event_day,
  coalesce((payload->>'phase_reached')::int, (payload->>'phase')::int, 1) as phase_reached,
  count(*) as hits,
  count(distinct coalesce(payload->>'client_run_id', payload->>'run_id', session_id)) as distinct_runs,
  round(avg(coalesce((payload->>'score')::numeric, 0)), 2) as avg_score_when_reached
from public.analytics_events
where event_name = 'phase_reached'
group by event_day, phase_reached
order by event_day desc, phase_reached asc;

-- =========================================================
-- 6) COMPETITIVE RANKING RPC
-- =========================================================

create or replace function public.get_rankings_competitive(
  p_top_limit integer default 5,
  p_window integer default 2
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_top_limit integer := greatest(3, least(coalesce(p_top_limit, 5), 10));
  v_window integer := greatest(1, least(coalesce(p_window, 2), 4));
  v_total integer := 0;
  v_user_rank integer := null;
  v_user_score integer := null;
  v_user_name text := null;
  v_user_skin text := null;
  v_next_better_rank integer := null;
  v_next_better_score integer := null;
  v_next_better_name text := null;
  v_to_next integer := null;
  v_top_cutoff integer := null;
  v_to_top integer := null;
  v_percentile numeric := null;
  v_top jsonb := '[]'::jsonb;
  v_around jsonb := '[]'::jsonb;
begin
  v_uid := auth.uid();

  with ranked as (
    select
      r.user_id,
      r.name,
      r.score,
      r.skin,
      row_number() over(order by r.score desc, r.user_id asc) as pos
    from public.rankings r
    where r.score is not null
  )
  select count(*) into v_total from ranked;

  with ranked as (
    select
      r.user_id,
      r.name,
      r.score,
      r.skin,
      row_number() over(order by r.score desc, r.user_id asc) as pos
    from public.rankings r
    where r.score is not null
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank', pos,
    'user_id', user_id,
    'name', name,
    'score', score,
    'skin', skin
  ) order by pos), '[]'::jsonb)
  into v_top
  from ranked
  where pos <= v_top_limit;

  if v_total >= v_top_limit then
    with ranked as (
      select
        r.user_id,
        r.name,
        r.score,
        r.skin,
        row_number() over(order by r.score desc, r.user_id asc) as pos
      from public.rankings r
      where r.score is not null
    )
    select score into v_top_cutoff
    from ranked
    where pos = v_top_limit;
  end if;

  if v_uid is not null then
    with ranked as (
      select
        r.user_id,
        r.name,
        r.score,
        r.skin,
        row_number() over(order by r.score desc, r.user_id asc) as pos
      from public.rankings r
      where r.score is not null
    )
    select pos, score, name, skin
      into v_user_rank, v_user_score, v_user_name, v_user_skin
    from ranked
    where user_id = v_uid
    limit 1;

    if v_user_rank is not null then
      with ranked as (
        select
          r.user_id,
          r.name,
          r.score,
          r.skin,
          row_number() over(order by r.score desc, r.user_id asc) as pos
        from public.rankings r
        where r.score is not null
      )
      select coalesce(jsonb_agg(jsonb_build_object(
        'rank', pos,
        'user_id', user_id,
        'name', name,
        'score', score,
        'skin', skin
      ) order by pos), '[]'::jsonb)
      into v_around
      from ranked
      where pos between greatest(1, v_user_rank - v_window) and least(v_total, v_user_rank + v_window);

      with ranked as (
        select
          r.user_id,
          r.name,
          r.score,
          r.skin,
          row_number() over(order by r.score desc, r.user_id asc) as pos
        from public.rankings r
        where r.score is not null
      )
      select pos, score, name
        into v_next_better_rank, v_next_better_score, v_next_better_name
      from ranked
      where pos = v_user_rank - 1
      limit 1;

      if v_next_better_score is not null then
        v_to_next := greatest(0, v_next_better_score - coalesce(v_user_score, 0) + 1);
      end if;

      if v_top_cutoff is not null and v_user_rank > v_top_limit then
        v_to_top := greatest(0, v_top_cutoff - coalesce(v_user_score, 0) + 1);
      else
        v_to_top := 0;
      end if;

      if v_total > 0 then
        v_percentile := round((100.0 * (v_total - v_user_rank + 1) / v_total)::numeric, 1);
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'ok', true,
    'top', v_top,
    'around_me', v_around,
    'summary', jsonb_build_object(
      'total_players', coalesce(v_total, 0),
      'user_rank', v_user_rank,
      'user_score', v_user_score,
      'user_name', v_user_name,
      'user_skin', v_user_skin,
      'percentile', v_percentile,
      'next_better_rank', v_next_better_rank,
      'next_better_score', v_next_better_score,
      'next_better_name', v_next_better_name,
      'points_to_next', v_to_next,
      'points_to_top', v_to_top,
      'top_cutoff_score', v_top_cutoff,
      'top_limit', v_top_limit,
      'window', v_window
    )
  );
end;
$$;

revoke all on function public.get_rankings_competitive(integer, integer) from public;
grant execute on function public.get_rankings_competitive(integer, integer) to anon, authenticated;

commit;
