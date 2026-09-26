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


-- V6.11: controlled registrations / approval / priority
alter table public.player_registrations
  add column if not exists status text not null default 'pending';

alter table public.player_registrations
  add column if not exists priority boolean not null default false;

update public.player_registrations
set status = 'approved'
where status is null or status = '';

alter table public.player_registrations
  drop constraint if exists player_registrations_status_check;
alter table public.player_registrations
  add constraint player_registrations_status_check
  check (status in ('pending','approved','rejected'));

-- Public visitors can submit only a pending request; they cannot approve themselves
-- or mark themselves as priority.
drop policy if exists "public can register when open" on public.player_registrations;
create policy "public can register when open"
on public.player_registrations
for insert
to anon, authenticated
with check (
  status = 'pending'
  and priority = false
  and exists (
    select 1 from public.registration_settings rs
    where rs.id = event_id
      and rs.is_open = true
  )
);

-- Public visitors see only approved players, never pending/rejected requests.
drop policy if exists "public can read registrations when open" on public.player_registrations;
create policy "public can read registrations when open"
on public.player_registrations
for select
to anon, authenticated
using (
  status = 'approved'
  and exists (
    select 1 from public.registration_settings rs
    where rs.id = player_registrations.event_id
      and rs.is_open = true
  )
);

