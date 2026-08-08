import type { IconSvgElement } from "@hugeicons/react";
import {
  Target02Icon,
  Activity01Icon,
  Idea01Icon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/**
 * ── Material 3 token bridge ──────────────────────────────────────────
 * Derived from the M3 Design Kit (figma.com/design/voD6I11ZFUY7ZVPkHR0vJI).
 * Three rules carried over from that kit, applied in dark mode:
 *
 * 1. Color ROLES, not raw hexes — everything below points at CSS
 *    variables (bg-card, bg-accent, text-muted-foreground, …) defined
 *    in globals.css, so swapping the scheme never touches component code.
 * 2. Shape scale — sm(8) / md(12) / lg(16) / xl(28) / full(pill), used
 *    consistently instead of ad hoc rounded-lg / rounded-2xl mixing.
 * 3. State layers — hover/press are opacity overlays on the role color
 *    (8% hover, 12% active), not a swap to an unrelated color.
 * ──────────────────────────────────────────────────────────────────── */

/** Base accent tokens — pick from these for any categorized entity. */
export type Accent = "blue" | "green" | "amber" | "violet" | "rose" | "gray";

interface AccentMeta {
  text: string;
  bg: string;
  bar: string;
}

/**
 * M3 "container" pairing: a low-opacity tonal background (bg) with a
 * full-strength foreground (text) of the same hue — the same pattern
 * as primary/primary-container in the M3 kit, applied to each accent.
 */
export const ACCENT: Record<Accent, AccentMeta> = {
  blue: { text: "text-brand", bg: "bg-brand/12", bar: "bg-brand" },
  green: { text: "text-success", bg: "bg-success/12", bar: "bg-success" },
  amber: { text: "text-warning", bg: "bg-warning/12", bar: "bg-warning" },
  violet: { text: "text-violet-300", bg: "bg-violet-400/12", bar: "bg-violet-300" },
  rose: { text: "text-rose-300", bg: "bg-rose-400/12", bar: "bg-rose-300" },
  gray: { text: "text-muted-foreground", bg: "bg-muted", bar: "bg-muted-foreground" },
};

/** Dashboard quest categories — colors sourced from ACCENT. */
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
 * Reusable class fragments — M3 shape scale (sm 8 / md 12 / lg 16 / xl 28 / full)
 * and surface-container tiers stand in for the old ad hoc radii + shadow-soft.
 * Spacing scale unchanged: micro 4 / icon-gap 8 / component 16 / section 24 / layout 32.
 */
export const ui = {
  // Layout spacing
  gapIcon: "gap-2",
  gapComponent: "gap-4",
  spaceComponent: "space-y-4",
  spaceSection: "space-y-6",
  spaceLayout: "space-y-8",

  // Surfaces — M3 elevation is expressed as a lighter surface-container
  // tone rather than shadow, so shadows here are near-invisible on purpose.
  panel: "rounded-[16px] border border-border/60 bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
  panelTight: "rounded-[12px] border border-border/60 bg-card p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
  panelHero: "rounded-[28px] border border-border/60 bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]",
  surfaceMuted: "rounded-[12px] bg-muted",
  surfaceContainerHigh: "rounded-[12px] bg-popover",

  // Tags / pills — full (pill) shape per M3 shape scale
  pill: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium",
  mentionPill: "inline-flex items-center gap-1 rounded-full bg-mention px-2.5 py-1 text-[13px] font-medium text-mention-foreground",

  // Buttons — filled / filled-tonal / outlined per M3, with 8% state-layer hover
  buttonPrimary:
    "rounded-full bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors hover:bg-primary/90",
  buttonTonal:
    "rounded-full bg-accent text-accent-foreground transition-colors hover:bg-accent/80",
  buttonSecondary:
    "rounded-full border border-border bg-transparent text-foreground transition-colors hover:bg-foreground/8",
  iconButton:
    "flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/8",
  iconButtonActive:
    "inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-accent-foreground",

  // Progress — full (pill) tracks per M3
  progressTrack: "h-1 w-full overflow-hidden rounded-full bg-muted",
  progressTrackThin: "h-1 w-full overflow-hidden rounded-full bg-muted",
  progressFill: "h-full rounded-full bg-brand transition-all",

  // Attachment card
  attachmentCard: "flex items-center gap-3 rounded-[12px] bg-muted p-3 border border-border/50",

  // Dialog — extra-large (28px) shape per M3, scrim per M3 spec (~32% black works on dark)
  dialog: "rounded-[28px] bg-popover p-6 shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
  dialogBackdrop: "bg-black/50",

  // Type scale — M3 label/body roles
  mono: "font-mono text-xs text-brand",
  sectionLabel: "text-sm font-medium text-foreground", // ≈ title-small
  caption: "text-[13px] text-muted-foreground",          // ≈ body-small
  headlineSmall: "text-2xl font-normal leading-8 text-foreground tracking-normal",
  titleMedium: "text-base font-medium leading-6 text-foreground",
  bodyMedium: "text-sm leading-5 text-muted-foreground",
  labelLarge: "text-sm font-medium leading-5",
} as const;

export type FolderAccent = Accent;

export const FOLDER_ACCENT: Record<string, FolderAccent> = {
  ideas: "violet",
  tasks: "blue",
  notes: "amber",
  links: "green",
  organize: "gray",
};

const ACCENT_KEYS: Accent[] = ["blue", "green", "amber", "violet", "rose", "gray"];

/** Deterministic accent per tag string, since tags are user-created (no fixed palette). */
export function accentForTag(tag: string): AccentMeta {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  return ACCENT[ACCENT_KEYS[Math.abs(hash) % ACCENT_KEYS.length]];
}