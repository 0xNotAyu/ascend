"use client";

import { useEffect, useRef } from "react";
import { EditorState, Range } from "@codemirror/state";
import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  keymap,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";

const HEADER_RE = /^(#{1,6})\s+/;
const BOLD_RE = /\*\*([^*\n]+)\*\*/g;
const ITALIC_RE = /(?<!\*)\*([^*\n]+)\*(?!\*)|(?<!_)_([^_\n]+)_(?!_)/g;
const CODE_RE = /`([^`\n]+)`/g;
const BLOCKQUOTE_RE = /^>\s?/;
const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const HR_RE = /^(?:-{3,}|\*{3,}|_{3,})\s*$/;

class HrWidget extends WidgetType {
  toDOM() {
    const el = document.createElement("div");
    el.className = "cm-hr-rendered";
    return el;
  }
  eq() {
    return true;
  }
  ignoreEvent() {
    return true;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const decos: Range<Decoration>[] = [];
  const activeLine = view.state.doc.lineAt(view.state.selection.main.head).number;

  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos);
      const text = line.text;
      const isActive = line.number === activeLine;
      const trimmed = text.trim();

      // Horizontal rule
      if (trimmed.length > 0 && HR_RE.test(trimmed)) {
        if (!isActive) {
          decos.push(
            Decoration.replace({ widget: new HrWidget(), block: true }).range(line.from, line.to)
          );
        } else {
          decos.push(Decoration.line({ class: "cm-hr-active" }).range(line.from));
        }
        pos = line.to + 1;
        continue;
      }

      // Heading
      const h = HEADER_RE.exec(text);
      if (h) {
        const level = h[1].length;
        decos.push(Decoration.line({ class: `cm-heading cm-h${level}` }).range(line.from));
        if (!isActive) {
          decos.push(Decoration.replace({}).range(line.from, line.from + h[0].length));
        }
      }

      // Blockquote
      const bq = BLOCKQUOTE_RE.exec(text);
      if (bq) {
        decos.push(Decoration.line({ class: "cm-blockquote" }).range(line.from));
        if (!isActive) {
          decos.push(Decoration.replace({}).range(line.from, line.from + bq[0].length));
        }
      }

      let m: RegExpExecArray | null;
      BOLD_RE.lastIndex = 0;
      while ((m = BOLD_RE.exec(text))) {
        const s = line.from + m.index;
        const e = s + m[0].length;
        if (!isActive) {
          decos.push(Decoration.replace({}).range(s, s + 2));
          decos.push(Decoration.mark({ class: "cm-bold" }).range(s + 2, e - 2));
          decos.push(Decoration.replace({}).range(e - 2, e));
        } else {
          decos.push(Decoration.mark({ class: "cm-bold cm-mark" }).range(s, e));
        }
      }

      ITALIC_RE.lastIndex = 0;
      while ((m = ITALIC_RE.exec(text))) {
        const s = line.from + m.index;
        const e = s + m[0].length;
        if (!isActive) {
          decos.push(Decoration.replace({}).range(s, s + 1));
          decos.push(Decoration.mark({ class: "cm-italic" }).range(s + 1, e - 1));
          decos.push(Decoration.replace({}).range(e - 1, e));
        } else {
          decos.push(Decoration.mark({ class: "cm-italic cm-mark" }).range(s, e));
        }
      }

      CODE_RE.lastIndex = 0;
      while ((m = CODE_RE.exec(text))) {
        const s = line.from + m.index;
        const e = s + m[0].length;
        if (!isActive) {
          decos.push(Decoration.replace({}).range(s, s + 1));
          decos.push(Decoration.mark({ class: "cm-code" }).range(s + 1, e - 1));
          decos.push(Decoration.replace({}).range(e - 1, e));
        } else {
          decos.push(Decoration.mark({ class: "cm-code cm-mark" }).range(s, e));
        }
      }

      // Links: [text](url)
      LINK_RE.lastIndex = 0;
      while ((m = LINK_RE.exec(text))) {
        const s = line.from + m.index;
        const e = s + m[0].length;
        const textLen = m[1].length;
        if (!isActive) {
          decos.push(Decoration.replace({}).range(s, s + 1));
          decos.push(Decoration.mark({ class: "cm-link" }).range(s + 1, s + 1 + textLen));
          decos.push(Decoration.replace({}).range(s + 1 + textLen, e));
        } else {
          decos.push(Decoration.mark({ class: "cm-link cm-mark" }).range(s, e));
        }
      }

      pos = line.to + 1;
    }
  }

  decos.sort((a, b) => a.from - b.from || (a as any).startSide - (b as any).startSide);
  return Decoration.set(decos, true);
}

const livePreview = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.selectionSet || u.viewportChanged) {
        this.decorations = buildDecorations(u.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

const theme = EditorView.theme({
  "&": { fontSize: "15px", height: "100%" },
  ".cm-content": { fontFamily: "var(--font-sans)", padding: "0", caretColor: "var(--foreground)" },
  ".cm-line": { padding: "0 2px", lineHeight: "1.8" },
  "&.cm-focused": { outline: "none" },

  ".cm-h1": { fontSize: "28px", fontWeight: "700" },
  ".cm-h2": { fontSize: "22px", fontWeight: "700" },
  ".cm-h3": { fontSize: "18px", fontWeight: "600" },
  ".cm-h4, .cm-h5, .cm-h6": { fontSize: "16px", fontWeight: "600" },

  ".cm-bold": { fontWeight: "700" },
  ".cm-italic": { fontStyle: "italic" },
  ".cm-code": {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    background: "var(--muted)",
    borderRadius: "4px",
    padding: "1px 4px",
  },

  ".cm-blockquote": {
    borderLeft: "3px solid var(--brand, #8b5cf6)",
    paddingLeft: "14px",
    margin: "4px 0",
    color: "var(--muted-foreground)",
  },

  ".cm-link": {
    color: "var(--brand, #8b5cf6)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    cursor: "pointer",
  },

  ".cm-hr-rendered": {
    height: "1px",
    background: "var(--border)",
    margin: "22px 0",
  },
  ".cm-hr-active": {
    color: "var(--muted-foreground)",
    opacity: "0.5",
  },

  ".cm-mark": { opacity: "0.4" },
});

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          livePreview,
          EditorView.lineWrapping,
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString());
          }),
          theme,
        ],
      }),
      parent: hostRef.current,
    });
    viewRef.current = view;
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={hostRef} className="h-full w-full" />;
}