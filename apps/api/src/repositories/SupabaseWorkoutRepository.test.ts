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

  it("ends a workout", async () => {
    const { workout } = await repo.startManualSession(userId, "run");
    const ended = await repo.endWorkout(userId, workout.id);
    expect(ended.status).toBe("completed");
    expect(ended.endedAt).toBeTruthy();
  });

  it("ending a workout also ends its still in-progress sessions", async () => {
    const { workout } = await repo.startManualSession(userId, "run");
    await repo.startManualSession(userId, "bike"); // second session on the same workout

    await repo.endWorkout(userId, workout.id);

    const fetched = await repo.getWorkoutById(userId, workout.id);
    expect(fetched?.sessions).toHaveLength(2);
    for (const s of fetched!.sessions) {
      expect(s.status).toBe("completed");
      expect(s.endedAt).toBeTruthy();
    }
  });

  it("does not touch a session the user already ended before ending the workout", async () => {
    const { workout, session } = await repo.startManualSession(userId, "run");
    const alreadyEnded = await repo.endSession(userId, session.id);

    await repo.endWorkout(userId, workout.id);

    const fetched = await repo.getWorkoutById(userId, workout.id);
    const stillThere = fetched!.sessions.find((s) => s.id === session.id)!;
    expect(stillThere.endedAt).toBe(alreadyEnded.endedAt);
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
});
