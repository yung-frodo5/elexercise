-- Guard against drift: at least one environment's profiles table ended up
-- with a composite primary key on (id, display_name) instead of just id as
-- 0001 always specified (likely a manual dashboard edit outside this
-- migration history, not anything applied through it). display_name was
-- never meant to be part of a row's identity, and the mismatch blocks the
-- friends table's FKs below, which reference profiles(id) alone. id is
-- already unique on its own (1:1 with auth.users.id via profiles_id_fkey),
-- so this is safe to correct. No-ops where the key is already id-only.
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conrelid = 'public.profiles'::regclass
      and c.contype = 'p'
      and c.conkey = array[(
        select attnum from pg_attribute
        where attrelid = 'public.profiles'::regclass and attname = 'id'
      )]
  ) then
    alter table public.profiles drop constraint profiles_pkey;
    alter table public.profiles add primary key (id);
  end if;
end $$;

-- Leaderboard: any authenticated user can read other users' profiles (to
-- look a friend up by display_name and to show their elexir on the
-- leaderboard). profiles_select_own (0001) already covers a user's own row
-- via a separate permissive policy -- multiple permissive SELECT policies
-- OR together in Postgres, so this just adds broader read access on top.
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- One-directional: a user's own friends list, not a mutual relationship --
-- adding someone doesn't require their acceptance, matching a simple "who
-- do I want to see on my leaderboard" model rather than a request/accept flow.
create table public.friends (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  friend_id  uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  constraint friends_not_self check (user_id <> friend_id)
);

alter table public.friends enable row level security;

create policy "friends_select_own"
  on public.friends for select using (user_id = auth.uid());
create policy "friends_insert_own"
  on public.friends for insert with check (user_id = auth.uid());
create policy "friends_delete_own"
  on public.friends for delete using (user_id = auth.uid());

-- RLS gates which rows; GRANTs gate table access at all. New tables aren't
-- auto-exposed to the API roles, so without this PostgREST returns 42501.
grant select, insert, delete on public.friends to authenticated;
grant all on public.friends to service_role;
