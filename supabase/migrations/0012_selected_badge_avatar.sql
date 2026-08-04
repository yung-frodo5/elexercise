-- A user can pick one of their earned badges to display as their profile
-- avatar everywhere the avatar normally shows (header, leaderboard,
-- profile page) instead of avatar_url. Null means "use avatar_url as
-- normal" (the default, unchanged behavior).
alter table public.profiles add column selected_badge_id uuid references public.badges (id) on delete set null;

-- Extend the column-scoped grant from 0005 to include the new column --
-- same self-service-editable set as display_name/avatar_url/home_region.
grant update (display_name, avatar_url, home_region, selected_badge_id) on public.profiles to authenticated;

-- RLS/column grants only enforce *whose row* can be updated, not that the
-- badge being selected actually belongs to that user -- without this, any
-- signed-in user could set selected_badge_id to any badge in the catalog,
-- including ones they haven't earned. A trigger is the only way to check
-- across tables (a `check` constraint can't reference another table).
create or replace function public.check_selected_badge_earned()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.selected_badge_id is not null and not exists (
    select 1 from public.user_badges
    where user_id = new.id and badge_id = new.selected_badge_id
  ) then
    raise exception 'Cannot select a badge that has not been earned';
  end if;
  return new;
end;
$$;

create trigger enforce_selected_badge_earned
  before update of selected_badge_id on public.profiles
  for each row
  execute function public.check_selected_badge_earned();
