"use client";

import { useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Idea01Icon,
  Task01Icon,
  StickyNote01Icon,
  Link01Icon,
  Tag01Icon,
  Add01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { ItemComposer, type NewItemPayload } from "@/components/inbox/item-composer";
import { ACCENT, FOLDER_ACCENT, ui } from "@/lib/theme";
import { cn } from "@/lib/utils";

type FolderId = "ideas" | "tasks" | "notes" | "links" | "organize";
type SortOrder = "newest" | "oldest";

interface InboxItem {
  id: string;
  title: string;
  body: string;
  folder: FolderId;
  createdAt: number;
}

const folders = [
  { id: "ideas" as FolderId, label: "Ideas", icon: Idea01Icon },
  { id: "tasks" as FolderId, label: "Unprocessed tasks", icon: Task01Icon },
  { id: "notes" as FolderId, label: "Notes", icon: StickyNote01Icon },
  { id: "links" as FolderId, label: "Links", icon: Link01Icon },
  { id: "organize" as FolderId, label: "To organize later", icon: Tag01Icon },
];

const now = Date.now();
const DAY = 86_400_000;

const seedItems: InboxItem[] = [
  {
    id: "1",
    title: "Try RRF re-ranking on the notebook retriever",
    body: "Blend BM25 and dense retrieval scores with reciprocal rank fusion, compare against the current cosine-only baseline.",
    folder: "ideas",
    createdAt: now - 2 * 60 * 60 * 1000,
  },
  {
    id: "2",
    title: "Renew gym membership before the 15th",
    body: "Auto-renew is off this cycle, do it manually or lose the founding-member rate.",
    folder: "tasks",
    createdAt: now - 20 * 60 * 60 * 1000,
  },
  {
    id: "3",
    title: "prisma.io/docs/mongodb-preview",
    body: "MongoDB connector docs — check if the preview flag is still required in 6.x.",
    folder: "links",
    createdAt: now - 2 * DAY,
  },
  {
    id: "4",
    title: "Note on convolution kernels from class",
    body: "Separable kernels reduce a 2D conv to two 1D passes — big win for large kernel sizes.",
    folder: "notes",
    createdAt: now - 6 * DAY,
  },
];

function formatTimestamp(ms: number): string {
  const diff = now - ms;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function InboxView() {
  const [items, setItems] = useState<InboxItem[]>(seedItems);
  const [activeFolder, setActiveFolder] = useState<FolderId>("ideas");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [composerOpen, setComposerOpen] = useState(false);

  const activeLabel = folders.find((f) => f.id === activeFolder)?.label ?? "";

  const visible = useMemo(() => {
    const filtered = items
      .filter((i) => i.folder === activeFolder)
      .filter((i) =>
        query.trim()
          ? (i.title + " " + i.body).toLowerCase().includes(query.trim().toLowerCase())
          : true
      );
    return filtered.sort((a, b) =>
      sort === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );
  }, [items, activeFolder, query, sort]);

  function handleCreate(payload: NewItemPayload) {
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        title: payload.title,
        body: payload.body,
        folder: payload.folder as FolderId,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setActiveFolder(payload.folder as FolderId);
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6">
        {/* Folder pills — stand-in for the removed sidebar */}
        <div className="flex flex-wrap items-center gap-2 pt-6">
          {folders.map((f) => {
            const accent = ACCENT[FOLDER_ACCENT[f.id] ?? "gray"];
            const active = activeFolder === f.id;
            const count = items.filter((i) => i.folder === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={cn(
                  ui.pill,
                  "border border-border text-muted-foreground transition-colors hover:text-foreground",
                  active && cn("border-transparent", accent.bg, accent.text)
                )}
              >
                <HugeiconsIcon icon={f.icon} size={12} />
                {f.label}
                {count > 0 ? <span className="font-mono text-[10px] opacity-70">{count}</span> : null}
              </button>
            );
          })}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between gap-4 border-b border-border py-5 mt-4">
          <h1 className="text-[26px] font-bold leading-none tracking-tight">{activeLabel}</h1>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 transition-colors focus-within:border-brand/50 focus-within:bg-background">
              <HugeiconsIcon icon={Search01Icon} size={15} className="text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-40 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOrder)}
              className="h-[38px] rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            <button
              onClick={() => setComposerOpen(true)}
              className="flex h-[38px] items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
            >
              <HugeiconsIcon icon={Add01Icon} size={15} />
              New
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-1.5 text-center">
              <span className="text-[15px] text-muted-foreground">Nothing here yet.</span>
              <span className={cn(ui.caption, "text-muted-foreground/70")}>
                Whatever&apos;s on your mind goes here first.
              </span>
            </div>
          ) : (
            visible.map((item) => {
              const accent = ACCENT[FOLDER_ACCENT[item.folder] ?? "gray"];
              return (
                <button
                  key={item.id}
                  className="flex w-full items-center justify-between gap-6 border-b border-border/60 py-4 text-left transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", accent.bar)} />
                      <span className="truncate text-[15px] font-medium">{item.title}</span>
                    </div>
                    {item.body ? (
                      <p className="mt-1 truncate pl-3.5 text-[13px] text-muted-foreground">
                        {item.body}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {formatTimestamp(item.createdAt)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <ItemComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        folders={folders}
        defaultFolder={activeFolder}
        onCreate={handleCreate}
      />
    </div>
  );
}