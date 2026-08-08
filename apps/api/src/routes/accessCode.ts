import { Router } from "express";

// Hardcoded rather than an env var -- keeps the real code out of the web JS
// bundle (the actual goal), which is what a client-side check would leak.
const ACCESS_CODE = "POWERTRAIN";

// Not mounted behind requireAuth -- this runs before the user has any
// session, gating whether they can even reach the sign-in/sign-up modal.
export function createAccessCodeRouter(): Router {
  const router = Router();

  router.post("/access-code/verify", (req, res) => {
    const { code } = req.body as { code?: unknown };
    const valid = typeof code === "string" && code.trim() === ACCESS_CODE;
    res.json({ valid });
  });

  return router;
}
