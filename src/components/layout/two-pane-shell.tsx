"use client";

import { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export interface NavEntry {
  id: string;
  label: string;
  icon: IconSvgElement;
  count?: number;
}

export function TwoPaneShell({
  navTitle,
  entries,
  activeId,
  onSelect,
  navFooter,
  children,
}: {
  navTitle: string;
  entries: NavEntry[];
  activeId: string;
  onSelect: (id: string) => void;
  navFooter?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex w-60 shrink-0 flex-col border-r border-border bg-muted/20">
        <div className="px-4 pb-2.5 pt-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {navTitle}
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {entries.map((entry) => {
            const isActive = activeId === entry.id;
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.id)}
                className={cn(
                  "group flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )}
              >
                <HugeiconsIcon
                  icon={entry.icon}
                  size={15}
                  className="shrink-0"
                />
                <span className="truncate">{entry.label}</span>
                {typeof entry.count === "number" ? (
                  <span
                    className={cn(
                      "ml-auto rounded-full px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
                      entry.count > 0 && "bg-background/60"
                    )}
                  >
                    {entry.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
        {navFooter ? (
          <div className="mt-auto border-t border-border p-4">{navFooter}</div>
        ) : null}
      </div>

      <div className="flex flex-1 min-w-0 flex-col">{children}</div>
    </div>
  );
}