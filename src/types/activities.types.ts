export type ActivityType = "SIMPLE" | "COUNTER" | "TOGGLE";
export type Frequency = "DAILY" | "WEEKLY" | "ONE_TIME";
export type LifeArea =
  | "HEALTH"
  | "CAREER"
  | "PERSONAL"
  | "FINANCE"
  | "RELATIONSHIPS"
  | "OTHER";
export type InstanceStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface ActivitySummary {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: ActivityType;
  config: { target?: number; unit?: string };
  tagIds: string[];
  lifeArea: LifeArea;
  frequency: Frequency;
  basePoints: number;
  archived: boolean;
  queuedFor?: string | null;
}

export interface TodayInstance {
  id: string;
  activityId: string;
  date: string;
  status: InstanceStatus;
  progress: number;
  sessionStart: string | null;
  durationSec: number;
  completedAt: string | null;
  pointsEarned: number;
  activity: ActivitySummary;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string | null;
}

export interface ActivityCardProps {
  instance: TodayInstance;
  tagsById?: Record<string, Tag>;
  onAction: (
    instanceId: string,
    action: string,
    extra?: Record<string, unknown>,
  ) => void | Promise<void>;
  size?: "default" | "compact";
  className?: string;
}

// --- /plan workspace additions -------------------------------------
//
// Not a stored field — derived from `frequency` + `queuedFor` so the
// UI has one place that defines what "Backlog / Scheduled / Queued"
// means (see plan-workspace README §4).
export type ActivityState = "BACKLOG" | "SCHEDULED" | "QUEUED";

export function getActivityState(
  activity: Pick<ActivitySummary, "frequency" | "queuedFor">,
): ActivityState {
  if (activity.frequency !== "ONE_TIME") return "SCHEDULED";
  return activity.queuedFor ? "QUEUED" : "BACKLOG";
}