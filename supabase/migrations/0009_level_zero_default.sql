-- The leveling system now starts at level 0 (unranked, below the first
-- named tier's threshold) rather than level 1 -- see packages/leveling.
-- The column's old default (1, from 0005) is now wrong for a brand-new
-- profile with 0 elexir. Fix the default going forward, and backfill any
-- existing profile that's still sitting at the old default with no elexir
-- earned yet (anyone who *has* earned elexir already has a correct,
-- freshly-computed level from awardElexir, so this only touches rows that
-- were never touched by that path).
alter table public.profiles alter column level set default 0;

update public.profiles set level = 0 where elexir = 0;
