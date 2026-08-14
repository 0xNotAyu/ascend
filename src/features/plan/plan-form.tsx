"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ActivityType = "SIMPLE" | "COUNTER" | "TOGGLE";
type Frequency = "DAILY" | "WEEKLY" | "ONE_TIME";
type LifeArea =
  | "HEALTH"
  | "CAREER"
  | "PERSONAL"
  | "FINANCE"
  | "RELATIONSHIPS"
  | "OTHER";

type Tag = { id: string; name: string; color: string };

const ACTIVITY_TYPES: ActivityType[] = ["SIMPLE", "COUNTER", "TOGGLE"];
const FREQUENCIES: Frequency[] = ["DAILY", "WEEKLY", "ONE_TIME"];
const LIFE_AREAS: LifeArea[] = [
  "HEALTH",
  "CAREER",
  "PERSONAL",
  "FINANCE",
  "RELATIONSHIPS",
  "OTHER",
];

// Design-system tokens (see design-system.md §2/§3/§9) -----------------
const inputClass =
  "h-9 w-full rounded-lg border border-white/5 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20";
const labelClass = "text-xs font-medium text-neutral-400";
const primaryButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-neutral-100 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-white disabled:opacity-50 disabled:pointer-events-none";
const secondaryButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800 px-4 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700";
const ghostButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/60 hover:text-neutral-200";
const chipClass =
  "inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-neutral-800 px-2.5 text-xs font-medium text-neutral-300";

export function PlanForm() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState<ActivityType>("SIMPLE");
  const [lifeArea, setLifeArea] = React.useState<LifeArea>("HEALTH");
  const [frequency, setFrequency] = React.useState<Frequency>("DAILY");
  const [basePoints, setBasePoints] = React.useState(10);

  // COUNTER-only fields
  const [target, setTarget] = React.useState(1);
  const [unit, setUnit] = React.useState("");

  // Tags
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>([]);
  const [newTagName, setNewTagName] = React.useState("");
  const [creatingTag, setCreatingTag] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/tags")
      .then((res) => (res.ok ? res.json() : { tags: [] }))
      .then((data) => setTags(data.tags ?? []))
      .catch(() => {
        // Non-fatal — the form still works without pre-existing tags.
      });
  }, []);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true);
    setError(null);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create tag");
      }
      const data = await res.json();
      const tag: Tag = data.tag;
      setTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
      setSelectedTagIds((prev) => (prev.includes(tag.id) ? prev : [...prev, tag.id]));
      setNewTagName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (type === "COUNTER" && (!target || target <= 0)) {
      setError("Target must be greater than 0 for a Counter activity.");
      return;
    }

    setSubmitting(true);
    try {
      const config = type === "COUNTER" ? { target, unit: unit.trim() || undefined } : {};

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          config,
          tagIds: selectedTagIds,
          lifeArea,
          frequency,
          basePoints,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create activity");
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setType("SIMPLE");
      setTarget(1);
      setUnit("");
      setSelectedTagIds([]);
      setBasePoints(10);

      // Give the success state a beat to show, then send them to /today.
      setTimeout(() => router.push("/today"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Plan an activity</h1>
        <p className="text-sm text-neutral-500">
          Add something to track. It&apos;ll show up on Today when it&apos;s due.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-white/10 bg-neutral-800/60 px-4 py-3 text-sm text-emerald-500">
          Activity created.
        </div>
      )}

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Morning run"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className={cn(inputClass, "h-20 resize-none py-2.5")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="type">
            Type
          </label>
          <select
            id="type"
            className={cn(inputClass, "appearance-none")}
            value={type}
            onChange={(e) => setType(e.target.value as ActivityType)}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="frequency">
            Frequency
          </label>
          <select
            id="frequency"
            className={cn(inputClass, "appearance-none")}
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {f === "ONE_TIME" ? "One time" : f.charAt(0) + f.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional fields — only COUNTER needs target + unit */}
      {type === "COUNTER" && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-white/5 bg-neutral-800/40 p-3">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="target">
              Target
            </label>
            <input
              id="target"
              type="number"
              min={1}
              className={inputClass}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="unit">
              Unit
            </label>
            <input
              id="unit"
              className={inputClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="pages, reps, glasses…"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="lifeArea">
            Life area
          </label>
          <select
            id="lifeArea"
            className={cn(inputClass, "appearance-none")}
            value={lifeArea}
            onChange={(e) => setLifeArea(e.target.value as LifeArea)}
          >
            {LIFE_AREAS.map((a) => (
              <option key={a} value={a}>
                {a.charAt(0) + a.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="basePoints">
            Base points
          </label>
          <input
            id="basePoints"
            type="number"
            min={0}
            className={inputClass}
            value={basePoints}
            onChange={(e) => setBasePoints(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  chipClass,
                  active && "bg-neutral-700 text-white border-white/20",
                )}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 pt-1">
          <input
            className={inputClass}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreateTag}
            disabled={creatingTag || !newTagName.trim()}
            className={cn(secondaryButton, "shrink-0")}
          >
            <Plus className="size-3.5" />
            Add tag
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          className={ghostButton}
          onClick={() => router.push("/today")}
        >
          <X className="size-3.5" />
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={primaryButton}>
          {submitting ? "Saving…" : "Create activity"}
        </button>
      </div>
    </form>
  );
}
