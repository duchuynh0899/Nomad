"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminBulkClearSale, adminBulkSetSale } from "@/lib/api/products";
import { ApiError } from "@/lib/api/http";
import type { Category } from "@/types/api";

export function BulkFlashSaleForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();

  const [categoryId, setCategoryId] = useState("");
  const [percentOff, setPercentOff] = useState("20");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !startAt || !endAt) {
      toast("Vui lòng chọn danh mục và đầy đủ thời gian bắt đầu/kết thúc", "error");
      return;
    }
    setSaving(true);
    try {
      const result = await authFetch((token) =>
        adminBulkSetSale(token, {
          categoryId,
          percentOff: Number(percentOff),
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
        })
      );
      toast(`Đã áp dụng sale cho ${result.modified} sản phẩm`, "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể áp dụng flash sale", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!categoryId) {
      toast("Vui lòng chọn danh mục cần gỡ sale", "error");
      return;
    }
    setClearing(true);
    try {
      const result = await authFetch((token) => adminBulkClearSale(token, { categoryId }));
      toast(`Đã gỡ sale cho ${result.modified} sản phẩm`, "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể gỡ flash sale", "error");
    } finally {
      setClearing(false);
    }
  };

  return (
    <form onSubmit={handleApply} className="max-w-xl space-y-5">
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Danh mục</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full border border-border px-3 py-2.5 text-sm bg-white"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Giảm giá (%)</label>
        <input
          type="number"
          min={1}
          max={90}
          value={percentOff}
          onChange={(e) => setPercentOff(e.target.value)}
          required
          className="w-full border border-border px-3 py-2.5 text-sm bg-white"
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Giá sale được tính riêng cho từng sản phẩm dựa trên giá bán hiện tại của nó.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Bắt đầu</label>
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            required
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Kết thúc</label>
          <input
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            required
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Đang áp dụng..." : "Áp dụng flash sale"}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={clearing}
          className="btn-outline disabled:opacity-50"
        >
          {clearing ? "Đang gỡ..." : "Gỡ sale theo danh mục"}
        </button>
      </div>
    </form>
  );
}
