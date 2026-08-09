"use client";

import * as React from "react";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MoreVertical,
  Plus,
  Search,
  Settings,
  SquareChartGantt,
  Users2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------
// Design language reused from the dashboard: neutral-900 panels on a
// neutral-700 stage, neutral-800 for hover/active surfaces, hairline
// white/10 borders, white text for emphasis, neutral-500 for muted
// labels. No color accent beyond the semantic green status/badge dot.
// ---------------------------------------------------------------------

interface NavLeaf {
  id: string;
  label: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavLeaf[];
}

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  {
    id: "analytics",
    label: "Analytics",
    icon: SquareChartGantt,
    children: [
      { id: "analytics-overview", label: "Overview" },
      { id: "analytics-realtime", label: "Real-time" },
      { id: "analytics-audience", label: "Audience" },
    ],
  },
  {
    id: "products",
    label: "Products",
    icon: Layers,
    children: [
      { id: "products-all", label: "All products" },
      { id: "products-categories", label: "Categories" },
    ],
  },
  {
    id: "tasks",
    label: "My tasks",
    icon: ListChecks,
    children: [
      { id: "tasks-assigned", label: "Assigned to me" },
      { id: "tasks-completed", label: "Completed" },
    ],
  },
  {
    id: "reporting",
    label: "Reporting",
    icon: SquareChartGantt,
    children: [
      { id: "reporting-overview", label: "Overview" },
      { id: "reporting-notifications", label: "Notifications" },
      { id: "reporting-analytics", label: "Analytics" },
      { id: "reporting-reports", label: "Reports" },
    ],
  },
  {
    id: "shared",
    label: "Shared with",
    icon: Users2,
    children: [
      { id: "shared-team", label: "Team" },
      { id: "shared-external", label: "External" },
    ],
  },
];

const bottomItems = [
  { id: "notifications", label: "Notifications", icon: Bell, badge: 4 },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "settings", label: "Settings", icon: Settings },
];

// ---------- Avatar ----------
// No real image source, so a plain initials tile stands in — keeps the
// same neutral palette instead of pulling in a random gradient.

function Avatar({ size = "default" }: { size?: "default" | "sm" }) {
  const compact = size === "sm";
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-neutral-700 font-semibold text-neutral-200",
          compact ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm",
        )}
      >
        AL
      </div>
      <span
        className={cn(
          "absolute rounded-full border-2 border-neutral-900 bg-emerald-500",
          compact
            ? "-bottom-0.5 -right-0.5 h-2.5 w-2.5"
            : "-bottom-0.5 -right-0.5 h-3 w-3",
        )}
      />
    </div>
  );
}

// ---------- Collapsed rail ----------

interface RailProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  onExpand: () => void;
}

function CollapsedRail({
  activeSection,
  onSelectSection,
  onExpand,
}: RailProps) {
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <div className="flex h-full w-16 flex-col items-center gap-1 rounded-2xl border border-white/5 bg-neutral-900 py-4">
      <Avatar />

      <button
        onClick={onExpand}
        aria-label="Expand sidebar"
        className="mt-3 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>

      <button
        aria-label="Search"
        className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
      >
        <Search className="h-4 w-4" />
      </button>

      <div className="mt-3 flex w-full flex-col items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered((h) => (h === item.id ? null : h))}
            >
              <button
                onClick={() => onSelectSection(item.id)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500 hover:bg-neutral-800/70 hover:text-neutral-200",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>

              {hovered === item.id && item.children && (
                <div className="absolute left-full top-0 z-20 ml-3 w-48 rounded-xl border border-white/10 bg-neutral-900 p-1.5 shadow-2xl shadow-black/50">
                  {item.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                    >
                      {child.label}
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-600" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col items-center gap-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              aria-label={item.label}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
            >
              <Icon className="h-4 w-4" />
              {item.badge && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-neutral-950">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Expanded panel ----------

interface PanelProps {
  openSection: string;
  onOpenSection: (id: string) => void;
  activeLeaf: string;
  onSelectLeaf: (id: string) => void;
  onCollapse: () => void;
}

function ExpandedPanel({
  openSection,
  onOpenSection,
  activeLeaf,
  onSelectLeaf,
  onCollapse,
}: PanelProps) {
  return (
    <div className="flex h-full w-64 flex-col rounded-2xl border border-white/5 bg-neutral-900 p-3">
      {/* Account */}
      <div className="flex items-center gap-2.5 px-1 pb-3 pt-1">
        <Avatar size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            Amélie Laurent
          </p>
          <p className="truncate text-xs text-neutral-500">
            amelie@untitledui.com
          </p>
        </div>
        <button
          aria-label="Account menu"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Team switcher */}
      <div className="flex items-center justify-between border-t border-white/5 px-1 py-3">
        <span className="text-sm font-medium text-neutral-300">
          Untitled UI Admins
        </span>
        <button className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200">
          <Plus className="h-3.5 w-3.5" />
          Create team
        </button>
      </div>

      {/* Search */}
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/5 bg-neutral-800/60 px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-neutral-500" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none"
        />
      </div>

      {/* Nav */}
      <button
        onClick={onCollapse}
        aria-label="Collapse sidebar"
        className="mb-1 flex h-7 w-7 items-center justify-center self-end rounded-lg text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </button>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isOpen = openSection === item.id;
          return (
            <div key={item.id}>
              <button
                onClick={() =>
                  item.children
                    ? onOpenSection(isOpen ? "" : item.id)
                    : undefined
                }
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  isOpen
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.children &&
                  (isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                  ))}
              </button>

              {isOpen && item.children && (
                <div className="ml-[1.15rem] mt-0.5 flex flex-col gap-0.5 border-l border-white/5 pl-4">
                  {item.children.map((child) => {
                    const active = activeLeaf === child.id;
                    return (
                      <button
                        key={child.id}
                        onClick={() => onSelectLeaf(child.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                          active
                            ? "bg-neutral-800 text-white"
                            : "text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full",
                            active ? "bg-white" : "bg-transparent",
                          )}
                        />
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom utility items */}
      <div className="flex flex-col gap-0.5 border-t border-white/5 pt-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/60 hover:text-neutral-200"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-neutral-950">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Sidebar ----------
// Extendable: starts expanded, collapses to an icon rail. In the
// collapsed rail, hovering a section with sub-items reveals a flyout
// exactly like the "Reporting" flyout in the reference.

export default function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [openSection, setOpenSection] = React.useState("reporting");
  const [activeLeaf, setActiveLeaf] = React.useState("reporting-overview");

  return (
    <div className="h-full">
      {collapsed ? (
        <CollapsedRail
          activeSection={openSection}
          onSelectSection={(id) => {
            setOpenSection(id);
            setCollapsed(false);
          }}
          onExpand={() => setCollapsed(false)}
        />
      ) : (
        <ExpandedPanel
          openSection={openSection}
          onOpenSection={setOpenSection}
          activeLeaf={activeLeaf}
          onSelectLeaf={setActiveLeaf}
          onCollapse={() => setCollapsed(true)}
        />
      )}
    </div>
  );
}
