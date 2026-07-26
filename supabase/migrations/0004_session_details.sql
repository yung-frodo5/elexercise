-- Freeform session details (duration, weight lifted, reps, etc.), captured
-- when a session ends -- these are usually only known once an activity is
-- done, not when it starts. Nullable, no default: absence means "no
-- details recorded," same convention as avg_power_w and friends.
alter table public.sessions add column details jsonb;
