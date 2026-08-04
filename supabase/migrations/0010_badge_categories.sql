-- Badges now group into a fixed set of product-defined categories, so the
-- catalog can be organized/filtered in the UI (e.g. a badges page grouped
-- by section) instead of one flat list.
alter table public.badges
  add column category text not null default 'Milestones'
  check (category in ('Milestones', 'Consistency/Streaks', 'Performance', 'Social/Community', 'Fun/Quirky'));

-- No real default going forward -- every badge inserted from here on
-- should specify its own category explicitly.
alter table public.badges alter column category drop default;

-- Optional punny alternate title, distinct from the catalog's primary
-- `name` -- e.g. name "Community Watt", tagline "Stronger Together". Null
-- for the badges that don't have a separate flavor title.
alter table public.badges add column tagline text;

-- Every badge gets a display emoji -- doubles as its avatar art when a
-- user selects it as their profile avatar (see profiles.selected_badge_id).
alter table public.badges add column emoji text not null default '🏅';
alter table public.badges alter column emoji drop default;
