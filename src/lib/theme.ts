import type { IconSvgElement } from "@hugeicons/react";
import {
  Target02Icon,
  Activity01Icon,
  Idea01Icon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/** Base accent tokens — pick from these for any categorized entity. */
export type Accent = "blue" | "green" | "amber" | "violet" | "rose" | "gray";

interface AccentMeta {
  text: string;
  bg: string;
  bar: string;
}

export const ACCENT: Record<Accent, AccentMeta> = {
  blue: { text: "text-brand", bg: "bg-brand/10", bar: "bg-brand" },
  green: { text: "text-success", bg: "bg-success/10", bar: "bg-success" },
  amber: { text: "text-warning", bg: "bg-warning/10", bar: "bg-warning" },
  violet: { text: "text-violet-500", bg: "bg-violet-500/10", bar: "bg-violet-500" },
  rose: { text: "text-rose-500", bg: "bg-rose-500/10", bar: "bg-rose-500" },
  gray: { text: "text-muted-foreground", bg: "bg-muted", bar: "bg-muted-foreground" },
};

/** Dashboard quest categories — colors now sourced from ACCENT, not hardcoded. */
export type Category = "career" | "workout" | "improvement";

interface CategoryMeta {
  label: string;
  icon: IconSvgElement;
  text: string;
  bg: string;
  bar: string;
}

export const CATEGORY: Record<Category, CategoryMeta> = {
  career: { label: "Career", icon: Target02Icon, ...ACCENT.blue },
  workout: { label: "Workout", icon: Activity01Icon, ...ACCENT.rose },
  improvement: { label: "Improvement", icon: Idea01Icon, ...ACCENT.violet },
};

export const ALL_FILTER_META: Pick<CategoryMeta, "label" | "icon"> = {
  label: "All",
  icon: DashboardSquare01Icon,
};

export type ScheduleType = "daily" | "weekly" | "one-time" | "yearly";

export const SCHEDULE_STYLE: Record<ScheduleType, string> = {
  daily: cn(ACCENT.blue.bg, ACCENT.blue.text),
  weekly: cn(ACCENT.violet.bg, ACCENT.violet.text),
  "one-time": cn(ACCENT.amber.bg, ACCENT.amber.text),
  yearly: cn(ACCENT.rose.bg, ACCENT.rose.text),
};

/**
 * Reusable class fragments — change spacing/borders/surfaces app-wide from here.
 * Matches design-system.md: soft corners, low-contrast surfaces, minimal shadow,
 * spacing scale (micro 4 / icon-gap 8 / component 16 / section 24 / layout 32).
 */
export const ui = {
  // Layout spacing
  gapIcon: "gap-2",
  gapComponent: "gap-4",
  spaceComponent: "space-y-4",
  spaceSection: "space-y-6",
  spaceLayout: "space-y-8",

  // Surfaces
  panel: "rounded-2xl border border-border bg-card p-4 shadow-soft",
  panelTight: "rounded-xl border border-border bg-card p-3.5 shadow-soft",
  surfaceMuted: "rounded-xl bg-muted",

  // Tags / pills
  pill:
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium",
  mentionPill:
    "inline-flex items-center gap-1 rounded-full bg-mention px-2.5 py-1 text-[13px] font-medium text-mention-foreground",

  // Buttons
  buttonPrimary:
    "rounded-xl bg-primary text-primary-foreground shadow-soft hover:opacity-90",
  buttonSecondary:
    "rounded-xl border border-border bg-background text-foreground hover:bg-muted",
  iconButton:
    "flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted",
  iconButtonActive:
    "inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-accent-foreground",

  // Progress
  progressTrack: "h-1 w-full overflow-hidden rounded-full bg-muted",
  progressTrackThin: "h-1 w-full overflow-hidden rounded-full bg-muted",
  progressFill: "h-full rounded-full bg-brand transition-all",

  // Attachment card
  attachmentCard:
    "flex items-center gap-3 rounded-xl bg-muted p-3 border border-border/60",

  // Dialog
  dialog: "rounded-3xl bg-popover p-6 shadow-dialog",
  dialogBackdrop: "bg-black/35",

  mono: "font-mono text-xs text-brand",
  sectionLabel: "text-sm font-medium text-foreground",
  caption: "text-[13px] text-muted-foreground",
} as const;

export type FolderAccent = Accent;

export const FOLDER_ACCENT: Record<string, FolderAccent> = {
  ideas: "violet",
  tasks: "blue",
  notes: "amber",
  links: "green",
  organize: "gray",
};