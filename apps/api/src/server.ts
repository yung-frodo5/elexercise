import express from "express";
import { requireAuth } from "./middleware/auth.js";
import { createSessionRouter } from "./routes/sessions.js";
import { createWorkoutRouter } from "./routes/workouts.js";
import { SupabaseWorkoutRepository } from "./repositories/SupabaseWorkoutRepository.js";

const repo = new SupabaseWorkoutRepository(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", requireAuth, createSessionRouter(repo));
app.use("/api", requireAuth, createWorkoutRouter(repo));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
