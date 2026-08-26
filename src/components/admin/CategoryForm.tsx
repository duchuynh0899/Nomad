"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminCreateCategory, adminUpdateCategory } from "@/lib/api/categories";
import { ApiError } from "@/lib/api/http";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types/api";

export function CategoryForm({ initialData }: { initialData?: Category }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, slug, description: description || undefined, isActive };
      if (isEdit && initialData) {
        await authFetch((token) => adminUpdateCategory(token, initialData._id, payload));
        toast("Đã cập nhật danh mục", "success");
      } else {
        await authFetch((token) => adminCreateCategory(token, payload));
        toast("Đã tạo danh mục", "success");
      }
      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Tên danh mục</label>
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full border border-border px-3 py-2.5 text-sm bg-white"
        />
      </div>

      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Slug (URL)</label>
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          className="w-full border border-border px-3 py-2.5 text-sm bg-white font-mono"
        />
      </div>

      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-border px-3 py-2.5 text-sm bg-white resize-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Đang hiển thị (active)
      </label>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo danh mục"}
      </button>
    </form>
  );
}
