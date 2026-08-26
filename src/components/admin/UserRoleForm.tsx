"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminUpdateUser } from "@/lib/api/users";
import { ApiError } from "@/lib/api/http";
import type { User } from "@/types/api";

export function UserRoleForm({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();

  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authFetch((token) => adminUpdateUser(token, user._id, { role, isActive }));
      toast("Đã cập nhật người dùng", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Có lỗi xảy ra — không thể tự hạ quyền/khoá chính mình", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-5">
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Vai trò</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as User["role"])}
          className="w-full border border-border px-3 py-2.5 text-sm bg-white"
        >
          <option value="customer">Khách hàng</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Tài khoản đang hoạt động
      </label>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
