"use client";

import * as React from "react";
import {
  Home,
  Database,
  ArrowLeftRight,
  BarChart3,
  Search,
  Plus,
  Copy,
  ChevronDown,
  Folder,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ---------- Data ----------

type TreeItem = {
  id: string;
  label: string;
  count?: number;
  depth: number;
  hasIcon?: boolean;
  active?: boolean;
};

const treeItems: TreeItem[] = [
  {
    id: "general",
    label: "General Knowledge",
    count: 10,
    depth: 0,
    hasIcon: true,
    active: true,
  },
  { id: "onboarding", label: "Onboarding", count: 3, depth: 1, hasIcon: true },
  { id: "sub1", label: "Subfolder 1", count: 5, depth: 2 },
  { id: "sub2", label: "Subfolder 2", count: 10, depth: 2 },
  { id: "integrations", label: "Integrations", depth: 0, hasIcon: true },
  { id: "documents", label: "Documents", depth: 0, hasIcon: true },
  {
    id: "onboarding-design",
    label: "Onboarding Design",
    depth: 0,
    hasIcon: true,
  },
  { id: "team-interviews", label: "Team Interviews", depth: 0, hasIcon: true },
];

// Chart tokens double as the colorful integration-icon badges, so the
// palette stays inside the theme instead of introducing ad-hoc colors.
type FolderCard = {
  id: string;
  name: string;
  files: number;
  chips: string[]; // chart color var names, e.g. "chart-1"
  variant: "stack" | "plain";
};

const folders: FolderCard[] = [
  {
    id: "onboarding",
    name: "Onboarding",
    files: 15,
    chips: ["chart-1", "chart-4"],
    variant: "stack",
  },
  {
    id: "integrations",
    name: "Integrations",
    files: 5,
    chips: ["chart-2", "chart-3", "chart-5"],
    variant: "plain",
  },
  {
    id: "documents",
    name: "Documents",
    files: 10,
    chips: ["chart-1", "chart-5"],
    variant: "plain",
  },
];

type FileRow = {
  id: string;
  name: string;
  addedBy: string;
  initials: string;
  chart: string;
};

// Tailwind can only see class names that appear literally in source, so
// dynamic strings like `bg-${chip}` won't get generated at build time —
// this map keeps every class name literal.
const chartBg: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

const files: FileRow[] = [
  {
    id: "1",
    name: "Onboarding-Guide.pdf",
    addedBy: "kevin@mail.com",
    initials: "K",
    chart: "chart-4",
  },
  {
    id: "2",
    name: "Product-Roadmap.docx",
    addedBy: "antonwe@gmail.com",
    initials: "A",
    chart: "chart-2",
  },
];

// ---------- Component ----------

export default function KnowledgeBaseUI() {
  const [activeTab, setActiveTab] = React.useState<"folders" | "tags">(
    "folders",
  );

  return (
    // Staging backdrop only — frames the component for display, not a theme token.
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-800 p-6 dark">
      <div className="flex h-[560px] w-full max-w-6xl overflow-hidden rounded-2xl bg-background shadow-soft">
        {/* Icon rail */}
        <div className="flex w-14 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-4">
          <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <div className="h-3.5 w-3.5 rounded-full bg-primary-foreground" />
          </div>
          <RailIcon icon={Home} />
          <RailIcon icon={Database} active />
          <RailIcon icon={ArrowLeftRight} />
          <RailIcon icon={BarChart3} />
        </div>

        {/* Secondary sidebar */}
        <div className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-sidebar-foreground">
              Knowledge Base
            </h2>
            <div className="flex items-center gap-1">
              <button className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Plus className="h-4 w-4" />
              </button>
              <button className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-8 border-sidebar-border bg-background pl-8 text-sm text-sidebar-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
            />
          </div>

          <div className="mb-4 flex items-center gap-1 rounded-lg bg-background p-1 text-sm">
            <button
              onClick={() => setActiveTab("folders")}
              className={cn(
                "flex-1 rounded-md py-1.5 font-medium transition-colors",
                activeTab === "folders"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground",
              )}
            >
              Folders
            </button>
            <button
              onClick={() => setActiveTab("tags")}
              className={cn(
                "flex-1 rounded-md py-1.5 font-medium transition-colors",
                activeTab === "tags"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground",
              )}
            >
              Tags
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {treeItems.map((item) => (
              <div
                key={item.id}
                style={{ paddingLeft: `${item.depth * 16}px` }}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1.5 text-sm",
                  item.active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  {item.hasIcon && (
                    <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {item.count}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden bg-background p-6">
          <button className="mb-6 flex items-center gap-1.5 text-sm font-medium text-foreground">
            General Knowledge
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Folders
          </h2>

          <div className="mb-8 flex gap-4 overflow-hidden">
            {folders.map((folder) => (
              <div key={folder.id} className="w-40 shrink-0">
                <div className="relative flex h-32 w-40 items-center justify-center rounded-2xl bg-card">
                  {folder.variant === "stack" ? (
                    <div className="relative">
                      <div className="absolute -top-2 left-1 h-9 w-11 rotate-[-6deg] rounded-md bg-secondary" />
                      <div className="absolute -top-2 right-1 h-9 w-11 rotate-[6deg] rounded-md bg-muted" />
                      <Folder className="relative h-12 w-12 fill-muted-foreground/40 text-muted-foreground" />
                    </div>
                  ) : (
                    <Folder className="h-12 w-12 fill-secondary text-secondary-foreground/70" />
                  )}
                  <div className="absolute bottom-3 left-3 flex -space-x-1.5">
                    {folder.chips.map((chip, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2 border-card text-[9px] font-bold text-white",
                          chartBg[chip],
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {folder.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {folder.files} Files
                </p>
              </div>
            ))}
          </div>

          <h2 className="mb-3 text-xl font-semibold text-foreground">Files</h2>

          <div className="rounded-lg border border-border">
            <div className="flex items-center border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
              <span className="flex-1">Name</span>
              <span className="w-48">Added By</span>
            </div>
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center px-4 py-3 text-sm hover:bg-accent/50"
              >
                <span className="flex flex-1 items-center gap-2 text-foreground">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {file.name}
                </span>
                <span className="flex w-48 items-center gap-2 text-muted-foreground">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback
                      className={cn(
                        "text-[9px] text-white",
                        chartBg[file.chart],
                      )}
                    >
                      {file.initials}
                    </AvatarFallback>
                  </Avatar>
                  {file.addedBy}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RailIcon({
  icon: Icon,
  active,
}: {
  icon: React.ElementType;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
