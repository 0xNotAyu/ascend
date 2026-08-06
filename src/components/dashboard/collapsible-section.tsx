"use client";

import { ReactNode, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-full items-center gap-1.5 px-2 text-left hover:bg-accent/40"
      >
        <HugeiconsIcon
          icon={open ? ArrowDown01Icon : ArrowRight01Icon}
          size={12}
          className="shrink-0 text-muted-foreground"
        />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        {typeof count === "number" ? (
          <span className={cn("ml-auto text-[11px] text-muted-foreground")}>
            {count}
          </span>
        ) : null}
      </button>
      {open ? <div className="pb-1">{children}</div> : null}
    </div>
  );
}