-- Admin can update approval/rejection/priority.
drop policy if exists "admin can update registrations" on public.player_registrations;
create policy "admin can update registrations"
on public.player_registrations
for update
to authenticated
using (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr')
with check (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr');

-- Replace the old trigger logic: the 28-player limit applies to APPROVED players.
create or replace function public.enforce_registration_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  approved_count integer;
begin
  if new.status = 'approved' then
    select count(*) into approved_count
    from public.player_registrations
    where event_id = new.event_id
      and status = 'approved'
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);
    if approved_count >= 28 then
      raise exception 'La liste des joueurs approuvés est complète (28 maximum).';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_registration_limit_before on public.player_registrations;
create trigger trg_registration_limit_before
before insert or update of status on public.player_registrations
for each row execute function public.enforce_registration_limit();

create or replace function public.close_registration_at_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  approved_count integer;
begin
  select count(*) into approved_count
  from public.player_registrations
  where event_id = new.event_id and status = 'approved';
  if approved_count >= 28 then
    update public.registration_settings
    set is_open = false, updated_at = now()
    where id = new.event_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_registration_close_after on public.player_registrations;
create trigger trg_registration_close_after
after insert or update of status on public.player_registrations
for each row execute function public.close_registration_at_limit();

-- V6.11 compatibility: remove the old public RPC dependency if it exists is not required;
-- the application uses RLS-protected direct writes for admin controls.


-- V6.12: admin-controlled whitelist for Sunday registrations
create table if not exists public.registration_allowed_players (
  id uuid primary key default gen_random_uuid(),
  event_id text not null default 'current',
  name text not null check (char_length(btrim(name)) between 2 and 60),
  priority boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists registration_allowed_players_event_name_unique
on public.registration_allowed_players (event_id, lower(btrim(name)));

alter table public.registration_allowed_players enable row level security;

drop policy if exists "public can read active allowed players when open" on public.registration_allowed_players;
create policy "public can read active allowed players when open"
on public.registration_allowed_players
for select to anon, authenticated
using (
  active = true and exists (
    select 1 from public.registration_settings rs
    where rs.id = registration_allowed_players.event_id and rs.is_open = true
  )
);

drop policy if exists "admin can read allowed players" on public.registration_allowed_players;
create policy "admin can read allowed players"
on public.registration_allowed_players
for select to authenticated
using (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr');

drop policy if exists "admin can insert allowed players" on public.registration_allowed_players;
create policy "admin can insert allowed players"
on public.registration_allowed_players
for insert to authenticated
with check (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr');

drop policy if exists "admin can update allowed players" on public.registration_allowed_players;
create policy "admin can update allowed players"
on public.registration_allowed_players
for update to authenticated
using (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr')
with check (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr');

drop policy if exists "admin can delete allowed players" on public.registration_allowed_players;
create policy "admin can delete allowed players"
on public.registration_allowed_players
for delete to authenticated
using (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr');

alter table public.player_registrations
  add column if not exists allowed_player_id uuid references public.registration_allowed_players(id);

create unique index if not exists player_registrations_event_allowed_unique
on public.player_registrations (event_id, allowed_player_id)
where allowed_player_id is not null;

-- Every new public registration must correspond to an active admin-approved name.
create or replace function public.enforce_allowed_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  person public.registration_allowed_players%rowtype;
begin
  if new.allowed_player_id is null then
    raise exception 'Inscription refusée : joueur absent de la liste autorisée.';
  end if;

  select * into person
  from public.registration_allowed_players
  where id = new.allowed_player_id
    and event_id = new.event_id
    and active = true;

  if not found then
    raise exception 'Inscription refusée : joueur non autorisé.';
  end if;

  new.name := person.name;
  if coalesce(auth.jwt() ->> 'email', '') = 'abde-ghafor@hotmail.fr' then
    new.priority := coalesce(new.priority, person.priority);
  else
    if coalesce(person.priority, false) then
      new.status := 'approved';
      new.priority := true;
    else
      new.status := 'pending';
      new.priority := false;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_registration_allowed_before on public.player_registrations;
create trigger trg_registration_allowed_before
before insert on public.player_registrations
for each row execute function public.enforce_allowed_registration();

-- Public inserts now require a valid allowed player ID.
drop policy if exists "public can register when open" on public.player_registrations;
create policy "public can register when open"
on public.player_registrations
for insert to anon, authenticated
with check (
  allowed_player_id is not null
  and (
    (status = 'pending' and priority = false)
    or (status = 'approved' and priority = true)
  )
  and exists (
    select 1 from public.registration_settings rs
    where rs.id = event_id and rs.is_open = true
  )
  and exists (
    select 1 from public.registration_allowed_players ap
    where ap.id = allowed_player_id
      and ap.event_id = event_id
      and ap.active = true
  )
);

do $$
begin
  alter publication supabase_realtime add table public.registration_allowed_players;
exception when duplicate_object then null;
end $$;


-- ============================================================
-- V6.16 MIGRATION
-- Priority players are accepted immediately.
-- Other allowed players remain pending and are handled by admin
-- in first-come-first-served order (created_at ascending).
-- ============================================================

create or replace function public.enforce_allowed_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  person public.registration_allowed_players%rowtype;
begin
  if new.allowed_player_id is null then
    raise exception 'Inscription refusée : joueur absent de la liste autorisée.';
  end if;

  select * into person
  from public.registration_allowed_players
  where id = new.allowed_player_id
    and event_id = new.event_id
    and active = true;

  if not found then
    raise exception 'Inscription refusée : joueur non autorisé.';
  end if;

  new.name := person.name;

  if coalesce(auth.jwt() ->> 'email', '') = 'abde-ghafor@hotmail.fr' then
    new.priority := coalesce(new.priority, person.priority);
  else
    -- Priority players are accepted immediately.
    -- Everyone else waits for admin confirmation.
    new.priority := coalesce(person.priority, false);
    new.status := case when person.priority then 'approved' else 'pending' end;
  end if;

  return new;
end;
$$;

drop policy if exists "public can register when open" on public.player_registrations;

create policy "public can register when open"
on public.player_registrations
for insert to anon, authenticated
with check (
  allowed_player_id is not null
  and exists (
    select 1
    from public.registration_settings rs
    where rs.id = event_id and rs.is_open = true
  )
  and exists (
    select 1
    from public.registration_allowed_players ap
    where ap.id = allowed_player_id
      and ap.event_id = event_id
      and ap.active = true
      and (
        (ap.priority = true and status = 'approved' and priority = true)
        or
        (ap.priority = false and status = 'pending' and priority = false)
      )
  )
);

-- Make the public list show priority people first, then oldest added first.
-- (The application also applies this order when reading the list.)
