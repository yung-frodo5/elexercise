-- Publish power_samples so clients can subscribe to new telemetry rows via
-- Supabase Realtime (used by the web app's live power chart). Realtime
-- still enforces the existing power_samples_select_own RLS policy per
-- connection -- this only controls which tables emit change events at all.
alter publication supabase_realtime add table public.power_samples;
