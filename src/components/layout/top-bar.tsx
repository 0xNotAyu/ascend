"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InboxIcon,
  Settings02Icon,
  Fire02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

type Screen = "dashboard" | "inbox" | "admin";

export function TopBar({
  active,
  level = 1,
  streak = 0,
}: {
  active: Screen;
  level?: number;
  streak?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && active !== "dashboard") {
        router.push("/dashboard");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, router]);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-5 backdrop-blur">
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground">
          A
        </span>
        <span className="text-sm font-semibold tracking-[0.06em]">ASCEND</span>
        <span className="rounded-md border border-brand/20 bg-brand/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-brand">
          LV {level}
        </span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1.5">
          <HugeiconsIcon icon={Fire02Icon} size={13} className="text-rose-500" />
          <span className="font-mono text-[11px] text-muted-foreground">
            {streak}d
          </span>
        </div>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-1">
          <NavIcon
            icon={InboxIcon}
            label="Inbox"
            active={active === "inbox"}
            onClick={() => router.push("/inbox")}
          />
          <NavIcon
            icon={Settings02Icon}
            label="Admin Panel"
            active={active === "admin"}
            onClick={() => router.push("/admin")}
          />
        </div>
      </div>
    </div>
  );
}

function NavIcon({
  icon,
  label,
  active,
  onClick,
}: {
  icon: typeof InboxIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} size={17} />
    </button>
  );
}