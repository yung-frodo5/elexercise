-- profiles predates the "new tables aren't auto-exposed to Data API roles"
-- fix every later migration accounts for -- service_role has never had any
-- grant on it at all. Needed now because this is the first time apps/api
-- writes to profiles (elexir/level awarding).
grant all on public.profiles to service_role;
