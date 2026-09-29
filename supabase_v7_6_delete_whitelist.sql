-- Sunday Football V7.6
-- No database change is required for the new delete button.
-- This optional cleanup permanently removes old whitelist rows that were
-- previously marked active=false by V7.5, while preserving registrations.

update public.player_registrations
set allowed_player_id = null
where allowed_player_id in (
  select id
  from public.registration_allowed_players
  where active = false
);

delete from public.registration_allowed_players
where active = false;
