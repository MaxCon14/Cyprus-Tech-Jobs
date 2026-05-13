"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Pilcrow, List, ListOrdered, Undo2, Redo2,
} from "lucide-react";

interface Props {
  name:            string;
  initialContent?: string;
  placeholder?:    string;
  error?:          string;
}

export function RichTextEditor({
  name,
  initialContent = "",
  placeholder = "Describe the role, responsibilities, and requirements…",
  error,
}: Props) {
  // Re-render on every transaction so toolbar active/disabled states stay in sync
  const [, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote:     false,
        codeBlock:      false,
        horizontalRule: false,
        code:           false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent || undefined,
    onTransaction: () => setTick(t => t + 1),
    editorProps: {
      attributes: {
        class: "rte-content",
        style: [
          "min-height:220px",
          "padding:14px 16px",
          "outline:none",
          "font-family:var(--font-sans)",
          "font-size:14px",
          "line-height:1.7",
          "color:var(--text)",
        ].join(";"),
      },
    },
  });

  // always-valid hidden input — value is updated via onUpdate below
  const html = editor?.getHTML() ?? initialContent ?? "";

  // toolbar helper
  const tool = (label: string, active: boolean, disabled: boolean, onClick: () => void, icon: React.ReactNode) => (
    <button
      key={label}
      type="button"
      title={label}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        display: "grid", placeItems: "center",
        width: 30, height: 30, borderRadius: 5, border: "none", cursor: disabled ? "default" : "pointer",
        background: active ? "var(--accent-soft)" : "transparent",
        color: active ? "var(--accent)" : disabled ? "var(--text-subtle)" : "var(--text-muted)",
        transition: "background 120ms, color 120ms",
      }}
    >
      {icon}
    </button>
  );

  const sep = <span style={{ width: 1, height: 20, background: "var(--border)", flexShrink: 0 }} />;

  return (
    <div style={{
      border: `1px solid ${error ? "var(--error)" : "var(--border)"}`,
      borderRadius: 8,
      background: "var(--surface)",
      overflow: "hidden",
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        padding: "6px 10px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-muted)",
        flexWrap: "wrap",
      }}>
        {tool("Bold",   editor?.isActive("bold")   ?? false, !editor, () => editor?.chain().focus().toggleBold().run(),   <Bold   size={13} />)}
        {tool("Italic", editor?.isActive("italic") ?? false, !editor, () => editor?.chain().focus().toggleItalic().run(), <Italic size={13} />)}
        {sep}
        {tool("Paragraph", editor?.isActive("paragraph") ?? false, !editor, () => editor?.chain().focus().setParagraph().run(), <Pilcrow   size={13} />)}
        {tool("Heading 1", editor?.isActive("heading", { level: 1 }) ?? false, !editor, () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={13} />)}
        {tool("Heading 2", editor?.isActive("heading", { level: 2 }) ?? false, !editor, () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={13} />)}
        {tool("Heading 3", editor?.isActive("heading", { level: 3 }) ?? false, !editor, () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={13} />)}
        {sep}
        {tool("Bullet list",  editor?.isActive("bulletList")  ?? false, !editor, () => editor?.chain().focus().toggleBulletList().run(),  <List        size={13} />)}
        {tool("Ordered list", editor?.isActive("orderedList") ?? false, !editor, () => editor?.chain().focus().toggleOrderedList().run(), <ListOrdered size={13} />)}
        {sep}
        {tool("Undo", false, !(editor?.can().undo() ?? false), () => editor?.chain().focus().undo().run(), <Undo2 size={13} />)}
        {tool("Redo", false, !(editor?.can().redo() ?? false), () => editor?.chain().focus().redo().run(), <Redo2 size={13} />)}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Hidden input carries the HTML value on form submit */}
      <input
        type="hidden"
        name={name}
        value={html}
        // keep in sync as user types
        ref={(el) => {
          if (!el || !editor) return;
          editor.on("update", () => {
            el.value = editor.getHTML();
          });
        }}
      />
    </div>
  );
}
