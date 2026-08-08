-- 0013 granted authenticated users a direct INSERT path on power_samples,
-- gated only by owns_session() -- that check doesn't verify the session's
-- status or bound power_w, so any user could fabricate telemetry for their
-- own session and inflate elexir/badges. Real BLE samples now go through
-- POST /sessions/:id/power-samples instead, which validates ownership,
-- in_progress status, and a plausible power bound server-side -- so the
-- direct-write grant is no longer needed and is revoked here.
drop policy "power_samples_insert_own" on public.power_samples;
revoke insert on public.power_samples from authenticated;
