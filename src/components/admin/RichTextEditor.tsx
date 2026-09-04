// components/admin/RichTextEditor.tsx
"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Table as TableIcon,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Khi có, cho phép dán ảnh (Ctrl+V) trực tiếp vào editor: ảnh được upload qua hàm này rồi chèn vào nội dung. */
  onImageUpload?: (file: File) => Promise<string>;
}

// Trùng đúng selector đang style ở trang chi tiết sản phẩm (ProductDetailClient) — nhờ vậy
// bảng/heading gõ trong editor hiển thị y hệt lúc xem trước lẫn lúc lên trang thật.
const CONTENT_CLASS =
  "min-h-[220px] px-3 py-2.5 text-sm focus:outline-none prose prose-sm max-w-none " +
  "[&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2 " +
  "[&_img]:max-w-full [&_img]:h-auto";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  icon: Icon,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "p-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
        active ? "bg-dwarfs-dark text-white" : "hover:bg-dwarfs-surface"
      )}
    >
      <Icon size={14} />
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL:", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
      <ToolbarButton
        label="Tiêu đề vừa"
        icon={Heading2}
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="Tiêu đề nhỏ"
        icon={Heading3}
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        label="In đậm"
        icon={Bold}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="In nghiêng"
        icon={Italic}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Gạch chân"
        icon={UnderlineIcon}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        label="Gạch ngang"
        icon={Strikethrough}
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        label="Căn trái"
        icon={AlignLeft}
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <ToolbarButton
        label="Căn giữa"
        icon={AlignCenter}
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <ToolbarButton
        label="Căn phải"
        icon={AlignRight}
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        label="Danh sách"
        icon={List}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Danh sách số"
        icon={ListOrdered}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton label="Chèn liên kết" icon={LinkIcon} active={editor.isActive("link")} onClick={setLink} />
      <ToolbarButton
        label="Gỡ liên kết"
        icon={Unlink}
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      />
      <ToolbarButton
        label="Chèn bảng (vd bảng size)"
        icon={TableIcon}
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        label="Hoàn tác"
        icon={Undo2}
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        label="Làm lại"
        icon={Redo2}
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}

export function RichTextEditor({ value, onChange, onImageUpload }: RichTextEditorProps) {
  // Đọc qua ref để handlePaste (được đăng ký 1 lần lúc tạo editor) luôn thấy giá trị mới nhất
  // của onImageUpload, tránh bị "đóng băng" closure ở lần render đầu.
  const onImageUploadRef = useRef(onImageUpload);
  useEffect(() => {
    onImageUploadRef.current = onImageUpload;
  }, [onImageUpload]);
  const editorRef = useRef<Editor | null>(null);

  const uploadImageAt = (file: File, pos: number) => {
    const editor = editorRef.current;
    const upload = onImageUploadRef.current;
    if (!editor) return;
    if (!upload) {
      window.alert("Không thể dán ảnh trực tiếp ở đây. Vui lòng dùng mục tải ảnh sản phẩm.");
      return;
    }

    const placeholder = "Đang tải ảnh...";
    editor.chain().focus().insertContentAt(pos, placeholder).run();
    const range = { from: pos, to: pos + placeholder.length };

    upload(file)
      .then((url) => {
        editorRef.current
          ?.chain()
          .focus()
          .insertContentAt(range, { type: "image", attrs: { src: url } })
          .run();
      })
      .catch(() => {
        editorRef.current?.chain().focus().deleteRange(range).run();
        window.alert("Tải ảnh thất bại, vui lòng thử lại.");
      });
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: "Mô tả, chất liệu, hướng dẫn bảo quản, bảng size..." }),
    ],
    content: value || "",
    editorProps: {
      attributes: { class: CONTENT_CLASS },
      handlePaste: (view, event) => {
        const item = Array.from(event.clipboardData?.items ?? []).find((it) => it.type.startsWith("image/"));
        const file = item?.getAsFile();
        if (!file) return false;
        event.preventDefault();
        uploadImageAt(file, view.state.selection.from);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  if (!editor) {
    return <div className="border border-border bg-white min-h-[260px]" />;
  }

  return (
    <div className="border border-border bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
