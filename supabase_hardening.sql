-- Reforço mínimo recomendado para ranking e perfil

alter table if exists public.profiles
  add constraint profiles_name_unique unique (name);

alter table if exists public.rankings
  add constraint rankings_user_id_unique unique (user_id);

alter table public.profiles enable row level security;
alter table public.rankings enable row level security;

create policy if not exists "profiles_select_own_or_public"
on public.profiles for select
using (true);

create policy if not exists "profiles_upsert_own"
on public.profiles for all
using (auth.uid() = id)
with check (auth.uid() = id);

create policy if not exists "rankings_read_all"
on public.rankings for select
using (true);

create policy if not exists "rankings_write_own"
on public.rankings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
