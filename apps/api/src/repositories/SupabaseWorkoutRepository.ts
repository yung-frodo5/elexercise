import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Machine,
  Session,
  SessionDetails,
  Workout,
  WorkoutWithSessions,
} from "@exercise-tracker/shared-types";
import {
  WorkoutRepository,
  MachineNotFoundError,
  WorkoutNotFoundError,
  SessionNotFoundError,
} from "./WorkoutRepository.js";

// Row shapes as they come back from Postgres (snake_case) — mapped to the
// camelCase shared-types shapes below, same "row mapping" pattern the old
// CsvWorkoutRepository used.
interface MachineRow {
  id: string;
  type: string;
  model: string;
  serial: string;
  scan_token: string;
  status: Machine["status"];
  last_seen_at: string | null;
}

interface WorkoutRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  status: Workout["status"];
  created_at: string;
}

interface SessionRow {
  id: string;
  workout_id: string;
  machine_id: string | null;
  source: Session["source"];
  activity_type: string;
  started_at: string;
  ended_at: string | null;
  status: Session["status"];
  avg_power_w: number | null;
  peak_power_w: number | null;
  total_energy_joules: number | null;
  duration_s: number | null;
  details: SessionDetails | null;
}

function rowToMachine(row: MachineRow): Machine {
  return {
    id: row.id,
    type: row.type,
    model: row.model,
    serial: row.serial,
    scanToken: row.scan_token,
    status: row.status,
    lastSeenAt: row.last_seen_at ?? undefined,
  };
}

function rowToWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    userId: row.user_id,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    workoutId: row.workout_id,
    machineId: row.machine_id ?? undefined,
    source: row.source,
    activityType: row.activity_type,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? undefined,
    status: row.status,
    avgPowerW: row.avg_power_w ?? undefined,
    peakPowerW: row.peak_power_w ?? undefined,
    totalEnergyJoules: row.total_energy_joules ?? undefined,
    durationS: row.duration_s ?? undefined,
    details: row.details ?? undefined,
  };
}

/**
 * Supabase-backed implementation of WorkoutRepository.
 *
 * Constructed with the service-role key — it bypasses RLS, so every query
 * here filters by userId explicitly. RLS in the migration is defense-in-depth
 * for any future direct-from-client access, not the only gate.
 */
export class SupabaseWorkoutRepository implements WorkoutRepository {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  async getMachineByScanToken(scanToken: string): Promise<Machine | null> {
    const { data, error } = await this.client
      .from("machines")
      .select("*")
      .eq("scan_token", scanToken)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToMachine(data as MachineRow) : null;
  }

  private async findOrCreateCurrentWorkout(userId: string): Promise<WorkoutRow> {
    const { data: existing, error: findError } = await this.client
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (findError) throw findError;
    if (existing) return existing as WorkoutRow;

    const { data: created, error: createError } = await this.client
      .from("workouts")
      .insert({ user_id: userId })
      .select("*")
      .single();
    if (createError) throw createError;
    return created as WorkoutRow;
  }

