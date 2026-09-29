-- Sunday Football V7.7
-- 1) Registration capacity increased from 28 to 42 so that 6 teams x 5-7 players are possible.
-- 2) Deleting an authorized player in the app also deletes that person's registration.
-- 3) Remove old V7.5 inactive whitelist rows permanently.

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

  if total_count >= 42 then
    raise exception 'La liste des inscriptions est complète (42 joueurs maximum).';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_registration_limit_before on public.player_registrations;
create trigger trg_registration_limit_before
before insert on public.player_registrations
for each row execute function public.enforce_registration_limit();

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

  if total_count >= 42 then
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
for each row execute function public.close_registration_at_limit();

-- Permanently clean rows that V7.5/V7.6 had marked inactive.
delete from public.player_registrations
where allowed_player_id in (
  select id from public.registration_allowed_players where active = false
);

delete from public.registration_allowed_players
where active = false;
