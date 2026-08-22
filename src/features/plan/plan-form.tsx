"use client";

import * as React from "react";
import { Check, ChevronLeft, Minus, Plus, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ActivitySummary,
  ActivityType,
  Frequency,
  LifeArea,
} from "@/types/activities.types";

const ACTIVITY_TYPES: { value: ActivityType; label: string; hint: string }[] = [
  { value: "SIMPLE", label: "Simple", hint: "Just check it off" },
  { value: "COUNTER", label: "Counter", hint: "Track a number" },
  { value: "TOGGLE", label: "Time tracker", hint: "Track time spent" },
];

const LIFE_AREAS: { value: LifeArea; label: string }[] = [
  { value: "HEALTH", label: "Health" },
  { value: "CAREER", label: "Career" },
  { value: "PERSONAL", label: "Personal" },
  { value: "FINANCE", label: "Finance" },
  { value: "RELATIONSHIPS", label: "Relationships" },
  { value: "OTHER", label: "Other" },
];

const WEEK_DAYS = [
  { value: 0, label: "S", name: "Sunday" },
  { value: 1, label: "M", name: "Monday" },
  { value: 2, label: "T", name: "Tuesday" },
  { value: 3, label: "W", name: "Wednesday" },
  { value: 4, label: "T", name: "Thursday" },
  { value: 5, label: "F", name: "Friday" },
  { value: 6, label: "S", name: "Saturday" },
];

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// Steps are now just: Type -> Life area -> Frequency.
// Name + description live in a persistent header above the stepper instead
// of being step 1, so they're always visible, not hidden inside a slide.
const STEP_COUNT = 3;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500">
      {children}
    </p>
  );
}

function OptionRow({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm transition-colors",
        focusRing,
        active
          ? "border-white/25 bg-white/10 text-white"
          : "border-white/10 bg-transparent text-neutral-400 hover:border-white/20 hover:bg-white/5 hover:text-neutral-200",
      )}
    >
      <span className="truncate">{children}</span>
      {active && <Check className="h-4 w-4 shrink-0 text-white" />}
    </button>
  );
}

/** Fully invisible-until-focused text field — no border, no box, ever. */
function InlineInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  autoFocus,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <input
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full cursor-text border-0 bg-transparent p-0 text-neutral-100 outline-none placeholder:text-neutral-600",
        className,
      )}
    />
  );
}

interface PlanFormProps {
  /** Pass an activity to edit it (PATCH); omit/null to create (POST). */
  activity?: ActivitySummary | null;
  onSaved: (activity: ActivitySummary) => void;
  onCancel: () => void;
  className?: string;
}

