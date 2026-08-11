export interface Activity {
  id: string;
  name: string;
  category: string;
  points: number;
  done?: boolean;
}

export interface ActivityCardProps {
  activity: Activity;
  size?: "default" | "compact";
  onGo?: (id: string) => void;
  className?: string;
}

export interface WeeklyActivitiesProps {
  activities: Activity[];
  onToggle: (id: string) => void;
  refreshLabel?: string;
}
