"use client";

import { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// A single toolbar button — active state highlighted in orange
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm border transition duration-150
        ${
          active
            ? "bg-[#ff4102] text-white border-[#ff4102]"
            : "border-[#dfdbd8] hover:bg-gray-100"
        }`}
    >
      {children}
    </button>
  );
}

export function Editor({ value, onChange, placeholder }: Props) {
  // useRef to trigger hidden file input for image upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    // StarterKit bundles: Bold, Italic, Strike, Heading, BulletList,
    // OrderedList, Blockquote, CodeBlock, HardBreak, History (undo/redo)
    extensions: [
      StarterKit.configure({
        // Disabled because we configure these separately below
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        // Allow alignment on these node types
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        // Opens link dialog on click in editor
        openOnClick: false,
      }),
      Image.configure({
        // Allow inline images inside paragraphs
        inline: true,
      }),
      Youtube.configure({
        // Embed dimensions in the editor
        width: 640,
        height: 360,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing...",
      }),
    ],
    // Initial HTML content passed from parent (e.g. existing translation body)
    content: value,
    // Called on every keystroke — parent receives updated HTML string
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // --- Toolbar actions ---

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editor) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      // No Content-Type header — browser sets it automatically with boundary for multipart
    });

    if (res.ok) {
      const { url } = await res.json();
      // Insert image at current cursor position
      editor.chain().focus().setImage({ src: url }).run();
    }

    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  function handleSetLink() {
    if (!editor) return;
    const url = window.prompt("Enter URL", editor.getAttributes("link").href);
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  function handleYoutube() {
    if (!editor) return;
    const url = window.prompt("Enter YouTube URL");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  }

  return (
    <div className="border border-[#dfdbd8] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-[#dfdbd8] bg-gray-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <b>B</b>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <i>I</i>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>

        <span className="w-px bg-[#dfdbd8] mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <span className="w-px bg-[#dfdbd8] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered list"
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          ❝
        </ToolbarButton>

        <span className="w-px bg-[#dfdbd8] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align left"
        >
          ←
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align center"
        >
          ↔
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align right"
        >
          →
        </ToolbarButton>

        <span className="w-px bg-[#dfdbd8] mx-1" />

        <ToolbarButton
          onClick={handleSetLink}
          active={editor.isActive("link")}
          title="Link"
        >
          🔗
        </ToolbarButton>

        {/* Hidden file input — triggered programmatically by the Image button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageUpload}
        />
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Upload image"
        >
          🖼
        </ToolbarButton>

        <ToolbarButton onClick={handleYoutube} title="Embed YouTube">
          ▶ YouTube
        </ToolbarButton>

        <span className="w-px bg-[#dfdbd8] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          ↪
        </ToolbarButton>
      </div>

      {/* Editor content area — prose class applies typography styles to raw HTML */}
      <EditorContent
        editor={editor}
        className="prose max-w-none w-full p-4 min-h-64 focus-within:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:w-full"
      />
    </div>
  );
}
