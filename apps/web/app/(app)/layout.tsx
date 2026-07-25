"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { theme } from "@exercise-tracker/design-tokens";
import { useSupabaseSession } from "../../lib/useSession";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSupabaseSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <main style={{ padding: theme.spacing.xl }}>
        <p>Loading…</p>
      </main>
    );
  }

  return <>{children}</>;
}
