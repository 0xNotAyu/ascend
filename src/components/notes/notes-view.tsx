"use client";

import { Fragment, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  FolderAddIcon,
  Folder01Icon,
  Search01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { FolderTree, NoteRow } from "@/components/notes/folder-tree";
import { MarkdownEditor } from "@/components/notes/markdown-editor";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import type { Folder, Note } from "@/lib/notes/types";

function getFolderPath(folders: Folder[], folderId: string | null): Folder[] {
  const path: Folder[] = [];
  let current = folders.find((f) => f.id === folderId) ?? null;
  while (current) {
    path.unshift(current);
    current = folders.find((f) => f.id === current!.parentId) ?? null;
  }
  return path;
}

function countWords(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export default function NotesView() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const notesCountByFolder = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of notes) {
      let fid = n.folderId;
      while (fid) {
        counts[fid] = (counts[fid] ?? 0) + 1;
        fid = folders.find((f) => f.id === fid)?.parentId ?? null;
      }
    }
    return counts;
  }, [notes, folders]);

  const rootNotes = notes.filter((n) => n.folderId === null);

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return notes.filter((n) =>
      (n.title + " " + n.content).toLowerCase().includes(q),
    );
  }, [notes, query]);

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null;
  const folderPath = activeNote
    ? getFolderPath(folders, activeNote.folderId)
    : [];
  const openTabs = openNoteIds
    .map((id) => notes.find((n) => n.id === id))
    .filter(Boolean) as Note[];

  function openNote(id: string) {
    setOpenNoteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveNoteId(id);
  }

  function closeTab(id: string) {
    setOpenNoteIds((prev) => {
      const next = prev.filter((tid) => tid !== id);
      if (activeNoteId === id) {
        setActiveNoteId(next.length ? next[next.length - 1] : null);
      }
      return next;
    });
  }

  function createFolder(parentId: string | null) {
    setFolders((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "New folder", parentId },
    ]);
  }

  function renameFolder(id: string, name: string) {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  }

  function deleteFolder(id: string) {
    const toDelete = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const f of folders) {
        if (f.parentId && toDelete.has(f.parentId) && !toDelete.has(f.id)) {
          toDelete.add(f.id);
          changed = true;
        }
      }
    }
    setFolders((prev) => prev.filter((f) => !toDelete.has(f.id)));
    setNotes((prev) =>
      prev.map((n) =>
        n.folderId && toDelete.has(n.folderId) ? { ...n, folderId: null } : n,
      ),
    );
    if (activeFolderId && toDelete.has(activeFolderId)) setActiveFolderId(null);
  }

  function createNote(folderId: string | null) {
    const id = crypto.randomUUID();
    setNotes((prev) => [
      {
        id,
        title: "Untitled",
        content: "",
        folderId,
        tags: [],
        updatedAt: Date.now(),
      },
      ...prev,
    ]);
    openNote(id);
    setActiveFolderId(folderId);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    closeTab(id);
  }

  function updateNoteContent(id: string, content: string) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, content, updatedAt: Date.now() } : n,
      ),
    );
  }

  function renameNote(id: string, title: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)));
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground text-[13px]">
      {/* Ribbon */}
      <div className="flex w-9 shrink-0 flex-col items-center gap-1 border-r border-border bg-background-sidebar py-2">
        <RibbonAction
          icon={Folder01Icon}
          label="Toggle file explorer"
          active={sidebarVisible}
          onClick={() => setSidebarVisible((v) => !v)}
        />
        <RibbonAction
          icon={Search01Icon}
          label="Search"
          active={searchOpen}
          onClick={() => setSearchOpen((v) => !v)}
        />
        <RibbonAction
          icon={Add01Icon}
          label="New note"
          onClick={() => createNote(activeFolderId)}
        />
      </div>

      {/* Sidebar */}
      {sidebarVisible ? (
        <div className="flex w-64 shrink-0 flex-col border-r border-border bg-background-sidebar">
          <div className="flex items-center gap-1 px-2 py-1.5">
            <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Files
            </span>
            <div className="ml-auto flex items-center gap-0.5">
              <IconAction
                icon={Add01Icon}
                label="New note"
                onClick={() => createNote(activeFolderId)}
              />
              <IconAction
                icon={FolderAddIcon}
                label="New folder"
                onClick={() => createFolder(null)}
              />
            </div>
          </div>

          {searchOpen ? (
            <div className="px-2 pb-1.5">
              <div className="flex items-center gap-1.5 rounded border border-border bg-background px-2 py-1">
                <HugeiconsIcon
                  icon={Search01Icon}
                  size={12}
                  className="shrink-0 text-muted-foreground"
                />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes"
                  className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto px-1 pb-2">
            {searchResults ? (
              searchResults.length === 0 ? (
                <p className="px-2 pt-2 text-[12px] text-muted-foreground">
                  No matches.
                </p>
              ) : (
                searchResults.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    depth={0}
                    active={activeNoteId === note.id}
                    onSelect={() => openNote(note.id)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))
              )
            ) : (
              <>
                {rootNotes.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    depth={0}
                    active={activeNoteId === note.id}
                    onSelect={() => openNote(note.id)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))}
                <FolderTree
                  folders={folders}
                  notes={notes}
                  notesCountByFolder={notesCountByFolder}
                  activeFolderId={activeFolderId}
                  activeNoteId={activeNoteId}
                  onSelectFolder={setActiveFolderId}
                  onSelectNote={openNote}
                  onCreateChild={createFolder}
                  onCreateNote={createNote}
                  onRename={renameFolder}
                  onDeleteFolder={deleteFolder}
                  onDeleteNote={deleteNote}
                />
                {folders.length === 0 && rootNotes.length === 0 ? (
                  <p className="px-2 pt-2 text-[12px] text-muted-foreground">
                    Nothing here yet.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Tab strip */}
        {openTabs.length > 0 ? (
          <div className="flex h-9 shrink-0 items-stretch border-b border-border bg-background-sidebar">
            {openTabs.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={cn(
                  "group flex max-w-[180px] shrink-0 items-center gap-2 border-r border-border px-3 text-[12px] text-muted-foreground transition-colors",
                  activeNoteId === note.id
                    ? "bg-background text-foreground"
                    : "hover:bg-background-hover",
                )}
              >
                <span className="truncate">{note.title || "Untitled"}</span>
                <span
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(note.id);
                  }}
                  className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-background-active group-hover:opacity-100"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {activeNote ? (
          <>
            <div className="border-b border-border px-8 py-2">
              <Breadcrumb>
                <BreadcrumbList className="text-[12px]">
                  {folderPath.map((f) => (
                    <Fragment key={f.id}>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={() => setActiveFolderId(f.id)}
                          className="cursor-pointer"
                        >
                          {f.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </Fragment>
                  ))}
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {activeNote.title || "Untitled"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-3xl px-10 py-8">
                <div className="flex items-start justify-between gap-4">
                  <input
                    value={activeNote.title}
                    onChange={(e) => renameNote(activeNote.id, e.target.value)}
                    placeholder="Untitled"
                    className="w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40"
                  />
                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    aria-label="Delete note"
                    className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                  </button>
                </div>
                <div className="mt-5">
                  <MarkdownEditor
                    key={activeNote.id}
                    value={activeNote.content}
                    onChange={(content) =>
                      updateNoteContent(activeNote.id, content)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="flex h-6 shrink-0 items-center gap-3 border-t border-border bg-background-sidebar px-3 text-[11px] text-muted-foreground">
              <span>0 backlinks</span>
              <span>{countWords(activeNote.content)} words</span>
              <span>{activeNote.content.length} characters</span>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <span className="text-[12px] text-muted-foreground">
              Select or create a note to start writing.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function IconAction({
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
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background-hover hover:text-foreground"
    >
      <HugeiconsIcon icon={icon} size={13} />
    </button>
  );
}

function RibbonAction({
  icon,
  label,
  active,
  onClick,
}: {
  icon: IconSvgElement;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background-hover hover:text-foreground",
        active && "bg-background-active text-brand",
      )}
    >
      <HugeiconsIcon icon={icon} size={15} />
    </button>
  );
}
