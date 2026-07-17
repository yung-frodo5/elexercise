-- Machine/Workout/Session/PowerSample schema for power-generating exercise
-- equipment. Additive groundwork alongside the CSV-backed MVP — not wired
-- into any API route yet. See docs/BACKEND-SCAFFOLDING.md (local-only, not
-- in git) for broader design rationale if available.
--
-- StrengthDetails/CardioDetails (per-session set/rep/calorie detail tables)
-- are intentionally left out of this migration — manual sessions get just
-- the base `sessions` columns for now. Revisit when manual-entry logging is
-- actually built.

-- Machines: shared reference data, not owned by any one user. `type` is
-- deliberately unconstrained (no check-enumerated list) so new machine
-- types don't require a migration.
create table public.machines (
  id           uuid primary key default gen_random_uuid(),
  type         text not null,
  model        text not null,
  serial       text not null unique,
  scan_token   text not null unique,
  status       text not null default 'available' check (status in ('available', 'in_use', 'offline')),
  last_seen_at timestamptz
);

-- Workouts: the top-level container a user owns. May span multiple
-- machines/sessions (e.g. bike, then squat rack, in one workout).
create table public.workouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at   timestamptz,
  status     text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now()
);

-- Sessions: one leg of a workout. Either tied to a Machine (power telemetry
-- follows in power_samples) or manually logged by the user — never both,
-- never neither (enforced below).
create table public.sessions (
  id                  uuid primary key default gen_random_uuid(),
  workout_id          uuid not null references public.workouts (id) on delete cascade,
  machine_id          uuid references public.machines (id),
  source              text not null check (source in ('machine', 'manual')),
  activity_type       text not null,
  started_at          timestamptz not null default now(),
  ended_at            timestamptz,
  status              text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  avg_power_w         real,
  peak_power_w        real,
  total_energy_joules real,
  duration_s          integer,
  constraint session_machine_source_check check (
    (source = 'machine' and machine_id is not null) or
    (source = 'manual'  and machine_id is null)
  )
);

-- PowerSample: 1Hz telemetry stream, machine-sourced sessions only.
-- PK (session_id, t_ms) already gives us a btree index with session_id as
-- the leading column, so "all samples for a session" is index-backed for
-- free — no separate index needed.
create table public.power_samples (
  session_id uuid not null references public.sessions (id) on delete cascade,
  t_ms       integer not null,
  power_w    real not null,
  primary key (session_id, t_ms)
);

-- RLS ownership helpers, shared across policies below.
create function public.owns_workout(_workout_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workouts w
    where w.id = _workout_id and w.user_id = auth.uid()
  );
$$;

create function public.owns_session(_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sessions s
    join public.workouts w on w.id = s.workout_id
    where s.id = _session_id and w.user_id = auth.uid()
  );
$$;

-- machines: shared reference data, readable by any authenticated user.
-- No insert/update policies for `authenticated` — machine fleet management
-- goes through the service-role key (bypasses RLS), not the phone client.
alter table public.machines enable row level security;

create policy "machines_select_all"
  on public.machines for select
  using (true);

grant select on public.machines to authenticated;
grant all on public.machines to service_role;

-- workouts: own-row access only, same pattern as profiles in 0001.
alter table public.workouts enable row level security;

create policy "workouts_select_own"
  on public.workouts for select using (user_id = auth.uid());
create policy "workouts_insert_own"
  on public.workouts for insert with check (user_id = auth.uid());
create policy "workouts_update_own"
  on public.workouts for update using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update on public.workouts to authenticated;
grant all on public.workouts to service_role;

-- sessions: gated via the parent workout's ownership.
alter table public.sessions enable row level security;

create policy "sessions_select_own"
  on public.sessions for select using (owns_workout(workout_id));
create policy "sessions_insert_own"
  on public.sessions for insert with check (owns_workout(workout_id));
create policy "sessions_update_own"
  on public.sessions for update using (owns_workout(workout_id)) with check (owns_workout(workout_id));

grant select, insert, update on public.sessions to authenticated;
grant all on public.sessions to service_role;

-- power_samples: readable by the owning user, but NOT insertable by
-- `authenticated` — telemetry ingestion is a trusted-process concern
-- (service-role key, bypasses RLS), not something the phone client should
-- be able to fabricate directly.
alter table public.power_samples enable row level security;

create policy "power_samples_select_own"
  on public.power_samples for select using (owns_session(session_id));

grant select on public.power_samples to authenticated;
grant all on public.power_samples to service_role;
