begin;

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

commit;
