import type { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Verification-only client — constructed with the anon key, not the
// service-role key, since all it does is ask GoTrue "whose token is this."
const authClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});

/**
 * Requires a valid Supabase-issued JWT in `Authorization: Bearer <token>`.
 * On success, attaches the verified user id to `req.userId` — route
 * handlers pass that (not anything client-supplied) to the repository.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.userId = data.user.id;
  next();
}
