import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Machine, Session, SessionWorkout } from "@exercise-tracker/shared-types";
import {
  SessionRepository,
  MachineNotFoundError,
  SessionNotFoundError,
} from "./SessionRepository.js";

// Row shapes as they come back from Postgres (snake_case) — mapped to the
// camelCase shared-types shapes below, same "row mapping" pattern as
// CsvWorkoutRepository.
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
  status: SessionWorkout["status"];
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

function rowToWorkout(row: WorkoutRow): SessionWorkout {
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
  };
}

/**
 * Supabase-backed implementation of SessionRepository.
 *
 * Constructed with the service-role key — it bypasses RLS, so every query
 * here filters by userId explicitly. RLS in the migration is defense-in-depth
 * for any future direct-from-client access, not the only gate.
 */
export class SupabaseSessionRepository implements SessionRepository {
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

  async startMachineSession(
    userId: string,
    scanToken: string
  ): Promise<{ workout: SessionWorkout; session: Session }> {
    const machine = await this.getMachineByScanToken(scanToken);
    if (!machine) throw new MachineNotFoundError(scanToken);

    const workoutRow = await this.findOrCreateCurrentWorkout(userId);
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
  ): Promise<{ workout: SessionWorkout; session: Session }> {
    const workoutRow = await this.findOrCreateCurrentWorkout(userId);
    const sessionRow = await this.insertSession(workoutRow.id, {
      machineId: null,
      source: "manual",
      activityType,
    });

    return { workout: rowToWorkout(workoutRow), session: rowToSession(sessionRow) };
  }

  async endSession(sessionId: string): Promise<Session> {
    const { data, error } = await this.client
      .from("sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", sessionId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new SessionNotFoundError(sessionId);
    return rowToSession(data as SessionRow);
  }

  async getCurrentWorkout(userId: string): Promise<SessionWorkout | null> {
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

  async getWorkoutById(
    workoutId: string
  ): Promise<(SessionWorkout & { sessions: Session[] }) | null> {
    const { data: workoutRow, error: workoutError } = await this.client
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
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
}