  private async insertSession(
    workoutId: string,
    fields: { machineId: string | null; source: Session["source"]; activityType: string }
  ): Promise<SessionRow> {
    const { data, error } = await this.client
      .from("sessions")
      .insert({
        workout_id: workoutId,
        machine_id: fields.machineId,
        source: fields.source,
        activity_type: fields.activityType,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as SessionRow;
  }

  // Only one session is ever open at a time. Called before inserting a new
  // one (so starting a session closes whatever was previously open) and
  // when ending a workout (so nothing is left dangling in_progress).
  private async closeOpenSessions(workoutId: string, endedAt: string): Promise<void> {
    const { error } = await this.client
      .from("sessions")
      .update({ status: "completed", ended_at: endedAt })
      .eq("workout_id", workoutId)
      .eq("status", "in_progress");
    if (error) throw error;
  }

  // A machine only ever has one active session, across ALL users -- not
  // just the current one. Physically only one person can be on a machine
  // at a time, so scanning into one someone else is actively on ends
  // their session (but not their workout -- they might resume manually).
  private async closeActiveSessionsOnMachine(machineId: string, endedAt: string): Promise<void> {
    const { error } = await this.client
      .from("sessions")
      .update({ status: "completed", ended_at: endedAt })
      .eq("machine_id", machineId)
      .eq("status", "in_progress");
    if (error) throw error;
  }

  async startMachineSession(
    userId: string,
    scanToken: string
  ): Promise<{ workout: Workout; session: Session }> {
    const machine = await this.getMachineByScanToken(scanToken);
    if (!machine) throw new MachineNotFoundError(scanToken);

    const workoutRow = await this.findOrCreateCurrentWorkout(userId);
    const endedAt = new Date().toISOString();
    await this.closeOpenSessions(workoutRow.id, endedAt);
    await this.closeActiveSessionsOnMachine(machine.id, endedAt);
    const sessionRow = await this.insertSession(workoutRow.id, {
      machineId: machine.id,
      source: "machine",
      activityType: machine.type,
    });

    return { workout: rowToWorkout(workoutRow), session: rowToSession(sessionRow) };
  }

  async startManualSession(
    userId: string,
    activityType: string
  ): Promise<{ workout: Workout; session: Session }> {
    const workoutRow = await this.findOrCreateCurrentWorkout(userId);
    await this.closeOpenSessions(workoutRow.id, new Date().toISOString());
    const sessionRow = await this.insertSession(workoutRow.id, {
      machineId: null,
      source: "manual",
      activityType,
    });

    return { workout: rowToWorkout(workoutRow), session: rowToSession(sessionRow) };
  }

  async endSession(userId: string, sessionId: string, details?: SessionDetails): Promise<Session> {
    // Sessions don't carry user_id directly — ownership is verified through
    // the parent workout via an inner join before allowing the mutation.
    const { data: owned, error: ownedError } = await this.client
      .from("sessions")
      .select("id, workouts!inner(user_id)")
      .eq("id", sessionId)
      .eq("workouts.user_id", userId)
      .maybeSingle();
    if (ownedError) throw ownedError;
    if (!owned) throw new SessionNotFoundError(sessionId);

    const { data, error } = await this.client
      .from("sessions")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        ...(details ? { details } : {}),
      })
      .eq("id", sessionId)
      .select("*")
      .single();
    if (error) throw error;
    return rowToSession(data as SessionRow);
  }

  async endWorkout(userId: string, workoutId: string): Promise<Workout> {
    const endedAt = new Date().toISOString();

    const { data, error } = await this.client
      .from("workouts")
      .update({ status: "completed", ended_at: endedAt })
      .eq("id", workoutId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new WorkoutNotFoundError(workoutId);

    await this.closeOpenSessions(workoutId, endedAt);

    return rowToWorkout(data as WorkoutRow);
  }

  async getCurrentWorkout(userId: string): Promise<Workout | null> {
    const { data, error } = await this.client
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToWorkout(data as WorkoutRow) : null;
  }

  async getWorkoutById(userId: string, workoutId: string): Promise<WorkoutWithSessions | null> {
    const { data: workoutRow, error: workoutError } = await this.client
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .eq("user_id", userId)
      .maybeSingle();
    if (workoutError) throw workoutError;
    if (!workoutRow) return null;

    const { data: sessionRows, error: sessionsError } = await this.client
      .from("sessions")
      .select("*")
      .eq("workout_id", workoutId)
      .order("started_at", { ascending: true });
    if (sessionsError) throw sessionsError;

    return {
      ...rowToWorkout(workoutRow as WorkoutRow),
      sessions: ((sessionRows ?? []) as SessionRow[]).map(rowToSession),
    };
  }

  async listWorkouts(userId: string): Promise<Workout[]> {
    const { data, error } = await this.client
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as WorkoutRow[]).map(rowToWorkout);
  }
}
