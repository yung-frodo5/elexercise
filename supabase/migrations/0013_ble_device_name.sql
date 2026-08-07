-- Maps a machine to the exact BLE advertised name it connects to over Web
-- Bluetooth (browser-side, apps/web) -- null for machines with no real
-- telemetry (they keep using the fake power simulator). One machine row
-- per physical BLE device, same as serial/scan_token.
alter table public.machines add column ble_device_name text unique;

-- power_samples was previously insert-only for service_role -- telemetry
-- ingestion was assumed to always be a trusted server process. Real BLE
-- telemetry now comes from the browser, authenticated as the session's
-- owning user, not a service-role key -- so authenticated users need an
-- insert path too, scoped the same way sessions/workouts already are.
create policy "power_samples_insert_own"
  on public.power_samples for insert
  with check (owns_session(session_id));

grant insert on public.power_samples to authenticated;

-- Backfill the lab rig used to prove out this integration.
update public.machines
set ble_device_name = 'XDZN_001_834B'
where serial = 'wattcycle-lab-01';
