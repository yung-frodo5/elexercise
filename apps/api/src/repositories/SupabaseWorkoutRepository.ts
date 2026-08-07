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
import { computeSessionStats } from "../services/sessionStats.js";
import { levelForXp } from "@exercise-tracker/leveling";
import { BADGE_CHECKS, HISTORY_DEPENDENT_BADGES, currentStreakDays, weekendStreak, type BadgeEvalContext } from "./badgeChecks.js";

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
  ble_device_name: string | null;
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
    bleDeviceName: row.ble_device_name ?? undefined,
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

  // Elexir is earned 1:1 with Wh actually generated through a machine --
  // custom/manual sessions (logging a run, lifting without a machine) never
  // generate real power, so they never award anything. Read-modify-write,
  // not a fully atomic increment: acceptable because the existing
  // exclusivity invariants (one open session per workout, one active
  // session per machine) mean two concurrent awards to the *same* user's
  // row structurally can't happen today.
  // Returns the user's new level when elexir was actually awarded, so
  // callers (badge evaluation) can check level-threshold badges without a
  // second profiles read.
  private async awardElexir(userId: string, wh: number): Promise<number | undefined> {
    const earned = Math.round(wh);
    if (earned <= 0) return undefined;

    const { data, error: fetchError } = await this.client
      .from("profiles")
      .select("elexir")
      .eq("id", userId)
      .single();
    if (fetchError) throw fetchError;

    const newElexir = (data as { elexir: number }).elexir + earned;
    const newLevel = levelForXp(newElexir);
    const { error: updateError } = await this.client
      .from("profiles")
      .update({ elexir: newElexir, level: newLevel })
      .eq("id", userId);
    if (updateError) throw updateError;
    return newLevel;
  }

  /** Distinct UTC calendar dates (YYYY-MM-DD, descending) this user has completed a session on. */
  private async completedSessionDates(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("sessions")
      .select("started_at, workouts!inner(user_id)")
      .eq("workouts.user_id", userId)
      .eq("status", "completed");
    if (error) throw error;

    const dates = new Set<string>();
    for (const row of (data ?? []) as unknown as { started_at: string }[]) {
      dates.add(row.started_at.slice(0, 10));
    }
    return [...dates].sort().reverse();
  }

  private async completedSessionCount(userId: string): Promise<number> {
    const { count, error } = await this.client
      .from("sessions")
      .select("id, workouts!inner(user_id)", { count: "exact", head: true })
      .eq("workouts.user_id", userId)
      .eq("status", "completed");
    if (error) throw error;
    return count ?? 0;
  }

  // Checks every badge this repository knows how to evaluate (see
  // badgeChecks.ts) against the badges this user hasn't already earned,
  // and records any newly-earned ones. Called for every session close
  // (not just machine sessions -- several badges, like the streak/date
  // ones, apply to manual sessions too), after any elexir award for this
  // same close, so newLevel reflects it.
  private async evaluateAndAwardBadges(ctx: {
    userId: string;
    startedAt: string;
    durationS: number;
    totalEnergyJoules?: number;
    peakPowerW?: number;
    newLevel?: number;
  }): Promise<void> {
    const { data: earnedRows, error: earnedError } = await this.client
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", ctx.userId);
    if (earnedError) throw earnedError;
    const earnedIds = new Set(((earnedRows ?? []) as { badge_id: string }[]).map((r) => r.badge_id));

    const checkedNames = Object.keys(BADGE_CHECKS);
    const { data: badgeRows, error: badgeError } = await this.client
      .from("badges")
      .select("id, name")
      .in("name", checkedNames);
    if (badgeError) throw badgeError;

    const unearned = ((badgeRows ?? []) as { id: string; name: string }[]).filter((b) => !earnedIds.has(b.id));
    if (unearned.length === 0) return;

    const startDate = new Date(ctx.startedAt);
    const dateStr = ctx.startedAt.slice(0, 10);

    let completedSessionCount = 0;
    let streakDays = 0;
    let consecutiveFullWeekends = 0;
    if (unearned.some((b) => HISTORY_DEPENDENT_BADGES.has(b.name))) {
      const dates = await this.completedSessionDates(ctx.userId);
      completedSessionCount = await this.completedSessionCount(ctx.userId);
      streakDays = currentStreakDays(dates, dateStr);
      consecutiveFullWeekends = weekendStreak(dates, dateStr);
    }

    let isAnniversary = false;
    if (unearned.some((b) => b.name === "Anniversary Amp")) {
      const { data: profileRow, error: profileError } = await this.client
        .from("profiles")
        .select("created_at")
        .eq("id", ctx.userId)
        .single();
      if (profileError) throw profileError;
      const createdAt = new Date((profileRow as { created_at: string }).created_at);
      isAnniversary =
        startDate.getUTCFullYear() > createdAt.getUTCFullYear() &&
        startDate.getUTCMonth() === createdAt.getUTCMonth() &&
        startDate.getUTCDate() === createdAt.getUTCDate();
    }

    const evalContext: BadgeEvalContext = {
      completedSessionCount,
      streakDays,
      consecutiveFullWeekends,
      totalEnergyJoules: ctx.totalEnergyJoules,
      peakPowerW: ctx.peakPowerW,
      durationS: ctx.durationS,
      newLevel: ctx.newLevel,
      startHourUtc: startDate.getUTCHours(),
      month: startDate.getUTCMonth() + 1,
      day: startDate.getUTCDate(),
      isAnniversary,
    };

    const toAward = unearned.filter((b) => BADGE_CHECKS[b.name]?.(evalContext));
    if (toAward.length === 0) return;

    const { error: insertError } = await this.client
      .from("user_badges")
      .insert(toAward.map((b) => ({ user_id: ctx.userId, badge_id: b.id })));
    if (insertError) throw insertError;
  }

  // Computes and persists one session's completed-state stats: queries its
  // power_samples once, derives avg/peak/energy from them (left unset if
  // there are none), and duration from wall-clock started_at/ended_at
  // (independent of sample coverage, so it's always set). Shared by every
  // path that can flip a session out of in_progress, so none of them leave
  // stats null (or skip an elexir award) just because they close a session
  // as a side effect rather than through the explicit "Stop" action.
  private async computeAndCloseSession(
    session: { id: string; startedAt: string; source: Session["source"]; ownerUserId: string },
    endedAt: string,
    extra: { details?: SessionDetails } = {}
  ): Promise<void> {
    const { data: sampleRows, error: samplesError } = await this.client
      .from("power_samples")
      .select("t_ms, power_w")
      .eq("session_id", session.id)
      .order("t_ms");
    if (samplesError) throw samplesError;

    const samples = ((sampleRows ?? []) as { t_ms: number; power_w: number }[]).map((row) => ({
      tMs: row.t_ms,
      powerW: row.power_w,
    }));
    const stats = computeSessionStats(samples);
    const durationS = Math.round((new Date(endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000);

    const { error } = await this.client
      .from("sessions")
      .update({
        status: "completed",
        ended_at: endedAt,
        duration_s: durationS,
        ...(stats
          ? { avg_power_w: stats.avgPowerW, peak_power_w: stats.peakPowerW, total_energy_joules: stats.totalEnergyJoules }
          : {}),
        ...(extra.details ? { details: extra.details } : {}),
      })
      .eq("id", session.id);
    if (error) throw error;

    let newLevel: number | undefined;
    if (session.source === "machine" && stats) {
      newLevel = await this.awardElexir(session.ownerUserId, stats.totalEnergyJoules / 3600);
    }

    // Every session close (not just machine sessions -- e.g. the streak
    // and calendar-date badges apply to manual sessions too) gets checked
    // against every badge this repository can currently evaluate.
    await this.evaluateAndAwardBadges({
      userId: session.ownerUserId,
      startedAt: session.startedAt,
      durationS,
      totalEnergyJoules: stats?.totalEnergyJoules,
      peakPowerW: stats?.peakPowerW,
      newLevel,
    });
  }

  // Only one session is ever open at a time. Called before inserting a new
  // one (so starting a session closes whatever was previously open) and
  // when ending a workout (so nothing is left dangling in_progress). Returns
  // the ids of whatever got closed, so callers can react to those specific
  // sessions no longer being in_progress. ownerUserId is the workout's
  // owner -- every session on it belongs to the same user, so callers that
  // already know that (all three do) just pass it through instead of this
  // re-deriving it via a join.
  private async closeOpenSessions(workoutId: string, endedAt: string, ownerUserId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("sessions")
      .select("id, started_at, source")
      .eq("workout_id", workoutId)
      .eq("status", "in_progress");
    if (error) throw error;

    const rows = (data ?? []) as { id: string; started_at: string; source: Session["source"] }[];
    await Promise.all(
      rows.map((row) =>
        this.computeAndCloseSession(
          { id: row.id, startedAt: row.started_at, source: row.source, ownerUserId },
          endedAt
        )
      )
    );
    return rows.map((row) => row.id);
  }

  // A machine only ever has one active session, across ALL users -- not
  // just the current one. Physically only one person can be on a machine
  // at a time, so scanning into one someone else is actively on ends
  // their session (but not their workout -- they might resume manually).
  // Unlike closeOpenSessions, these rows can belong to a DIFFERENT user
  // than the one calling startMachineSession, so ownership has to come
  // from a join, not a passed-in id. source is always "machine" here by
  // construction (filtered by machine_id).
  private async closeActiveSessionsOnMachine(machineId: string, endedAt: string): Promise<string[]> {
    const { data, error } = await this.client
      .from("sessions")
      .select("id, started_at, workouts!inner(user_id)")
      .eq("machine_id", machineId)
      .eq("status", "in_progress");
    if (error) throw error;

    // Without generated DB types, supabase-js's default overload types
    // every embedded relation as an array regardless of actual FK
    // cardinality -- verified directly against the running Postgres
    // instance that PostgREST/supabase-js actually returns `workouts` here
    // as a single object at runtime (workout_id is many-to-one), so the
    // array-shaped static type is simply wrong; cast through `unknown` to
    // match reality instead of what the type checker infers.
    const rows = (data ?? []) as unknown as { id: string; started_at: string; workouts: { user_id: string } }[];
    await Promise.all(
      rows.map((row) =>
        this.computeAndCloseSession(
          { id: row.id, startedAt: row.started_at, source: "machine", ownerUserId: row.workouts.user_id },
          endedAt
        )
      )
    );
    return rows.map((row) => row.id);
  }

  async startMachineSession(
    userId: string,
    scanToken: string
  ): Promise<{ workout: Workout; session: Session; closedSessionIds?: string[] }> {
    const machine = await this.getMachineByScanToken(scanToken);
    if (!machine) throw new MachineNotFoundError(scanToken);

    const workoutRow = await this.findOrCreateCurrentWorkout(userId);
    const endedAt = new Date().toISOString();
    const closedOwn = await this.closeOpenSessions(workoutRow.id, endedAt, userId);
    const closedOnMachine = await this.closeActiveSessionsOnMachine(machine.id, endedAt);
    const sessionRow = await this.insertSession(workoutRow.id, {
      machineId: machine.id,
      source: "machine",
      activityType: machine.type,
    });

    const closedSessionIds = [...closedOwn, ...closedOnMachine];
    return {
      workout: rowToWorkout(workoutRow),
      session: rowToSession(sessionRow),
      ...(closedSessionIds.length ? { closedSessionIds } : {}),
    };
  }

  async startManualSession(
    userId: string,
    activityType: string
  ): Promise<{ workout: Workout; session: Session; closedSessionIds?: string[] }> {
    const workoutRow = await this.findOrCreateCurrentWorkout(userId);
    const closedSessionIds = await this.closeOpenSessions(workoutRow.id, new Date().toISOString(), userId);
    const sessionRow = await this.insertSession(workoutRow.id, {
      machineId: null,
      source: "manual",
      activityType,
    });

    return {
      workout: rowToWorkout(workoutRow),
      session: rowToSession(sessionRow),
      ...(closedSessionIds.length ? { closedSessionIds } : {}),
    };
  }

  async endSession(userId: string, sessionId: string, details?: SessionDetails): Promise<Session> {
    // Sessions don't carry user_id directly — ownership is verified through
    // the parent workout via an inner join before allowing the mutation.
    const { data: owned, error: ownedError } = await this.client
      .from("sessions")
      .select("id, started_at, source, workouts!inner(user_id)")
      .eq("id", sessionId)
      .eq("workouts.user_id", userId)
      .maybeSingle();
    if (ownedError) throw ownedError;
    if (!owned) throw new SessionNotFoundError(sessionId);

    const ownedRow = owned as { started_at: string; source: Session["source"] };
    await this.computeAndCloseSession(
      { id: sessionId, startedAt: ownedRow.started_at, source: ownedRow.source, ownerUserId: userId },
      new Date().toISOString(),
      { details }
    );

    const { data, error } = await this.client.from("sessions").select("*").eq("id", sessionId).single();
    if (error) throw error;
    return rowToSession(data as SessionRow);
  }

  async endWorkout(userId: string, workoutId: string): Promise<Workout & { closedSessionIds?: string[] }> {
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

    const closedSessionIds = await this.closeOpenSessions(workoutId, endedAt, userId);

    return { ...rowToWorkout(data as WorkoutRow), ...(closedSessionIds.length ? { closedSessionIds } : {}) };
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

  async insertPowerSample(sessionId: string, tMs: number, powerW: number): Promise<void> {
    const { error } = await this.client
      .from("power_samples")
      .insert({ session_id: sessionId, t_ms: tMs, power_w: powerW });
    if (error) throw error;
  }
}
