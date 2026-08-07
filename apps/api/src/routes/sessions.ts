import { Router } from "express";
import type { SessionDetails } from "@exercise-tracker/shared-types";
import type { WorkoutRepository } from "../repositories/WorkoutRepository.js";
import { MachineNotFoundError, SessionNotFoundError } from "../repositories/WorkoutRepository.js";
import { startFakePowerGeneration, stopFakePowerGeneration } from "../services/fakePowerSimulator.js";

// Routes depend on the interface, injected in — not on any concrete
// repository. Mounted behind requireAuth, so req.userId is always set.
export function createSessionRouter(repo: WorkoutRepository): Router {
  const router = Router();

  router.post("/sessions", async (req, res) => {
    const { scanToken } = req.body as { scanToken?: string };
    if (!scanToken) return res.status(400).json({ error: "scanToken is required" });
    try {
      const { closedSessionIds, ...result } = await repo.startMachineSession(req.userId!, scanToken);
      for (const id of closedSessionIds ?? []) stopFakePowerGeneration(id);

      // Machines with a real BLE mapping get their power_samples written by
      // the browser (Web Bluetooth) instead — starting the fake simulator
      // too would interleave simulated samples into the same session.
      const machine = await repo.getMachineByScanToken(scanToken);
      if (!machine?.bleDeviceName) {
        startFakePowerGeneration(result.session.id, result.session.activityType, (tMs, powerW) =>
          repo.insertPowerSample(result.session.id, tMs, powerW)
        );
      }

      res.status(201).json(result);
    } catch (err) {
      if (err instanceof MachineNotFoundError) return res.status(404).json({ error: err.message });
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.post("/sessions/manual", async (req, res) => {
    const { activityType } = req.body as { activityType?: string };
    if (!activityType) return res.status(400).json({ error: "activityType is required" });
    try {
      const { closedSessionIds, ...result } = await repo.startManualSession(req.userId!, activityType);
      for (const id of closedSessionIds ?? []) stopFakePowerGeneration(id);
      startFakePowerGeneration(result.session.id, result.session.activityType, (tMs, powerW) =>
        repo.insertPowerSample(result.session.id, tMs, powerW)
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.post("/sessions/:id/end", async (req, res) => {
    const { details } = req.body as { details?: SessionDetails };
    try {
      const session = await repo.endSession(req.userId!, req.params.id, details);
      stopFakePowerGeneration(req.params.id);
      res.json(session);
    } catch (err) {
      if (err instanceof SessionNotFoundError) return res.status(404).json({ error: err.message });
      res.status(400).json({ error: (err as Error).message });
    }
  });

  return router;
}
