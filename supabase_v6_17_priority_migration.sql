-- Sunday Football V6.17: priority registration
create or replace function public.enforce_allowed_registration()
returns trigger language plpgsql security definer set search_path=public as $$
declare person public.registration_allowed_players%rowtype;
begin
  if new.allowed_player_id is null then raise exception 'Inscription refusée : joueur absent de la liste autorisée.'; end if;
  select * into person from public.registration_allowed_players where id=new.allowed_player_id and event_id=new.event_id and active=true;
  if not found then raise exception 'Inscription refusée : joueur non autorisé.'; end if;
  new.name:=person.name;
  if coalesce(auth.jwt()->>'email','')='abde-ghafor@hotmail.fr' then
    new.priority:=coalesce(new.priority,person.priority);
  elsif coalesce(person.priority,false) then
    new.status='approved'; new.priority=true;
  else
    new.status='pending'; new.priority=false;
  end if;
  return new;
end; $$;
drop trigger if exists trg_registration_allowed_before on public.player_registrations;
create trigger trg_registration_allowed_before before insert on public.player_registrations for each row execute function public.enforce_allowed_registration();
drop policy if exists "public can register when open" on public.player_registrations;
create policy "public can register when open" on public.player_registrations for insert to anon, authenticated with check (
  allowed_player_id is not null
  and ((status='pending' and priority=false) or (status='approved' and priority=true))
  and exists(select 1 from public.registration_settings rs where rs.id=event_id and rs.is_open=true)
  and exists(select 1 from public.registration_allowed_players ap where ap.id=allowed_player_id and ap.event_id=event_id and ap.active=true)
);
