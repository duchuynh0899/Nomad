// components/admin/RichTextEditor.tsx
"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Underline } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Khi có, cho phép dán ảnh (Ctrl+V) trực tiếp vào editor: ảnh được upload qua hàm này rồi chèn thẻ <img>. */
  onImageUpload?: (file: File) => Promise<string>;
}

const TOOLBAR = [
  { command: "bold", icon: Bold, label: "In đậm" },
  { command: "italic", icon: Italic, label: "In nghiêng" },
  { command: "underline", icon: Underline, label: "Gạch chân" },
  { command: "insertUnorderedList", icon: List, label: "Danh sách" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Danh sách số" },
] as const;

export function RichTextEditor({ value, onChange, onImageUpload }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Chỉ set innerHTML lần đầu / khi value đổi từ bên ngoài (vd load data edit),
  // tránh ghi đè con trỏ chuột khi người dùng đang gõ.
  useEffect(() => {
    if (!editorRef.current) return;
    if (isFirstRender.current || document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = DOMPurify.sanitize(value || "");
      isFirstRender.current = false;
    }
  }, [value]);

  const emitChange = () => {
    if (!editorRef.current) return;
    onChange(DOMPurify.sanitize(editorRef.current.innerHTML));
  };

  const exec = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt("Nhập URL:");
    if (!url) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, url);
    emitChange();
  };

  // Chèn 1 node vào đúng vị trí con trỏ hiện tại trong editor (fallback: cuối nội dung).
  const insertNodeAtCursor = (node: Node) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    let range: Range;
    if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
      range = selection.getRangeAt(0);
    } else {
      range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
    }
    range.deleteContents();
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return; // không có ảnh -> để trình duyệt tự xử lý paste text như bình thường

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    if (!onImageUpload) {
      window.alert("Không thể dán ảnh trực tiếp ở đây. Vui lòng dùng mục tải ảnh sản phẩm.");
      return;
    }

    const placeholder = document.createElement("span");
    placeholder.textContent = "Đang tải ảnh...";
    placeholder.contentEditable = "false";
    insertNodeAtCursor(placeholder);

    try {
      const url = await onImageUpload(file);
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      placeholder.replaceWith(img);
    } catch {
      placeholder.replaceWith(document.createTextNode(""));
      window.alert("Tải ảnh thất bại, vui lòng thử lại.");
    } finally {
      emitChange();
    }
  };

  return (
    <div className="border border-border bg-white">
      <div className="flex items-center gap-1 border-b border-border p-2">
        {TOOLBAR.map(({ command, icon: Icon, label }) => (
          <button
            key={command}
            type="button"
            onClick={() => exec(command)}
            title={label}
            aria-label={label}
            className="p-2 hover:bg-dwarfs-surface transition-colors"
          >
            <Icon size={14} />
          </button>
        ))}
        <button
          type="button"
          onClick={insertLink}
          title="Chèn liên kết"
          aria-label="Chèn liên kết"
          className="p-2 hover:bg-dwarfs-surface transition-colors"
        >
          <LinkIcon size={14} />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={emitChange}
        onBlur={emitChange}
        onPaste={handlePaste}
        className={cn(
          "min-h-[180px] px-3 py-2.5 text-sm focus:outline-none prose prose-sm max-w-none",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto"
        )}
        suppressContentEditableWarning
      />
    </div>
  );
}
