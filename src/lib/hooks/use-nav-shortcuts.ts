"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const SHORTCUTS: Record<string, string> = {
  "1": "/notes",
  "2": "/admin",
};

export function useNavShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't hijack Escape/Ctrl+N if a dialog or input already handled it.
      if (e.defaultPrevented) return;

      const mod = e.metaKey || e.altKey;

      if (mod && SHORTCUTS[e.key]) {
        e.preventDefault();
        router.push(SHORTCUTS[e.key]);
        return;
      }

      if (e.key === "Escape" && pathname !== "/dashboard") {
        router.push("/dashboard");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, pathname]);
}