export function PlanForm({
  activity = null,
  onSaved,
  onCancel,
  className,
}: PlanFormProps) {
  const isEdit = Boolean(activity);

  const [step, setStep] = React.useState(0);

  const [title, setTitle] = React.useState(activity?.title ?? "");
  const [description, setDescription] = React.useState(
    activity?.description ?? "",
  );
  const [type, setType] = React.useState<ActivityType>(
    activity?.type ?? "SIMPLE",
  );
  const [lifeArea, setLifeArea] = React.useState<LifeArea>(
    activity?.lifeArea ?? "HEALTH",
  );

  // Requires "MONTHLY" added to the Frequency type in activities.types.ts
  // (and to any backend enum/validation) — see note at the bottom.
  const [frequency, setFrequency] = React.useState<Frequency>(
    activity?.frequency ?? "ONE_TIME",
  );

  const [repeatDays, setRepeatDays] = React.useState<number[]>(
    (activity?.config as { repeatDays?: number[] } | undefined)?.repeatDays ??
      [1, 2, 3, 4, 5],
  );
  const [monthDay, setMonthDay] = React.useState<number>(
    (activity?.config as { monthDay?: number } | undefined)?.monthDay ?? 1,
  );

  const [target, setTarget] = React.useState(activity?.config?.target ?? 1);
  const [unit, setUnit] = React.useState(activity?.config?.unit ?? "");

  const [submitting, setSubmitting] = React.useState<"board" | "archive" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const isWeekly = frequency === "DAILY";
  const isMonthly = frequency === "MONTHLY";
  const isRepeating = isWeekly || isMonthly;

  const toggleRepeatDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day)
        ? prev.filter((value) => value !== day)
        : [...prev, day].sort((a, b) => a - b),
    );
  };

  const validateStep = (index: number): string | null => {
    if (!title.trim()) return "Give your activity a name.";
    if (index === 0 && type === "COUNTER" && (!target || target <= 0))
      return "Target must be greater than 0 for a Counter activity.";
    if (index === 2 && isWeekly && repeatDays.length === 0)
      return "Select at least one day for a weekly activity.";
    if (index === 2 && isMonthly && !monthDay)
      return "Select a day of the month.";
    return null;
  };

  const goNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const goBack = () => {
    setError(null);
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const saveActivity = async (action: "board" | "archive") => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(action);

    try {
      const repeatConfig = isWeekly
        ? { repeatDays }
        : isMonthly
          ? { monthDay }
          : {};

      const config =
        type === "COUNTER"
          ? { target, unit: unit.trim() || undefined, ...repeatConfig }
          : { ...repeatConfig };

      const res = await fetch(
        isEdit ? `/api/activities/${activity!.id}` : "/api/activities",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || undefined,
            type,
            config,
            lifeArea,
            frequency,
            action,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save activity");
      }

      const data = await res.json();
      onSaved(data.activity as ActivitySummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col px-12 py-8 text-neutral-100",
        className,
      )}
      style={{ minHeight: "36rem" }}
    >
      {/* Persistent header — always visible, not part of the stepper */}
      <div className="mb-8 shrink-0">
        <InlineInput
          autoFocus
          ariaLabel="Activity name"
          value={title}
          onChange={setTitle}
          placeholder="New activity"
          className="text-3xl font-semibold"
        />
        <InlineInput
          ariaLabel="Description"
          value={description}
          onChange={setDescription}
          placeholder="Add a description (optional)"
          className="mt-2 text-sm text-neutral-500"
        />
      </div>

      {/* Progress */}
      {/* <div className="mb-10 shrink-0">
        <p className="mb-2 text-xs font-medium text-neutral-500">
          Step {step + 1} of {STEP_COUNT}
        </p>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/70 transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
          />
        </div>
      </div> */}

      {/* Slides */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {/* Step 1: How you'll track it */}
          <div className="w-full shrink-0 px-1">
            
            <p className="mt-2 font-medium text-neutral-400">
              How do you want to track it?
            </p>

            <div className="mt-2 grid grid-cols-3 gap-5">
              {ACTIVITY_TYPES.map((item) => {
                const active = type === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setType(item.value)}
                    
                    className={cn(
                      "flex min-h-40 w-full flex-col items-start justify-between rounded-xl border p-5 text-left transition-colors",
                      focusRing,
                      active
                        ? "border-white/25 bg-white/10 text-white"
                        : "border-white/10 bg-transparent text-neutral-400 hover:border-white/20 hover:bg-white/5 hover:text-neutral-200",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border",
                        active
                          ? "border-white/40 bg-white/20"
                          : "border-white/15",
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                    </span>

                    <div>
                      <p className="text-base font-semibold text-inherit">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {item.hint}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {type === "COUNTER" && (
              <div className="mt-8 grid max-w-lg grid-cols-2 gap-10">
                <div>
                  <FieldLabel>Target</FieldLabel>
                  <div className="flex h-11 items-center gap-3">
                    <button
                      type="button"
                      aria-label="Decrease target"
                      onClick={() => setTarget((t) => Math.max(1, t - 1))}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition-colors hover:border-white/20 hover:text-white",
                        focusRing,
                      )}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={target}
                      onChange={(e) => setTarget(Number(e.target.value))}
                      className="w-16 bg-transparent text-center text-xl font-medium text-neutral-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      aria-label="Increase target"
                      onClick={() => setTarget((t) => t + 1)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-neutral-400 transition-colors hover:border-white/20 hover:text-white",
                        focusRing,
                      )}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <FieldLabel>Unit</FieldLabel>
                  <InlineInput
                    ariaLabel="Unit"
                    value={unit}
                    onChange={setUnit}
                    placeholder="reps, pages, glasses…"
                    className="text-xl font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Life area */}
          <div className="w-full shrink-0 px-1">
          
            <p className="mt-2 font-medium text-neutral-400">
              Where does it fit?
            </p>

            <div className="mt-2 grid max-w-lg grid-cols-2 gap-3">
              {LIFE_AREAS.map((area) => (
                <OptionRow
                  key={area.value}
                  active={lifeArea === area.value}
                  onClick={() => setLifeArea(area.value)}
                >
                  {area.label}
                </OptionRow>
              ))}
            </div>
          </div>

          {/* Step 3: Frequency */}
          <div className="w-full shrink-0 px-1">
            
            <p className="mt-2 font-medium text-neutral-400">
              How often does it happen?
            </p>

            <div className="mt-2 max-w-lg">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  aria-pressed={frequency === "ONE_TIME"}
                  onClick={() => setFrequency("ONE_TIME")}
                  className={cn(
                    "h-12 rounded-lg border text-sm font-medium transition-colors",
                    focusRing,
                    frequency === "ONE_TIME"
                      ? "border-white/25 bg-white/10 text-white"
                      : "border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200",
                  )}
                >
                  One time
                </button>
                <button
                  type="button"
                  aria-pressed={isWeekly}
                  onClick={() => setFrequency("DAILY")}
                  className={cn(
                    "h-12 rounded-lg border text-sm font-medium transition-colors",
                    focusRing,
                    isWeekly
                      ? "border-white/25 bg-white/10 text-white"
                      : "border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200",
                  )}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  aria-pressed={isMonthly}
                  onClick={() => setFrequency("MONTHLY")}
                  className={cn(
                    "h-12 rounded-lg border text-sm font-medium transition-colors",
                    focusRing,
                    isMonthly
                      ? "border-white/25 bg-white/10 text-white"
                      : "border-white/10 text-neutral-400 hover:border-white/20 hover:text-neutral-200",
                  )}
                >
                  Monthly
                </button>
              </div>

              {isWeekly && (
                <div className="mt-8">
                  <FieldLabel>Repeat on</FieldLabel>
                  <div className="flex gap-2">
                    {WEEK_DAYS.map((day) => {
                      const active = repeatDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          aria-label={`Repeat on ${day.name}`}
                          aria-pressed={active}
                          onClick={() => toggleRepeatDay(day.value)}
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                            focusRing,
                            active
                              ? "border-white/25 bg-white/10 text-white"
                              : "border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-300",
                          )}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isMonthly && (
                <div className="mt-8">
                  <FieldLabel>Day of the month</FieldLabel>
                  <div className="grid grid-cols-7 gap-2">
                    {MONTH_DAYS.map((day) => {
                      const active = monthDay === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          aria-label={`Repeat on day ${day}`}
                          aria-pressed={active}
                          onClick={() => setMonthDay(day)}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-medium transition-colors",
                            focusRing,
                            active
                              ? "border-white/25 bg-white/10 text-white"
                              : "border-white/10 text-neutral-500 hover:border-white/20 hover:text-neutral-300",
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 flex shrink-0 items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Nav */}
      <div className="mt-8 flex shrink-0 items-center justify-between gap-2 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={goBack}
          className={cn(
            "flex h-10 items-center gap-1 rounded-md px-3 text-sm font-medium text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-300",
            focusRing,
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {step < STEP_COUNT - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className={cn(
              "h-10 rounded-md bg-neutral-200 px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300",
              focusRing,
            )}
          >
            Next
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              disabled={submitting !== null}
              onClick={() => saveActivity("archive")}
              className={cn(
                "h-10 rounded-md border border-white/10 px-4 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-200 disabled:pointer-events-none disabled:opacity-50",
                focusRing,
              )}
            >
              {submitting === "archive" ? "Saving…" : "Save for later"}
            </button>
            <button
              type="button"
              disabled={submitting !== null}
              onClick={() => saveActivity("board")}
              className={cn(
                "h-10 rounded-md bg-neutral-200 px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-300",
                focusRing,
              )}
            >
              {submitting === "board" ? "Saving…" : "Push to board"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}