-- Profiles + RLS + auto-create-on-signup. See docs/BACKEND-SCAFFOLDING.md §2-3, §6.
-- home_region is plain text for now; the grid_regions FK lands with that table.

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url   text,
  home_region  text not null default 'US-AVG',
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Own-row access only (auth.uid() is the JWT `sub` claim).
create policy "profiles_select_own"
  on public.profiles for select using (id = auth.uid());
create policy "profiles_insert_own"
  on public.profiles for insert with check (id = auth.uid());
create policy "profiles_update_own"
  on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- RLS gates which rows; GRANTs gate table access at all. New tables aren't
-- auto-exposed to the API roles, so without this PostgREST returns 42501.
grant select, insert, update on public.profiles to authenticated;

-- Auto-create a profile for every new auth user; display_name falls back to
-- the email local-part.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
