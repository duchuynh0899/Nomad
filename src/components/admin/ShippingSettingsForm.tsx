"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminUpdateShippingSettings } from "@/lib/api/settings";
import { ApiError } from "@/lib/api/http";
import type { ProvinceFee, ShippingSettings } from "@/types/api";

export function ShippingSettingsForm({ initialData }: { initialData: ShippingSettings }) {
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();

  const [defaultFee, setDefaultFee] = useState(initialData.defaultFee.toString());
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    initialData.freeShippingThreshold?.toString() ?? ""
  );
  const [provinceFees, setProvinceFees] = useState<ProvinceFee[]>(initialData.provinceFees);
  const [saving, setSaving] = useState(false);

  const addRow = () => setProvinceFees((prev) => [...prev, { province: "", fee: 0 }]);
  const updateRow = (idx: number, patch: Partial<ProvinceFee>) => {
    setProvinceFees((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const removeRow = (idx: number) => setProvinceFees((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authFetch((token) =>
        adminUpdateShippingSettings(token, {
          defaultFee: Number(defaultFee),
          freeShippingThreshold: Number(freeShippingThreshold),
          provinceFees: provinceFees.filter((p) => p.province.trim()),
        })
      );
      toast("Đã cập nhật cấu hình vận chuyển", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Phí ship mặc định (VND)
          </label>
          <input
            type="number"
            min={0}
            value={defaultFee}
            onChange={(e) => setDefaultFee(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Miễn phí ship từ (VND)
          </label>
          <input
            type="number"
            min={0}
            value={freeShippingThreshold}
            onChange={(e) => setFreeShippingThreshold(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium tracking-widest uppercase block">Phí ship theo tỉnh/thành</label>
          <button type="button" onClick={addRow} className="text-xs underline-anim flex items-center gap-1">
            <Plus size={12} /> Thêm tỉnh
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Tên tỉnh phải khớp chính xác với giá trị khách hàng nhập ở form địa chỉ khi đặt hàng.
        </p>
        <div className="space-y-2">
          {provinceFees.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={row.province}
                onChange={(e) => updateRow(idx, { province: e.target.value })}
                placeholder="Ho Chi Minh City"
                className="flex-1 border border-border px-3 py-2 text-sm bg-white"
              />
              <input
                type="number"
                min={0}
                value={row.fee}
                onChange={(e) => updateRow(idx, { fee: Number(e.target.value) })}
                placeholder="Phí (VND)"
                className="w-40 border border-border px-3 py-2 text-sm bg-white"
              />
              <button
                type="button"
                onClick={() => removeRow(idx)}
                className="p-2 text-red-500 hover:bg-red-50"
                aria-label="Xoá"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {provinceFees.length === 0 && (
            <p className="text-xs text-muted-foreground">Chưa có tỉnh nào — dùng phí mặc định cho mọi đơn.</p>
          )}
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : "Lưu cấu hình"}
      </button>
    </form>
  );
}
