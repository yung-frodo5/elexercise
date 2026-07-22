-- Supabase pauses a hosted project after a period of database inactivity.
-- pg_cron runs entirely inside Postgres, so this needs no external caller,
-- secrets, or app code -- the database keeps itself alive.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'daily-keepalive',
  '0 0 * * *', -- once a day, midnight UTC
  $$ select 1; $$
);
