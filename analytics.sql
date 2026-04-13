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

commit;
