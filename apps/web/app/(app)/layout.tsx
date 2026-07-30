"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";
import { isDevBypassAuth } from "../../lib/devAuth";
import { useSupabaseSession } from "../../lib/useSession";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const bypass = isDevBypassAuth();
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  useEffect(() => {
    if (bypass) return;
    if (!loading && !session) router.replace("/");
  }, [bypass, loading, session, router]);

  if (bypass) return <>{children}</>;

  if (loading || !session) {
    return (
      <main style={{ padding: theme.spacing.xl }}>
        <p>Loading…</p>
      </main>
    );
  }

  return <>{children}</>;
}
