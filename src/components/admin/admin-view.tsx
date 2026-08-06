"use client";

import { SCHEDULE_STYLE, ui } from "@/lib/theme";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Activity01Icon,
  Target02Icon,
  Calendar03Icon,
  Tag01Icon,
  Add01Icon,
  Edit02Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { TopBar } from "@/components/layout/top-bar";
import { TwoPaneShell, type NavEntry } from "@/components/layout/two-pane-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type EntityId = "activities" | "goals" | "schedules" | "categories";
type ScheduleType = "daily" | "weekly" | "one-time" | "yearly";

interface EntityRecord {
  id: string;
  name: string;
  entity: EntityId;
  schedule: ScheduleType;
  points: number;
}

const entities: NavEntry[] = [
  { id: "activities", label: "Activities", icon: Activity01Icon },
  { id: "goals", label: "Goals", icon: Target02Icon },
  { id: "schedules", label: "Schedules", icon: Calendar03Icon },
  { id: "categories", label: "Categories", icon: Tag01Icon },
];

const seedRecords: EntityRecord[] = [
  { id: "1", name: "Morning workout", entity: "activities", schedule: "daily", points: 100 },
  { id: "2", name: "Ship Ascend v1", entity: "goals", schedule: "one-time", points: 500 },
  { id: "3", name: "Weekly review", entity: "schedules", schedule: "weekly", points: 50 },
];

const scheduleTypes: ScheduleType[] = ["daily", "weekly", "one-time", "yearly"];

export default function AdminView() {
  const [records, setRecords] = useState<EntityRecord[]>(seedRecords);
  const [activeEntity, setActiveEntity] = useState<EntityId>("activities");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EntityRecord | null>(null);
  const [form, setForm] = useState({ name: "", schedule: "daily" as ScheduleType, points: 0 });

  const counts = entities.map((e) => ({
    ...e,
    count: records.filter((r) => r.entity === (e.id as EntityId)).length,
  }));

  const rows = records.filter((r) => r.entity === activeEntity);
  const activeLabel = entities.find((e) => e.id === activeEntity)?.label ?? "";

  function openCreate() {
    setEditing(null);
    setForm({ name: "", schedule: "daily", points: 0 });
    setDialogOpen(true);
  }

  function openEdit(record: EntityRecord) {
    setEditing(record);
    setForm({ name: record.name, schedule: record.schedule, points: record.points });
    setDialogOpen(true);
  }

  function save() {
    if (!form.name.trim()) return;
    if (editing) {
      setRecords((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)));
    } else {
      setRecords((prev) => [...prev, { id: crypto.randomUUID(), entity: activeEntity, ...form }]);
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <TopBar active="admin" level={12} streak={4} />

      <TwoPaneShell
        navTitle="Admin Panel"
        entries={counts}
        activeId={activeEntity}
        onSelect={(id) => setActiveEntity(id as EntityId)}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className={ui.sectionLabel}>{activeLabel}</span>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button size="sm" onClick={openCreate} className="h-8 gap-1.5 rounded-xl">
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  New
                </Button>
              }
            />
            <DialogContent className="rounded-3xl p-6 shadow-dialog">
              <DialogHeader>
                <DialogTitle>
                  {editing ? `Edit ${activeLabel.slice(0, -1)}` : `New ${activeLabel.slice(0, -1)}`}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="schedule">Schedule</Label>
                  <select
                    id="schedule"
                    value={form.schedule}
                    onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value as ScheduleType }))}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    {scheduleTypes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={form.points}
                    onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={save}>{editing ? "Save changes" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-1.5 text-center">
              <span className="text-[15px] text-muted-foreground">
                No {activeLabel.toLowerCase()} yet.
              </span>
              <span className={cn(ui.caption, "text-muted-foreground/70")}>
                Create one to start tracking it on the Dashboard.
              </span>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Schedule</th>
                  <th className="px-6 py-3 font-medium">Points</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60 transition-colors hover:bg-muted/50">
                    <td className="px-6 py-3.5">{row.name}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn(ui.pill, SCHEDULE_STYLE[row.schedule], "capitalize")}>
                        {row.schedule}
                      </span>
                    </td>
                    <td className={cn("px-6 py-3.5", ui.mono)}>+{row.points}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(row)}
                          aria-label="Edit"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <HugeiconsIcon icon={Edit02Icon} size={13} />
                        </button>
                        <button
                          onClick={() => remove(row.id)}
                          aria-label="Delete"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </TwoPaneShell>
    </div>
  );
}