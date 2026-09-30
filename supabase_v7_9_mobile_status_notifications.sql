-- Sunday Football V7.9
-- Device-based registration protection, personal status persistence, and notification events.

alter table public.player_registrations
  add column if not exists device_id text;

create index if not exists player_registrations_event_device_idx
  on public.player_registrations(event_id, device_id);

create table if not exists public.tournament_notifications (
  id uuid primary key default gen_random_uuid(),
  event_id text not null default 'current',
  kind text not null default 'info',
  title text not null,
  body text not null,
  team_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tournament_notifications enable row level security;

drop policy if exists "public can read tournament notifications" on public.tournament_notifications;
create policy "public can read tournament notifications"
on public.tournament_notifications
for select to anon, authenticated
using (event_id = 'current');

drop policy if exists "admin can insert tournament notifications" on public.tournament_notifications;
create policy "admin can insert tournament notifications"
on public.tournament_notifications
for insert to authenticated
with check (auth.jwt()->>'email'='abde-ghafor@hotmail.fr');

alter table public.tournament_notifications replica identity full;

create or replace function public.enforce_device_registration_limit()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  device_count integer;
begin
  if new.device_id is null or btrim(new.device_id) = '' then
    return new;
  end if;

  select count(*) into device_count
  from public.player_registrations
  where event_id = new.event_id
    and device_id = new.device_id
    and coalesce(status,'pending') in ('approved','pending')
    and id <> coalesce(new.id, gen_random_uuid());

  if device_count >= 2 then
    raise exception 'Ce téléphone a déjà atteint la limite de 2 inscriptions.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_device_registration_limit on public.player_registrations;
create trigger trg_device_registration_limit
before insert on public.player_registrations
for each row execute function public.enforce_device_registration_limit();

do $$
begin
  alter publication supabase_realtime add table public.tournament_notifications;
exception when duplicate_object then null;
end $$;


create or replace function public.get_my_registration_status(p_event_id text, p_device_id text)
returns table (
  id uuid,
  name text,
  city text,
  status text,
  priority boolean,
  allowed_player_id uuid,
  device_id text,
  created_at timestamptz
)
language sql
security definer
set search_path=public
as $$
  select r.id,r.name,r.city,r.status,r.priority,r.allowed_player_id,r.device_id,r.created_at
  from public.player_registrations r
  where r.event_id = p_event_id
    and r.device_id = p_device_id
  order by r.created_at desc;
$$;

revoke all on function public.get_my_registration_status(text,text) from public;
grant execute on function public.get_my_registration_status(text,text) to anon, authenticated;
