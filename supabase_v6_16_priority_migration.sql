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
