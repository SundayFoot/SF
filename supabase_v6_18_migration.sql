-- Sunday Football V6.18
-- Run this once in Supabase SQL Editor.

-- Fix: admin can add a player directly to the registrations.
drop policy if exists "admin can insert registrations" on public.player_registrations;
create policy "admin can insert registrations"
on public.player_registrations
for insert to authenticated
with check (auth.jwt() ->> 'email' = 'abde-ghafor@hotmail.fr');

-- Public registration remains restricted to approved priority or pending normal requests.
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
    where ap.id = allowed_player_id and ap.event_id = event_id and ap.active = true
  )
);
