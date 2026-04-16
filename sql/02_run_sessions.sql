begin;

create extension if not exists pgcrypto;

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

commit;
