"use client";

import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type ProgressBarOrientation = "horizontal" | "vertical";
export type ProgressBarLayout = "stacked" | "inline";

export interface ProgressBarProps {
  /** Current value */
  value: number;

  /** Value that represents 100% */
  max?: number;

  /** Bar direction */
  orientation?: ProgressBarOrientation;

  /** "stacked" = label above bar, "inline" = label | bar | value */
  layout?: ProgressBarLayout;

  /** Optional label */
  label?: string;

  /** Optional muted sublabel */
  sublabel?: string;

  /** Fixed width for the label column in inline layout */
  labelWidth?: string;

  /** Show the numeric/percent value */
  showValue?: boolean;

  /** Custom formatter for the displayed value */
  valueFormat?: (value: number, max: number) => string;

  /** Track thickness in px */
  thickness?: number;

  /** Track length in px */
  length?: number;

  /** Override the unfinished/track background */
  trackClassName?: string;

  /** Override the completed progress color */
  barClassName?: string;

  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  orientation = "horizontal",
  layout = "stacked",
  label,
  sublabel,
  labelWidth = "5rem",
  showValue = false,
  valueFormat,
  thickness = 7,
  length,
  trackClassName = "",
  barClassName = "",
  className = "",
}: ProgressBarProps) {
  const isHorizontal = orientation === "horizontal";
  const isInline = layout === "inline" && isHorizontal;

  const safeMax = max > 0 ? max : 1;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percent = (clampedValue / safeMax) * 100;

  const trackStyle: CSSProperties = isHorizontal
    ? {
        height: thickness,
        width: length ?? "100%",
      }
    : {
        width: thickness,
        height: length ?? 160,
      };

  const barStyle: CSSProperties = isHorizontal
    ? {
        width: `${percent}%`,
        height: "100%",
      }
    : {
        height: `${percent}%`,
        width: "100%",
      };

  const formattedValue = valueFormat
    ? valueFormat(clampedValue, safeMax)
    : `${Math.round(percent)}%`;

  const track = (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      className={cn(
        "relative overflow-hidden rounded-full bg-neutral-700",
        !isHorizontal && "flex flex-col justify-end",
        trackClassName
      )}
      style={trackStyle}
    >
      <div
        className={cn(
          "rounded-full bg-white transition-[width,height] duration-700 ease-out",
          !isHorizontal && "mt-auto",
          barClassName
        )}
        style={barStyle}
      />
    </div>
  );

  return (
    <div
      className={cn(
        "flex",
        isInline
          ? "items-center gap-4"
          : isHorizontal
            ? "w-full flex-col gap-2"
            : "flex-col items-center gap-2",
        className
      )}
    >
      {isInline ? (
        <>
          {(label || sublabel) && (
            <p
              className="shrink-0 text-sm font-medium leading-tight text-foreground"
              style={{ width: labelWidth }}
            >
              {label}
              {label && sublabel && <br />}
              {sublabel}
            </p>
          )}

          <div className="relative flex-1">{track}</div>

          {showValue && (
            <span className="shrink-0 text-lg font-semibold text-foreground tabular-nums">
              {formattedValue}
            </span>
          )}
        </>
      ) : (
        <>
          {(label || sublabel || showValue) && (
            <div
              className={cn(
                "flex w-full items-center justify-between gap-2",
                !isHorizontal && "flex-col"
              )}
            >
              <div className="flex items-baseline gap-1.5">
                {label && (
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                )}

                {sublabel && (
                  <span className="text-xs text-muted-foreground">
                    {sublabel}
                  </span>
                )}
              </div>

              {showValue && (
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {formattedValue}
                </span>
              )}
            </div>
          )}

          {track}
        </>
      )}
    </div>
  );
}