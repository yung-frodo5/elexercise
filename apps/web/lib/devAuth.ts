/** Local UI only — set NEXT_PUBLIC_DEV_BYPASS_AUTH=1 in apps/web/.env.local (never in prod). */
export function isDevBypassAuth(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "1"
  );
}
