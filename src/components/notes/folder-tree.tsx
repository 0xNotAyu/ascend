"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  Folder01Icon,
  Add01Icon,
  Delete02Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { accentForTag, ui } from "@/lib/theme";
import type { Folder, Note } from "@/lib/notes/types";

interface TreeProps {
  folders: Folder[];
  notes: Note[];
  notesCountByFolder: Record<string, number>;
  activeFolderId: string | null;
  activeNoteId: string | null;
  onSelectFolder: (id: string) => void;
  onSelectNote: (id: string) => void;
  onCreateChild: (parentId: string) => void;
  onCreateNote: (folderId: string) => void;
  onRename: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteNote: (id: string) => void;
  parentId?: string | null;
  depth?: number;
}

export function FolderTree({
  parentId = null,
  depth = 0,
  ...props
}: TreeProps) {
  const children = props.folders.filter((f) => f.parentId === parentId);
  if (children.length === 0) return null;
  return (
    <div className="flex flex-col">
      {children.map((folder) => (
        <FolderNode key={folder.id} folder={folder} depth={depth} {...props} />
      ))}
    </div>
  );
}

function FolderNode({
  folder,
  depth,
  folders,
  notes,
  notesCountByFolder,
  activeFolderId,
  activeNoteId,
  onSelectFolder,
  onSelectNote,
  onCreateChild,
  onCreateNote,
  onRename,
  onDeleteFolder,
  onDeleteNote,
}: TreeProps & { folder: Folder; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(folder.name);
  const hasChildren = folders.some((f) => f.parentId === folder.id);
  const folderNotes = notes.filter((n) => n.folderId === folder.id);
  const active = activeFolderId === folder.id && !activeNoteId;
  const count = notesCountByFolder[folder.id] ?? 0;

  function commit() {
    const t = draft.trim();
    if (t) onRename(folder.id, t);
    setEditing(false);
  }

  return (
    <div>
      <div
        className={cn(
          "group flex h-6.5 items-center gap-1 rounded pr-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-background-hover hover:text-foreground",
          active && "bg-background-active text-foreground",
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        <button
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center transition-transform",
            expanded && "rotate-90",
            !hasChildren && folderNotes.length === 0 && "opacity-0",
          )}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </button>

        <button
          onClick={() => onSelectFolder(folder.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left"
        >
          <HugeiconsIcon icon={Folder01Icon} size={14} className="shrink-0" />
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent outline-none"
            />
          ) : (
            <span className="truncate" onDoubleClick={() => setEditing(true)}>
              {folder.name}
            </span>
          )}
        </button>

        {count > 0 && !editing ? (
          <span className="font-mono text-[10px]">{count}</span>
        ) : null}

        <div className="hidden items-center gap-0.5 group-hover:flex">
          <button
            onClick={() => onCreateNote(folder.id)}
            aria-label="New note in folder"
            title="New note"
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-background"
          >
            <HugeiconsIcon icon={File01Icon} size={11} />
          </button>
          <button
            onClick={() => onCreateChild(folder.id)}
            aria-label="New subfolder"
            title="New subfolder"
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-background"
          >
            <HugeiconsIcon icon={Add01Icon} size={11} />
          </button>
          <button
            onClick={() => onDeleteFolder(folder.id)}
            aria-label="Delete folder"
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive"
          >
            <HugeiconsIcon icon={Delete02Icon} size={11} />
          </button>
        </div>
      </div>

      {expanded ? (
        <div>
          {folderNotes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              depth={depth + 1}
              active={activeNoteId === note.id}
              onSelect={() => onSelectNote(note.id)}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))}
          <FolderTree
            folders={folders}
            notes={notes}
            notesCountByFolder={notesCountByFolder}
            activeFolderId={activeFolderId}
            activeNoteId={activeNoteId}
            onSelectFolder={onSelectFolder}
            onSelectNote={onSelectNote}
            onCreateChild={onCreateChild}
            onCreateNote={onCreateNote}
            onRename={onRename}
            onDeleteFolder={onDeleteFolder}
            onDeleteNote={onDeleteNote}
            parentId={folder.id}
            depth={depth + 1}
          />
        </div>
      ) : null}
    </div>
  );
}

export function NoteRow({
  note,
  depth,
  active,
  onSelect,
  onDelete,
}: {
  note: Note;
  depth: number;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex h-6.5 items-center gap-1.5 rounded pr-1 text-[12.5px] text-muted-foreground transition-colors hover:bg-background-hover hover:text-foreground",
        active && "bg-background-active text-foreground",
      )}
      style={{ paddingLeft: `${depth * 12 + 22}px` }}
    >
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-left"
      >
        <HugeiconsIcon icon={File01Icon} size={13} className="shrink-0" />
        <span className="truncate">{note.title}</span>
        {note.tags.length > 0 ? (
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              accentForTag(note.tags[0]).bar,
            )}
          />
        ) : null}
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete note"
        className="hidden h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive group-hover:flex"
      >
        <HugeiconsIcon icon={Delete02Icon} size={11} />
      </button>
    </div>
  );
}
