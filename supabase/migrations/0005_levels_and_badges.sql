-- User levels/elexir and a badge catalog. No earning/leveling logic here --
-- that depends on PowerSample ingestion, which doesn't exist yet. This is
-- schema only: columns and tables for that logic to land on later.

alter table public.profiles add column level integer not null default 1;
alter table public.profiles add column elexir integer not null default 0;

-- Security fix, not just an addition: profiles has had a blanket
-- `grant update ... to authenticated` since 0001 (so users can edit their
-- own display_name/avatar/home_region). Now that level/elexir live on the
-- same row, that same broad grant would let any signed-in user set their
-- own level/elexir directly via a normal profile update. Can't edit an
-- already-applied migration, so tighten it here with a column-scoped grant.
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, home_region) on public.profiles to authenticated;

create table public.badges (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  criteria   text not null,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  user_id   uuid not null references auth.users (id) on delete cascade,
  badge_id  uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- badges: shared catalog, readable by any authenticated user. No
-- insert/update for `authenticated` -- a trusted process manages the
-- catalog, same pattern as `machines`.
alter table public.badges enable row level security;

create policy "badges_select_all"
  on public.badges for select
  using (true);

grant select on public.badges to authenticated;
grant all on public.badges to service_role;

-- user_badges: users can see their own earned badges. No insert policy for
-- `authenticated` -- badges are awarded by a trusted process, not
-- self-granted, same trust-boundary pattern as `power_samples`.
alter table public.user_badges enable row level security;

create policy "user_badges_select_own"
  on public.user_badges for select
  using (user_id = auth.uid());

grant select on public.user_badges to authenticated;
grant all on public.user_badges to service_role;
