import { Router } from "express";
import type { WorkoutRepository } from "../repositories/WorkoutRepository.js";

// Routes depend on the interface, injected in — not on any concrete
// repository. Mounted behind requireAuth, so req.userId is always set.
//
// Lets a client resolve a machine (and its bleDeviceName, if any) by
// scan_token *before* starting a session — needed so the web app can
// attempt a Web Bluetooth connection first and only create a
// workout/session once that actually succeeds.
export function createMachineRouter(repo: WorkoutRepository): Router {
  const router = Router();

  router.get("/machines/:scanToken", async (req, res) => {
    const machine = await repo.getMachineByScanToken(req.params.scanToken);
    if (!machine) return res.status(404).json({ error: "Machine not found" });
    res.json(machine);
  });

  return router;
}
