"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { createAddress, deleteAddress, listMyAddresses, updateAddress } from "@/lib/api/addresses";
import { VietnamAddressSelects } from "@/components/shared/VietnamAddressSelects";
import { ApiError } from "@/lib/api/http";
import type { Address, AddressInput } from "@/types/api";

const EMPTY_FORM: AddressInput = {
  recipientName: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  addressLine: "",
  isDefault: false,
};

export function AddressBook() {
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    authFetch((token) => listMyAddresses(token))
      .then(setAddresses)
      .catch(() => setAddresses([]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
  };

  const openEdit = (address: Address) => {
    setForm({
      recipientName: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      addressLine: address.addressLine,
      isDefault: address.isDefault,
    });
    setEditing(address);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing === "new") {
        await authFetch((token) => createAddress(token, form));
        toast("Đã thêm địa chỉ", "success");
      } else if (editing) {
        await authFetch((token) => updateAddress(token, editing._id, form));
        toast("Đã cập nhật địa chỉ", "success");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (address: Address) => {
    if (!confirm(`Xoá địa chỉ của "${address.recipientName}"?`)) return;
    try {
      await authFetch((token) => deleteAddress(token, address._id));
      toast("Đã xoá địa chỉ", "success");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Xoá thất bại", "error");
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await authFetch((token) => updateAddress(token, address._id, { isDefault: true }));
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Có lỗi xảy ra", "error");
    }
  };

  if (addresses === null) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Đang tải...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Sổ địa chỉ</h2>
        <button onClick={openNew} className="btn-outline flex items-center gap-2 text-sm px-4 py-2">
          <Plus size={14} /> Thêm địa chỉ
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Bạn chưa lưu địa chỉ nào.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address._id} className="border border-border p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-medium">{address.recipientName}</p>
                  <span className="text-xs text-muted-foreground">· {address.phone}</span>
                  {address.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-emerald-600 bg-emerald-50">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.addressLine}, {address.ward}, {address.district}, {address.province}
                </p>
              </div>
              <div className="flex flex-none items-center gap-3">
                {!address.isDefault && (
                  <button onClick={() => handleSetDefault(address)} className="text-xs underline-anim whitespace-nowrap">
                    Đặt mặc định
                  </button>
                )}
                <button onClick={() => openEdit(address)} className="p-1.5 hover:bg-dwarfs-surface" aria-label="Sửa địa chỉ">
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(address)}
                  className="p-1.5 text-red-500 hover:bg-red-50"
                  aria-label="Xoá địa chỉ"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSave} className="bg-white max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-medium tracking-widest uppercase">
              {editing === "new" ? "Thêm địa chỉ mới" : "Sửa địa chỉ"}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.recipientName}
                onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                placeholder="Họ và tên"
                required
                className="input-base col-span-2"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Số điện thoại"
                required
                className="input-base col-span-2"
              />
              <VietnamAddressSelects
                province={form.province}
                district={form.district}
                ward={form.ward}
                onChange={(next) => setForm((f) => ({ ...f, ...next }))}
                showLabels={false}
                provinceWrapperClassName="col-span-2"
              />
              <input
                value={form.addressLine}
                onChange={(e) => setForm((f) => ({ ...f, addressLine: e.target.value }))}
                placeholder="Số nhà, tên đường..."
                required
                className="input-base col-span-2"
              />
              <label className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.isDefault ?? false}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                />
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs underline-anim"
                disabled={saving}
              >
                Huỷ
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Đang lưu..." : "Lưu địa chỉ"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
