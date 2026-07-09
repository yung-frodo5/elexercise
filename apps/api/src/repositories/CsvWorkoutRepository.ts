import { promises as fs } from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { v4 as uuidv4 } from "uuid";
import type { Workout, NewWorkout, WorkoutUpdate, ExerciseSet } from "@exercise-tracker/shared-types";
import { WorkoutRepository, WorkoutNotFoundError } from "./WorkoutRepository.js";

// One flat row per workout; sets are stored as a JSON string in one column.
// This keeps the CSV simple (one row = one workout) instead of trying to
// normalize sets into their own file, which would require joins CSV can't do.
interface WorkoutRow {
  id: string;
  userId: string;
  date: string;
  notes: string;
  setsJson: string;
  createdAt: string;
  updatedAt: string;
}

const CSV_COLUMNS: (keyof WorkoutRow)[] = [
  "id",
  "userId",
  "date",
  "notes",
  "setsJson",
  "createdAt",
  "updatedAt",
];

function rowToWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    userId: row.userId,
    date: row.date,
    notes: row.notes || undefined,
    sets: JSON.parse(row.setsJson || "[]") as ExerciseSet[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function workoutToRow(workout: Workout): WorkoutRow {
  return {
    id: workout.id,
    userId: workout.userId,
    date: workout.date,
    notes: workout.notes ?? "",
    setsJson: JSON.stringify(workout.sets ?? []),
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
  };
}

/**
 * CSV-backed repository. Intended for early development / small-scale use.
 *
 * Known limitations (by design, not bugs):
 * - Writes are serialized through an in-process queue (`writeQueue`) so two
 *   concurrent requests can't corrupt the file. This only protects against
 *   concurrent writes from THIS process — running multiple API instances
 *   against the same CSV file is not safe. That's a signal you've outgrown
 *   CSV, not a bug to patch around.
 * - Every read parses the whole file. Fine for hundreds/low-thousands of
 *   rows; not fine for anything approaching "real" scale.
 */
export class CsvWorkoutRepository implements WorkoutRepository {
  private filePath: string;
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      const header = stringify([CSV_COLUMNS]);
      await fs.writeFile(this.filePath, header);
    }
  }

  private async readAllRows(): Promise<WorkoutRow[]> {
    await this.ensureFile();
    const content = await fs.readFile(this.filePath, "utf-8");
    if (!content.trim()) return [];
    return parse(content, { columns: true, skip_empty_lines: true }) as WorkoutRow[];
  }

  private async writeAllRows(rows: WorkoutRow[]): Promise<void> {
    const csv = stringify(rows, { header: true, columns: CSV_COLUMNS });
    await fs.writeFile(this.filePath, csv);
  }

  // Serializes a mutation against the current write queue so overlapping
  // requests don't read-modify-write over each other.
  private enqueueWrite<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.writeQueue.then(fn, fn);
    // Swallow errors here so one failed write doesn't permanently jam the
    // queue for subsequent operations; the caller still sees the rejection.
    this.writeQueue = result.catch(() => undefined);
    return result;
  }

  async getWorkouts(userId: string): Promise<Workout[]> {
    const rows = await this.readAllRows();
    return rows.filter((r) => r.userId === userId).map(rowToWorkout);
  }

  async getWorkoutById(id: string): Promise<Workout | null> {
    const rows = await this.readAllRows();
    const row = rows.find((r) => r.id === id);
    return row ? rowToWorkout(row) : null;
  }

  async addWorkout(workout: NewWorkout): Promise<Workout> {
    return this.enqueueWrite(async () => {
      const now = new Date().toISOString();
      const newWorkout: Workout = {
        ...workout,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };
      const rows = await this.readAllRows();
      rows.push(workoutToRow(newWorkout));
      await this.writeAllRows(rows);
      return newWorkout;
    });
  }

  async updateWorkout(id: string, updates: WorkoutUpdate): Promise<Workout> {
    return this.enqueueWrite(async () => {
      const rows = await this.readAllRows();
      const index = rows.findIndex((r) => r.id === id);
      if (index === -1) throw new WorkoutNotFoundError(id);

      const existing = rowToWorkout(rows[index]);
      const updated: Workout = {
        ...existing,
        ...updates,
        id: existing.id,
        userId: existing.userId,
        updatedAt: new Date().toISOString(),
      };
      rows[index] = workoutToRow(updated);
      await this.writeAllRows(rows);
      return updated;
    });
  }

  async deleteWorkout(id: string): Promise<void> {
    return this.enqueueWrite(async () => {
      const rows = await this.readAllRows();
      const next = rows.filter((r) => r.id !== id);
      if (next.length === rows.length) throw new WorkoutNotFoundError(id);
      await this.writeAllRows(next);
    });
  }
}
