"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Target02Icon,
  Book02Icon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  label: string;
  icon: IconSvgElement;
}

const topItems: ActivityItem[] = [
  { id: "dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { id: "self-management", label: "Self-Management", icon: Target02Icon },
  { id: "journal", label: "Journal", icon: Book02Icon },
];

const bottomItems: ActivityItem[] = [
  { id: "settings", label: "Settings", icon: Settings02Icon },
];

export function ActivityBar({
  active = "dashboard",
  onSelect,
}: {
  active?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="flex h-full w-12 shrink-0 flex-col items-center justify-between border-r border-border/60 bg-muted/20 py-2">
      <div className="flex flex-col items-center gap-1">
        {topItems.map((item) => (
          <ActivityButton
            key={item.id}
            item={item}
            active={active === item.id}
            onClick={() => onSelect?.(item.id)}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-1">
        {bottomItems.map((item) => (
          <ActivityButton
            key={item.id}
            item={item}
            active={active === item.id}
            onClick={() => onSelect?.(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ActivityButton({
  item,
  active,
  onClick,
}: {
  item: ActivityItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={item.label}
      aria-label={item.label}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground",
        active && "text-foreground"
      )}
    >
      {active ? (
        <span className="absolute left-0 top-1.5 h-7 w-0.5 rounded-full bg-primary" />
      ) : null}
      <HugeiconsIcon icon={item.icon} size={20} />
    </button>
  );
}
