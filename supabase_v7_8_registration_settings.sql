-- Sunday Football V7.8
-- Configure the number of teams for Sunday's registration and derive the capacity.
-- team_count: 2..6
-- players_per_team: 5..7

alter table public.registration_settings
  add column if not exists team_count integer not null default 6,
  add column if not exists players_per_team integer not null default 7;

update public.registration_settings
set team_count = case when team_count between 2 and 6 then team_count else 6 end,
    players_per_team = case when players_per_team between 5 and 7 then players_per_team else 7 end,
    updated_at = now()
where id = 'current';

alter table public.registration_settings
  drop constraint if exists registration_settings_team_count_check;
alter table public.registration_settings
  add constraint registration_settings_team_count_check check (team_count between 2 and 6);

alter table public.registration_settings
  drop constraint if exists registration_settings_players_per_team_check;
alter table public.registration_settings
  add constraint registration_settings_players_per_team_check check (players_per_team between 5 and 7);

create or replace function public.enforce_registration_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total_count integer;
  max_count integer;
  configured_teams integer;
  configured_players integer;
begin
  select
    coalesce(team_count, 6),
    coalesce(players_per_team, 7)
  into configured_teams, configured_players
  from public.registration_settings
  where id = new.event_id
  for update;

  configured_teams := greatest(2, least(6, coalesce(configured_teams, 6)));
  configured_players := greatest(5, least(7, coalesce(configured_players, 7)));
  max_count := configured_teams * configured_players;

  select count(*) into total_count
  from public.player_registrations
  where event_id = new.event_id
    and coalesce(status, 'approved') in ('approved', 'pending');

  if total_count >= max_count then
    raise exception 'La liste des inscriptions est complète (% joueurs maximum).', max_count;
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
  max_count integer;
  configured_teams integer;
  configured_players integer;
begin
  select
    coalesce(team_count, 6),
    coalesce(players_per_team, 7)
  into configured_teams, configured_players
  from public.registration_settings
  where id = new.event_id;

  configured_teams := greatest(2, least(6, coalesce(configured_teams, 6)));
  configured_players := greatest(5, least(7, coalesce(configured_players, 7)));
  max_count := configured_teams * configured_players;

  select count(*) into total_count
  from public.player_registrations
  where event_id = new.event_id
    and coalesce(status, 'approved') in ('approved', 'pending');

  if total_count >= max_count then
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
