import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { SupabaseWorkoutRepository } from "./SupabaseWorkoutRepository.js";
import { MachineNotFoundError, WorkoutNotFoundError, SessionNotFoundError } from "./WorkoutRepository.js";

// Integration tests against a real local Supabase Postgres instance — hit
// the real backend, don't mock storage. Requires `supabase start` to be
// running first (see supabase/config.toml). Defaults match local `supabase
// status` output; override via env if needed. Skipped automatically when no
// service-role key is available (e.g. CI without the stack running).
const SUPABASE_URL = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const describeIfConfigured = SERVICE_ROLE_KEY ? describe : describe.skip;

describeIfConfigured("SupabaseWorkoutRepository", () => {
  let admin: SupabaseClient;
  let repo: SupabaseWorkoutRepository;
  let userId: string;
  let otherUserId: string;
  let scanToken: string;
  let machineId: string;

  beforeEach(async () => {
    admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    repo = new SupabaseWorkoutRepository(SUPABASE_URL, SERVICE_ROLE_KEY!);

    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email: `test-${randomUUID()}@example.com`,
      email_confirm: true,
    });
    if (userError) throw userError;
    userId = userData.user!.id;

    const { data: otherUserData, error: otherUserError } = await admin.auth.admin.createUser({
      email: `test-${randomUUID()}@example.com`,
      email_confirm: true,
    });
    if (otherUserError) throw otherUserError;
    otherUserId = otherUserData.user!.id;

    scanToken = randomUUID();
    const { data: machineData, error: machineError } = await admin
      .from("machines")
      .insert({ type: "bike", model: "Test Bike 3000", serial: randomUUID(), scan_token: scanToken })
      .select("id")
      .single();
    if (machineError) throw machineError;
    machineId = (machineData as { id: string }).id;
  });

  afterEach(async () => {
    // Deleting the users cascades to workouts -> sessions -> power_samples.
    await admin.auth.admin.deleteUser(userId);
    await admin.auth.admin.deleteUser(otherUserId);
    await admin.from("machines").delete().eq("id", machineId);
  });

  it("returns null for an unknown scan token", async () => {
    expect(await repo.getMachineByScanToken("does-not-exist")).toBeNull();
  });

  it("finds a machine by scan token", async () => {
    const machine = await repo.getMachineByScanToken(scanToken);
    expect(machine?.id).toBe(machineId);
    expect(machine?.type).toBe("bike");
  });

  it("throws MachineNotFoundError when starting a session with an unknown scan token", async () => {
    await expect(repo.startMachineSession(userId, "does-not-exist")).rejects.toThrow(
      MachineNotFoundError
    );
  });

  it("starts a machine session on a fresh in-progress workout", async () => {
    const { workout, session } = await repo.startMachineSession(userId, scanToken);
    expect(workout.userId).toBe(userId);
    expect(workout.status).toBe("in_progress");
    expect(session.workoutId).toBe(workout.id);
    expect(session.source).toBe("machine");
    expect(session.machineId).toBe(machineId);
    expect(session.activityType).toBe("bike");
    expect(session.status).toBe("in_progress");
  });

  it("starts a manual session with no machine attached", async () => {
    const { session } = await repo.startManualSession(userId, "pushups");
    expect(session.source).toBe("manual");
    expect(session.machineId).toBeUndefined();
    expect(session.activityType).toBe("pushups");
  });

  it("reuses the current in-progress workout across sessions", async () => {
    const first = await repo.startMachineSession(userId, scanToken);
    const second = await repo.startManualSession(userId, "run");
    expect(second.workout.id).toBe(first.workout.id);
  });

  it("starting a new session closes whatever session was previously open", async () => {
    const first = await repo.startManualSession(userId, "run");
    const second = await repo.startManualSession(userId, "bike");

    const workout = await repo.getWorkoutById(userId, first.workout.id);
    const firstSession = workout!.sessions.find((s) => s.id === first.session.id)!;
    const secondSession = workout!.sessions.find((s) => s.id === second.session.id)!;

    expect(firstSession.status).toBe("completed");
    expect(firstSession.endedAt).toBeTruthy();
    expect(secondSession.status).toBe("in_progress");
    expect(secondSession.endedAt).toBeUndefined();
    expect(second.closedSessionIds).toEqual([first.session.id]);
  });

  it("reports no closedSessionIds when there was nothing previously open", async () => {
    const first = await repo.startManualSession(userId, "run");
    expect(first.closedSessionIds).toBeUndefined();
  });

  it("starting a machine session closes a previously open manual session", async () => {
    const manual = await repo.startManualSession(userId, "run");
    const machine = await repo.startMachineSession(userId, scanToken);

    const workout = await repo.getWorkoutById(userId, manual.workout.id);
    const manualSession = workout!.sessions.find((s) => s.id === manual.session.id)!;

    expect(manualSession.status).toBe("completed");
    expect(machine.session.status).toBe("in_progress");
    expect(machine.closedSessionIds).toEqual([manual.session.id]);
  });

  it("starting a session on a machine closes another user's active session on that same machine", async () => {
    const userA = await repo.startMachineSession(userId, scanToken);
    const userB = await repo.startMachineSession(otherUserId, scanToken);

    const userAWorkout = await repo.getWorkoutById(userId, userA.workout.id);
    const userASession = userAWorkout!.sessions.find((s) => s.id === userA.session.id)!;

    expect(userASession.status).toBe("completed");
    expect(userASession.endedAt).toBeTruthy();
    // Only the session ends — the workout itself is untouched, same as any
    // other closeOpenSessions/closeActiveSessionsOnMachine call.
    expect(userAWorkout!.status).toBe("in_progress");
    expect(userB.session.status).toBe("in_progress");
    expect(userB.closedSessionIds).toEqual([userA.session.id]);
  });

  it("regression: a user's own active session on a different machine still closes when they scan a new one", async () => {
    const otherScanToken = randomUUID();
    const { data: otherMachine, error: otherMachineError } = await admin
      .from("machines")
      .insert({ type: "rower", model: "Test Rower 3000", serial: randomUUID(), scan_token: otherScanToken })
      .select("id")
      .single();
    if (otherMachineError) throw otherMachineError;

    try {
      const first = await repo.startMachineSession(userId, scanToken);
      const second = await repo.startMachineSession(userId, otherScanToken);

      const workout = await repo.getWorkoutById(userId, first.workout.id);
      const firstSession = workout!.sessions.find((s) => s.id === first.session.id)!;

      expect(firstSession.status).toBe("completed");
      expect(second.session.status).toBe("in_progress");
    } finally {
      await admin.from("machines").delete().eq("id", (otherMachine as { id: string }).id);
    }
  });

  it("ends a session", async () => {
    const { session } = await repo.startManualSession(userId, "run");
    const ended = await repo.endSession(userId, session.id);
    expect(ended.status).toBe("completed");
    expect(ended.endedAt).toBeTruthy();
  });

  it("throws SessionNotFoundError when ending another user's session", async () => {
    const { session } = await repo.startManualSession(userId, "run");
    await expect(repo.endSession(otherUserId, session.id)).rejects.toThrow(SessionNotFoundError);
  });

  it("persists details when ending a session", async () => {
    const { session } = await repo.startManualSession(userId, "run");
    const ended = await repo.endSession(userId, session.id, {
      durationMinutes: 32,
      distanceKm: 5.2,
      notes: "felt good",
    });
    expect(ended.details).toEqual({ durationMinutes: 32, distanceKm: 5.2, notes: "felt good" });

    const fetched = await repo.getWorkoutById(userId, session.workoutId);
    const fetchedSession = fetched!.sessions.find((s) => s.id === session.id)!;
    expect(fetchedSession.details).toEqual({ durationMinutes: 32, distanceKm: 5.2, notes: "felt good" });
  });

  it("leaves details undefined when ending a session without any", async () => {
    const { session } = await repo.startManualSession(userId, "run");
    const ended = await repo.endSession(userId, session.id);
    expect(ended.details).toBeUndefined();
  });

  it("computes avg/peak/energy/duration when ending a session with recorded power samples", async () => {
    const { session } = await repo.startManualSession(userId, "run");
    await repo.insertPowerSample(session.id, 0, 100);
    await repo.insertPowerSample(session.id, 1000, 100);
    await repo.insertPowerSample(session.id, 2000, 300); // peak

    const ended = await repo.endSession(userId, session.id);

    expect(ended.avgPowerW).toBeCloseTo((100 + 100 + 300) / 3, 5);
    expect(ended.peakPowerW).toBe(300);
    // Trapezoidal: (0-1s at 100W) + (1-2s ramping 100->300W, avg 200W) = 100 + 200 = 300 J.
    expect(ended.totalEnergyJoules).toBeCloseTo(300, 5);
    expect(ended.durationS).toBeGreaterThanOrEqual(0);
  });

  it("leaves avg/peak/energy undefined but still sets duration when ending a session with no power samples", async () => {
    const { session } = await repo.startManualSession(userId, "run");
    const ended = await repo.endSession(userId, session.id);

    expect(ended.avgPowerW).toBeUndefined();
    expect(ended.peakPowerW).toBeUndefined();
    expect(ended.totalEnergyJoules).toBeUndefined();
    expect(ended.durationS).toBeGreaterThanOrEqual(0);
  });

  it("computes stats for a session auto-closed by starting a new one, not just an explicit Stop", async () => {
    const first = await repo.startManualSession(userId, "run");
    await repo.insertPowerSample(first.session.id, 0, 150);
    await repo.insertPowerSample(first.session.id, 1000, 250);

    await repo.startManualSession(userId, "bike");

    const workout = await repo.getWorkoutById(userId, first.workout.id);
    const firstSession = workout!.sessions.find((s) => s.id === first.session.id)!;
    expect(firstSession.status).toBe("completed");
    expect(firstSession.avgPowerW).toBeCloseTo(200, 5);
    expect(firstSession.peakPowerW).toBe(250);
    expect(firstSession.totalEnergyJoules).toBeCloseTo(200, 5);
    expect(firstSession.durationS).toBeGreaterThanOrEqual(0);
  });

  it("ends a workout", async () => {
    const { workout, session } = await repo.startManualSession(userId, "run");
    const ended = await repo.endWorkout(userId, workout.id);
    expect(ended.status).toBe("completed");
    expect(ended.endedAt).toBeTruthy();
    expect(ended.closedSessionIds).toEqual([session.id]);
  });

  it("ending a workout also ends its still in-progress sessions", async () => {
    const { workout } = await repo.startManualSession(userId, "run");
    const { session: bikeSession } = await repo.startManualSession(userId, "bike"); // second session on the same workout

    const ended = await repo.endWorkout(userId, workout.id);

    const fetched = await repo.getWorkoutById(userId, workout.id);
    expect(fetched?.sessions).toHaveLength(2);
    for (const s of fetched!.sessions) {
      expect(s.status).toBe("completed");
      expect(s.endedAt).toBeTruthy();
    }
    // Only "bike" was still in_progress by the time endWorkout ran — "run"
    // was already closed when "bike" started.
    expect(ended.closedSessionIds).toEqual([bikeSession.id]);
  });

  it("does not touch a session the user already ended before ending the workout", async () => {
    const { workout, session } = await repo.startManualSession(userId, "run");
    const alreadyEnded = await repo.endSession(userId, session.id);

    const ended = await repo.endWorkout(userId, workout.id);

    const fetched = await repo.getWorkoutById(userId, workout.id);
    const stillThere = fetched!.sessions.find((s) => s.id === session.id)!;
    expect(stillThere.endedAt).toBe(alreadyEnded.endedAt);
    expect(ended.closedSessionIds).toBeUndefined();
  });

  it("throws WorkoutNotFoundError when ending another user's workout", async () => {
    const { workout } = await repo.startManualSession(userId, "run");
    await expect(repo.endWorkout(otherUserId, workout.id)).rejects.toThrow(WorkoutNotFoundError);
  });

  it("gets the current in-progress workout for a user", async () => {
    const { workout } = await repo.startMachineSession(userId, scanToken);
    const current = await repo.getCurrentWorkout(userId);
    expect(current?.id).toBe(workout.id);
  });

  it("returns null for getCurrentWorkout when the user has none", async () => {
    expect(await repo.getCurrentWorkout(userId)).toBeNull();
  });

  it("gets a workout by id with its sessions", async () => {
    const { workout, session } = await repo.startMachineSession(userId, scanToken);
    const fetched = await repo.getWorkoutById(userId, workout.id);
    expect(fetched?.id).toBe(workout.id);
    expect(fetched?.sessions.map((s) => s.id)).toContain(session.id);
  });

  it("returns null for an unknown workout id", async () => {
    expect(await repo.getWorkoutById(userId, randomUUID())).toBeNull();
  });

  it("returns null when fetching another user's workout by id", async () => {
    const { workout } = await repo.startMachineSession(userId, scanToken);
    expect(await repo.getWorkoutById(otherUserId, workout.id)).toBeNull();
  });

  it("lists a user's workouts, most recent first", async () => {
    const { workout: first } = await repo.startManualSession(userId, "run");
    await repo.endWorkout(userId, first.id);
    const { workout: second } = await repo.startManualSession(userId, "bike");

    const workouts = await repo.listWorkouts(userId);
    expect(workouts.map((w) => w.id)).toEqual([second.id, first.id]);
  });

  it("does not list another user's workouts", async () => {
    await repo.startManualSession(userId, "run");
    expect(await repo.listWorkouts(otherUserId)).toEqual([]);
  });

  it("inserts a power sample for a session", async () => {
    const { session } = await repo.startManualSession(userId, "run");

    await repo.insertPowerSample(session.id, 500, 210.5);

    const { data, error } = await admin
      .from("power_samples")
      .select("*")
      .eq("session_id", session.id)
      .order("t_ms");
    if (error) throw error;
    expect(data).toEqual([{ session_id: session.id, t_ms: 500, power_w: 210.5 }]);
  });

  it("inserts multiple power samples for the same session in order", async () => {
    const { session } = await repo.startManualSession(userId, "run");

    await repo.insertPowerSample(session.id, 500, 100);
    await repo.insertPowerSample(session.id, 1000, 120);

    const { data, error } = await admin
      .from("power_samples")
      .select("t_ms, power_w")
      .eq("session_id", session.id)
      .order("t_ms");
    if (error) throw error;
    expect(data).toEqual([
      { t_ms: 500, power_w: 100 },
      { t_ms: 1000, power_w: 120 },
    ]);
  });
});
