begin;

create extension if not exists citext;

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

commit;
