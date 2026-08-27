"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ImageCropModal } from "./ImageCropModal";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import {
  adminCreateBanner,
  adminDeleteBanner,
  adminUpdateBanner,
} from "@/lib/api/banners";
import { adminDeleteImage, adminUploadImage } from "@/lib/api/uploads";
import { ApiError } from "@/lib/api/http";
import type { Banner } from "@/types/api";

// Banner trang chủ là ảnh ngang, cắt tỉ lệ 21:9 — khác 3:4 của ảnh sản phẩm — để khớp khung
// full-bleed h-[60vh] ở HeroBannerCarousel.
const BANNER_ASPECT_RATIO = 21 / 9;

export function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>(
    [...initialBanners].sort((a, b) => a.order - b.order)
  );
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropFile(file);
  };

  const handleCropped = async (croppedFile: File) => {
    setCropFile(null);
    setUploading(true);
    try {
      const uploaded = await authFetch((token) => adminUploadImage(token, croppedFile));
      const nextOrder = banners.length ? Math.max(...banners.map((b) => b.order)) + 1 : 0;
      const banner = await authFetch((token) =>
        adminCreateBanner(token, {
          url: uploaded.url,
          publicId: uploaded.publicId,
          order: nextOrder,
        })
      );
      setBanners((prev) => [...prev, banner]);
      toast("Đã thêm banner", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Thêm banner thất bại", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleHrefChange = (id: string, href: string) => {
    setBanners((prev) => prev.map((b) => (b._id === id ? { ...b, href } : b)));
  };

  const handleSaveHref = async (banner: Banner) => {
    setSavingId(banner._id);
    try {
      await authFetch((token) => adminUpdateBanner(token, banner._id, { href: banner.href }));
      toast("Đã lưu link banner", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Lưu link thất bại", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const nextActive = !banner.isActive;
    setBanners((prev) => prev.map((b) => (b._id === banner._id ? { ...b, isActive: nextActive } : b)));
    try {
      await authFetch((token) => adminUpdateBanner(token, banner._id, { isActive: nextActive }));
      router.refresh();
    } catch (err) {
      setBanners((prev) => prev.map((b) => (b._id === banner._id ? { ...b, isActive: !nextActive } : b)));
      toast(err instanceof ApiError ? err.message : "Cập nhật thất bại", "error");
    }
  };

  const handleDelete = async (banner: Banner) => {
    if (!confirm("Xoá banner này?")) return;
    setSavingId(banner._id);
    try {
      await authFetch((token) => adminDeleteImage(token, banner.publicId));
      await authFetch((token) => adminDeleteBanner(token, banner._id));
      setBanners((prev) => prev.filter((b) => b._id !== banner._id));
      toast("Đã xoá banner", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Xoá thất bại", "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const current = banners[index];
    const target = banners[targetIndex];
    const reordered = [...banners];
    reordered[index] = target;
    reordered[targetIndex] = current;
    setBanners(reordered);

    setSavingId(current._id);
    try {
      await Promise.all([
        authFetch((token) => adminUpdateBanner(token, current._id, { order: target.order })),
        authFetch((token) => adminUpdateBanner(token, target._id, { order: current.order })),
      ]);
      router.refresh();
    } catch (err) {
      setBanners(banners);
      toast(err instanceof ApiError ? err.message : "Đổi thứ tự thất bại", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-3">
        {banners.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có banner nào — thêm banner đầu tiên bên dưới.</p>
        )}

        {banners.map((banner, idx) => (
          <div key={banner._id} className="flex items-center gap-3 border border-border p-3 bg-white">
            <div className="relative w-32 h-14 flex-none bg-dwarfs-surface overflow-hidden">
              <Image src={banner.url} alt="" fill className="object-cover" />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <input
                value={banner.href}
                onChange={(e) => handleHrefChange(banner._id, e.target.value)}
                onBlur={() => handleSaveHref(banner)}
                placeholder="/shop (để trống nếu không cần link)"
                className="w-full border border-border px-2.5 py-1.5 text-xs font-mono bg-white"
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={banner.isActive}
                  onChange={() => handleToggleActive(banner)}
                />
                Đang hiển thị
              </label>
            </div>

            <div className="flex flex-none items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(idx, -1)}
                disabled={idx === 0 || savingId === banner._id}
                className="p-2 hover:bg-dwarfs-surface disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Đưa lên trước"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleMove(idx, 1)}
                disabled={idx === banners.length - 1 || savingId === banner._id}
                className="p-2 hover:bg-dwarfs-surface disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Đưa xuống sau"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(banner)}
                disabled={savingId === banner._id}
                className="p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                aria-label="Xoá banner"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <label
        className={`inline-flex items-center gap-2 border border-dashed border-border px-4 py-2.5 text-xs text-muted-foreground cursor-pointer hover:border-dwarfs-dark transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        {uploading ? "Đang tải..." : "Thêm banner"}
        <input type="file" accept="image/*" className="hidden" onChange={handleSelectFile} />
      </label>

      <ImageCropModal
        file={cropFile}
        onCancel={() => setCropFile(null)}
        onCropped={handleCropped}
        aspectRatio={BANNER_ASPECT_RATIO}
        aspectLabel="21:9"
      />
    </div>
  );
}
