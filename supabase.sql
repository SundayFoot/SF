-- SUNDAY FOOTBALL V6.5 - SUPABASE DATABASE
-- Tournament live data + public player registration list

create table if not exists public.tournaments (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.tournaments enable row level security;

drop policy if exists "public can read tournaments" on public.tournaments;
create policy "public can read tournaments"
on public.tournaments
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated can insert tournaments" on public.tournaments;
drop policy if exists "admin can insert tournaments" on public.tournaments;
create policy "admin can insert tournaments"
on public.tournaments
for insert
to authenticated
with check (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

drop policy if exists "authenticated can update tournaments" on public.tournaments;
drop policy if exists "admin can update tournaments" on public.tournaments;
create policy "admin can update tournaments"
on public.tournaments
for update
to authenticated
using (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
)
with check (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

drop policy if exists "authenticated can delete tournaments" on public.tournaments;
drop policy if exists "admin can delete tournaments" on public.tournaments;
create policy "admin can delete tournaments"
on public.tournaments
for delete
to authenticated
using (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

alter table public.tournaments replica identity full;

-- ------------------------------------------------------------
-- Sunday player registration
-- ------------------------------------------------------------

create table if not exists public.registration_settings (
  id text primary key,
  is_open boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.registration_settings (id, is_open)
values ('current', false)
on conflict (id) do nothing;

alter table public.registration_settings enable row level security;

drop policy if exists "public can read open registration" on public.registration_settings;
create policy "public can read open registration"
on public.registration_settings
for select
to anon, authenticated
using (
  is_open = true
);

drop policy if exists "admin can read registration settings" on public.registration_settings;
create policy "admin can read registration settings"
on public.registration_settings
for select
to authenticated
using (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

drop policy if exists "admin can update registration settings" on public.registration_settings;
create policy "admin can update registration settings"
on public.registration_settings
for update
to authenticated
using (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
)
with check (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

drop policy if exists "admin can insert registration settings" on public.registration_settings;
create policy "admin can insert registration settings"
on public.registration_settings
for insert
to authenticated
with check (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

create table if not exists public.player_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id text not null default 'current',
  name text not null check (char_length(btrim(name)) between 2 and 60),
  created_at timestamptz not null default now()
);

create unique index if not exists player_registrations_event_name_unique
on public.player_registrations (event_id, lower(btrim(name)));

alter table public.player_registrations enable row level security;

drop policy if exists "public can read registrations when open" on public.player_registrations;
create policy "public can read registrations when open"
on public.player_registrations
for select
to anon, authenticated
using (
  exists (
    select 1 from public.registration_settings rs
    where rs.id = player_registrations.event_id
      and rs.is_open = true
  )
);

drop policy if exists "admin can read registrations" on public.player_registrations;
create policy "admin can read registrations"
on public.player_registrations
for select
to authenticated
using (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

drop policy if exists "public can register when open" on public.player_registrations;
create policy "public can register when open"
on public.player_registrations
for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.registration_settings rs
    where rs.id = event_id
      and rs.is_open = true
  )
);

drop policy if exists "admin can delete registrations" on public.player_registrations;
create policy "admin can delete registrations"
on public.player_registrations
for delete
to authenticated
using (
  auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr'
);

alter table public.registration_settings replica identity full;
alter table public.player_registrations replica identity full;
-- Hard cap: 28 registrations. When the 28th player is inserted,
-- close registrations automatically so visitors cannot continue registering.
create or replace function public.enforce_registration_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total_count integer;
begin
  perform 1 from public.registration_settings
  where id = new.event_id
  for update;

  select count(*) into total_count
  from public.player_registrations
  where event_id = new.event_id;

  if total_count >= 28 then
    raise exception 'La liste des inscriptions est complète (28 joueurs maximum).';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_registration_limit_before on public.player_registrations;
create trigger trg_registration_limit_before
before insert on public.player_registrations
for each row
execute function public.enforce_registration_limit();

create or replace function public.close_registration_at_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total_count integer;
begin
  select count(*) into total_count
  from public.player_registrations
  where event_id = new.event_id;

  if total_count >= 28 then
    update public.registration_settings
    set is_open = false, updated_at = now()
    where id = new.event_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_registration_close_after on public.player_registrations;
create trigger trg_registration_close_after
after insert on public.player_registrations
for each row
execute function public.close_registration_at_limit();


do $$
begin
  alter publication supabase_realtime add table public.tournaments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.registration_settings;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.player_registrations;
exception when duplicate_object then null;
end $$;

-- V6.7 admin registration RPCs: keep the registration controls server-side
-- and avoid depending on direct UPDATE/DELETE permissions from the browser.
create or replace function public.set_registration_open(p_is_open boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'abde-ghafor@hotmail.fr' then
    raise exception 'Accès administrateur refusé.';
  end if;

  update public.registration_settings
  set is_open = coalesce(p_is_open, false), updated_at = now()
  where id = 'current';

  if not found then
    insert into public.registration_settings (id, is_open)
    values ('current', coalesce(p_is_open, false));
  end if;

  return true;
end;
$$;

grant execute on function public.set_registration_open(boolean) to authenticated;

create or replace function public.clear_registrations()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'abde-ghafor@hotmail.fr' then
    raise exception 'Accès administrateur refusé.';
  end if;

  delete from public.player_registrations where event_id = 'current';
  update public.registration_settings
  set is_open = false, updated_at = now()
  where id = 'current';
  return true;
end;
$$;

grant execute on function public.clear_registrations() to authenticated;

create or replace function public.delete_registration(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() ->> 'email', '') <> 'abde-ghafor@hotmail.fr' then
    raise exception 'Accès administrateur refusé.';
  end if;

  delete from public.player_registrations
  where id = p_id and event_id = 'current';
  return true;
end;
$$;

grant execute on function public.delete_registration(uuid) to authenticated;


-- V6.10 compatibility: browser writes are protected by RLS.
-- The app no longer requires the custom registration RPCs.
-- Re-running this file is safe because policies are recreated with the same names.
