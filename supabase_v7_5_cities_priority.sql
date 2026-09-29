-- Sunday Football V7.5 — cities + configurable priority cities
-- Run once in Supabase SQL Editor.

alter table public.registration_settings
  add column if not exists priority_cities text[] not null default '{}';

alter table public.registration_allowed_players
  add column if not exists city text not null default '';

alter table public.player_registrations
  add column if not exists city text not null default '';

-- Future public registrations:
-- a player is automatically approved when their city is in the admin priority list.
create or replace function public.enforce_allowed_registration()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  person public.registration_allowed_players%rowtype;
  priority_cities text[];
  city_is_priority boolean := false;
begin
  if new.allowed_player_id is null then
    raise exception 'Inscription refusée : joueur absent de la liste autorisée.';
  end if;

  select * into person
  from public.registration_allowed_players
  where id=new.allowed_player_id
    and event_id=new.event_id
    and active=true;

  if not found then
    raise exception 'Inscription refusée : joueur non autorisé.';
  end if;

  select coalesce(rs.priority_cities,'{}'::text[])
  into priority_cities
  from public.registration_settings rs
  where rs.id=new.event_id;

  new.name:=person.name;
  new.city:=coalesce(person.city,'');

  city_is_priority := exists (
    select 1
    from unnest(coalesce(priority_cities,'{}'::text[])) pc
    where lower(btrim(pc)) = lower(btrim(coalesce(person.city,'')))
  );

  if coalesce(auth.jwt()->>'email','')='abde-ghafor@hotmail.fr' then
    new.priority:=coalesce(new.priority,person.priority,city_is_priority);
  else
    if coalesce(person.priority,false) or city_is_priority then
      new.status='approved';
      new.priority=true;
    else
      new.status='pending';
      new.priority=false;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_registration_allowed_before on public.player_registrations;
create trigger trg_registration_allowed_before
before insert on public.player_registrations
for each row execute function public.enforce_allowed_registration();

-- Admin can update the registration rows (name/city/status) when authenticated.
drop policy if exists "admin can update registrations" on public.player_registrations;
create policy "admin can update registrations"
on public.player_registrations
for update to authenticated
using (auth.jwt()->>'email'='abde-ghafor@hotmail.fr')
with check (auth.jwt()->>'email'='abde-ghafor@hotmail.fr');

-- Ensure active allowed players can be read publicly while registration is open.
-- City is intentionally public; priority itself is NOT exposed by the UI.
