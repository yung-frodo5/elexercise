// Core domain types shared across api, web, and mobile.
// Changing a field here is a contract change for every app — bump thoughtfully.
//
// Machine/Workout/Session/PowerSample model for power-generating exercise
// equipment. SQL tables live in supabase/migrations/0002_machine_session_schema.sql.

export type MachineStatus = "available" | "in_use" | "offline";

export interface Machine {
  id: string;
  type: string;
  model: string;
  serial: string;
  scanToken: string;
  status: MachineStatus;
  lastSeenAt?: string; // ISO 8601 timestamp
}

export type WorkoutStatus = "in_progress" | "completed";

export interface Workout {
  id: string;
  userId: string;
  startedAt: string; // ISO 8601 timestamp
  endedAt?: string; // ISO 8601 timestamp
  status: WorkoutStatus;
  createdAt: string; // ISO 8601 timestamp
}

export type SessionSource = "machine" | "manual";
export type SessionStatus = "in_progress" | "completed";

// Freeform fitness details, captured when a session ends. Named fields for
// type guidance on the common cases; still stored as jsonb, so the schema
// doesn't need a migration every time a new field shows up.
export interface SessionDetails {
  durationMinutes?: number;
  weightKg?: number;
  reps?: number;
  sets?: number;
  distanceKm?: number;
  calories?: number;
  notes?: string;
}

export interface Session {
  id: string;
  workoutId: string;
  machineId?: string; // present only when source === "machine"
  source: SessionSource;
  activityType: string;
  startedAt: string; // ISO 8601 timestamp
  endedAt?: string; // ISO 8601 timestamp
  status: SessionStatus;
  avgPowerW?: number;
  peakPowerW?: number;
  totalEnergyJoules?: number;
  durationS?: number;
  details?: SessionDetails;
}

export interface PowerSample {
  sessionId: string;
  tMs: number;
  powerW: number;
}

// A workout with its sessions attached — the shape returned by GET /workouts/:id.
export type WorkoutWithSessions = Workout & { sessions: Session[] };

// Profile/Badge types are snake_case, unlike everything above — profiles
// and badges are queried directly from Supabase by clients (see
// apps/mobile/contexts/AuthContext.tsx), not mediated through apps/api's
// repository layer, so there's no snake_case -> camelCase mapping step.
// This matches the actual wire shape, not the rest of this file's convention.

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  home_region: string;
  level: number;
  elexir: number;
  // Null means "show avatar_url as normal" -- set means the user has
  // chosen one of their earned badges (see UserBadge) to display as their
  // avatar everywhere avatar_url normally would.
  selected_badge_id: string | null;
  created_at: string;
}

export type BadgeCategory = "Milestones" | "Consistency/Streaks" | "Performance" | "Social/Community" | "Fun/Quirky";

export interface Badge {
  id: string;
  name: string;
  // Punny alternate title, distinct from `name` -- null for badges that
  // don't have one (see supabase/migrations/0010_badge_categories.sql).
  tagline: string | null;
  category: BadgeCategory;
  criteria: string;
  emoji: string;
  created_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
}
