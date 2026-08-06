"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ACCENT, FOLDER_ACCENT, ui } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface ComposerFolder {
  id: string;
  label: string;
  icon: IconSvgElement;
}

export interface NewItemPayload {
  title: string;
  body: string;
  folder: string;
}

export function ItemComposer({
  open,
  onOpenChange,
  folders,
  defaultFolder,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: ComposerFolder[];
  defaultFolder: string;
  onCreate: (item: NewItemPayload) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [folder, setFolder] = useState(defaultFolder);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setBody("");
      setFolder(defaultFolder);
    }
  }, [open, defaultFolder]);

  function wrapSelection(mark: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd) || "text";
    const next =
      value.slice(0, selectionStart) +
      mark +
      selected +
      mark +
      value.slice(selectionEnd);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        selectionStart + mark.length,
        selectionStart + mark.length + selected.length,
      );
    });
  }

  function handleCreate() {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), body: body.trim(), folder });
    onOpenChange(false);
  }

  function handleDiscard() {
    setTitle("");
    setBody("");
    onOpenChange(false);
  }

  const canCreate = title.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[440px] max-w-[92vw] rounded-3xl p-6 shadow-dialog">
        {/* Title field — acts as the dialog heading */}
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent text-[20px] font-semibold leading-tight text-foreground outline-none placeholder:text-muted-foreground/60"
        />

        {/* Folder / tag picker */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {folders.map((f) => {
            const accent = ACCENT[FOLDER_ACCENT[f.id] ?? "gray"];
            const active = folder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFolder(f.id)}
                className={cn(
                  ui.pill,
                  "border border-border text-muted-foreground transition-colors hover:text-foreground",
                  active && cn("border-transparent", accent.bg, accent.text),
                )}
              >
                <HugeiconsIcon icon={f.icon} size={12} />
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="mt-5">
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write something…"
            rows={6}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Format toolbar */}
        <div className="mt-2 flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1.5 shadow-soft w-fit">
          <ToolbarIcon
            icon={TextBoldIcon}
            label="Bold"
            onClick={() => wrapSelection("**")}
          />
          <ToolbarIcon
            icon={TextItalicIcon}
            label="Italic"
            onClick={() => wrapSelection("_")}
          />
          <ToolbarIcon
            icon={TextUnderlineIcon}
            label="Underline"
            onClick={() => wrapSelection("__")}
          />
        </div>

        <DialogFooter className="mt-6 flex items-center justify-between sm:justify-between">
          <button
            onClick={handleDiscard}
            aria-label="Discard"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <HugeiconsIcon icon={Delete02Icon} size={15} />
          </button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canCreate}
              onClick={handleCreate}
              className="rounded-xl"
            >
              Create
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ToolbarIcon({
  icon,
  label,
  onClick,
}: {
  icon: IconSvgElement;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
    >
      <HugeiconsIcon icon={icon} size={14} />
    </button>
  );
}
