import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWorkoutRouter } from "./routes/workouts.js";
import { CsvWorkoutRepository } from "./repositories/CsvWorkoutRepository.js";
// import { PostgresWorkoutRepository } from "./repositories/PostgresWorkoutRepository.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- This is the one line that changes when you outgrow CSV. ---
// const repo = new PostgresWorkoutRepository(process.env.DATABASE_URL!);
const repo = new CsvWorkoutRepository(
  path.join(__dirname, "../../../data/workouts.csv")
);
// ------------------------------------------------------------------

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", createWorkoutRouter(repo));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
