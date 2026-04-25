"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabase = createSupabaseBrowserClient();

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/employers/login?callbackUrl=/employers/dashboard");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
