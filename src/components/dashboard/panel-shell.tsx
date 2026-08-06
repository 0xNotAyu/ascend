"use client";

import { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PanelAction {
  icon: IconSvgElement;
  label: string;
  onClick?: () => void;
}

interface PanelShellProps {
  title: string;
  icon: IconSvgElement;
  actions?: PanelAction[];
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PanelShell({
  title,
  icon,
  actions = [],
  footer,
  children,
  className,
}: PanelShellProps) {
  return (
    <div className={cn("flex h-full min-w-0 flex-col bg-background", className)}>
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border/60 bg-muted/30 px-3">
        <HugeiconsIcon icon={icon} size={14} className="text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              aria-label={action.label}
              title={action.label}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            >
              <HugeiconsIcon icon={action.icon} size={14} />
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col">{children}</div>
      </ScrollArea>

      {footer ? (
        <div className="flex h-6 shrink-0 items-center border-t border-border/60 bg-muted/20 px-3 text-[11px] text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function PanelRow({
  icon,
  label,
  meta,
  indent = 0,
  active = false,
  onClick,
}: {
  icon?: IconSvgElement;
  label: string;
  meta?: string;
  indent?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ paddingLeft: 12 + indent * 16 }}
      className={cn(
        "flex h-7 w-full items-center gap-2 pr-3 text-left text-[13px] hover:bg-accent/50",
        active && "bg-accent/70"
      )}
    >
      {icon ? (
        <HugeiconsIcon icon={icon} size={14} className="shrink-0 text-muted-foreground" />
      ) : (
        <span className="w-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
      {meta ? (
        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{meta}</span>
      ) : null}
    </button>
  );
}
