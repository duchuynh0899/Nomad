// components/admin/ProductForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { ImageCropModal } from "./ImageCropModal";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "@/components/ui/Toast";
import { useAuthFetch } from "@/lib/api/auth-fetch";
import { adminBulkClearSale, adminCreateProduct, adminUpdateProduct } from "@/lib/api/products";
import { adminListCategories } from "@/lib/api/categories";
import { adminUploadImage, adminDeleteImage } from "@/lib/api/uploads";
import { slugify, cn } from "@/lib/utils";
import { ApiError } from "@/lib/api/http";
import type { Category, Product, ProductColor, ProductImage, ProductVariant } from "@/types/api";

interface ProductFormProps {
  initialData?: Product;
}

function toDatetimeLocal(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { authFetch } = useAuthFetch();
  const isEdit = !!initialData;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice?.toString() ?? "");
  const [salePrice, setSalePrice] = useState(initialData?.salePrice?.toString() ?? "");
  const [saleStartAt, setSaleStartAt] = useState(toDatetimeLocal(initialData?.saleStartAt));
  const [saleEndAt, setSaleEndAt] = useState(toDatetimeLocal(initialData?.saleEndAt));
  const [clearingSale, setClearingSale] = useState(false);
  const [categoryId, setCategoryId] = useState(initialData?.category?._id ?? "");
  const [isBestSeller, setIsBestSeller] = useState(initialData?.isBestSeller ?? false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [information, setInformation] = useState(initialData?.information ?? "");
  const [images, setImages] = useState<ProductImage[]>(initialData?.images ?? []);
  const [colors, setColors] = useState<ProductColor[]>(initialData?.colors ?? []);
  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    authFetch((token) => adminListCategories(token))
      .then(setCategories)
      .catch(() => toast("Không thể tải danh mục", "error"))
      .finally(() => setLoadingCategories(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  // ─── Ảnh ────────────────────────────────────────────────────────────────────

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCropFile(file);
  };

  const handleUploadCroppedImage = async (croppedFile: File) => {
    setCropFile(null);
    setUploading(true);
    try {
      const result = await authFetch((token) => adminUploadImage(token, croppedFile));
      setImages((prev) => [...prev, { url: result.url, publicId: result.publicId, alt: name }]);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Tải ảnh lên thất bại", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (img: ProductImage) => {
    setImages((prev) => prev.filter((i) => i.publicId !== img.publicId));
    try {
      await authFetch((token) => adminDeleteImage(token, img.publicId));
    } catch {
      // Ảnh đã bị gỡ khỏi form dù xoá trên Cloudinary thất bại — không chặn người dùng tiếp tục.
    }
  };

  // ─── Màu sắc ────────────────────────────────────────────────────────────────

  const addColor = () => setColors((prev) => [...prev, { name: "", slug: "", hex: "#000000" }]);
  const updateColor = (idx: number, patch: Partial<ProductColor>) => {
    setColors((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const next = { ...c, ...patch };
        if (patch.name !== undefined) next.slug = slugify(patch.name);
        return next;
      })
    );
  };
  const removeColor = (idx: number) => setColors((prev) => prev.filter((_, i) => i !== idx));

  // ─── Variants ───────────────────────────────────────────────────────────────

  const addVariant = () =>
    setVariants((prev) => [...prev, { sku: "", color: colors[0]?.slug ?? "", size: "", stock: 0 }]);
  const updateVariant = (idx: number, patch: Partial<ProductVariant>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };
  // Variant đã tồn tại ở backend (có id) không được xoá khỏi mảng — chỉ cho set stock = 0.
  const removeVariant = (idx: number) => {
    const variant = variants[idx];
    if (variant.id) {
      toast("Không thể xoá biến thể đã tồn tại — hãy đặt tồn kho = 0 thay vì xoá.", "info");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast("Vui lòng chọn danh mục", "error");
      return;
    }

    if (salePrice && (!saleStartAt || !saleEndAt)) {
      toast("Đã nhập giá sale thì cần chọn cả thời gian bắt đầu và kết thúc", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        slug,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        salePrice: salePrice ? Number(salePrice) : undefined,
        saleStartAt: saleStartAt ? new Date(saleStartAt).toISOString() : undefined,
        saleEndAt: saleEndAt ? new Date(saleEndAt).toISOString() : undefined,
        category: categoryId,
        images,
        colors,
        // `_id` là field FE tự thêm khi đọc (xem normalizeProduct ở lib/api/products.ts) — backend
        // chỉ nhận `id` để khớp variant cũ, gửi kèm `_id` lạ có thể bị whitelist strict từ chối (400).
        variants: variants.map(({ _id, ...v }) => v),
        information,
        isBestSeller,
        isActive,
      };

      if (isEdit && initialData) {
        await authFetch((token) => adminUpdateProduct(token, initialData._id, payload));
        toast("Đã cập nhật sản phẩm", "success");
      } else {
        await authFetch((token) => adminCreateProduct(token, payload));
        toast("Đã tạo sản phẩm", "success");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Có lỗi xảy ra, thử lại sau", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClearSale = async () => {
    if (!initialData) return;
    setClearingSale(true);
    try {
      await authFetch((token) => adminBulkClearSale(token, { productIds: [initialData._id] }));
      setSalePrice("");
      setSaleStartAt("");
      setSaleEndAt("");
      toast("Đã gỡ giảm giá", "success");
      router.refresh();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Không thể gỡ giảm giá", "error");
    } finally {
      setClearingSale(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Thông tin cơ bản */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Tên sản phẩm</label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Giá bán</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border border-border px-3 py-2.5 text-sm bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
              Giá gốc (mốc tham chiếu, không hết hạn)
            </label>
            <input
              type="number"
              min={0}
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full border border-border px-3 py-2.5 text-sm bg-white"
            />
          </div>
        </div>

        {/* Flash sale */}
        <div className="border border-border p-4 bg-dwarfs-surface">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium tracking-widest uppercase">Flash sale (giới hạn thời gian)</p>
            {isEdit && initialData?.salePrice !== undefined && (
              <button
                type="button"
                onClick={handleClearSale}
                disabled={clearingSale}
                className="text-xs text-red-500 underline-anim disabled:opacity-50"
              >
                {clearingSale ? "Đang gỡ..." : "Gỡ sale"}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Để trống nếu không chạy sale. Nếu nhập giá sale thì bắt buộc chọn cả thời gian bắt đầu/kết thúc.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Giá sale</label>
              <input
                type="number"
                min={0}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Bắt đầu</label>
              <input
                type="datetime-local"
                value={saleStartAt}
                onChange={(e) => setSaleStartAt(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Kết thúc</label>
              <input
                type="datetime-local"
                value={saleEndAt}
                onChange={(e) => setSaleEndAt(e.target.value)}
                className="w-full border border-border px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Danh mục</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            disabled={loadingCategories}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          >
            <option value="">{loadingCategories ? "Đang tải..." : "Chọn danh mục"}</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} />
            Best seller
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Đang hiển thị (active)
          </label>
        </div>
      </div>

      {/* Ảnh */}
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-3 block">Hình ảnh</label>
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.publicId} className="relative w-24 h-32 bg-dwarfs-surface border border-border">
              <Image src={img.url} alt={img.alt ?? name} fill className="object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(img)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                aria-label="Xoá ảnh"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <label
            className={cn(
              "w-24 h-32 border border-dashed border-border flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground cursor-pointer hover:border-dwarfs-dark transition-colors",
              uploading && "opacity-50 pointer-events-none"
            )}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {uploading ? "Đang tải..." : "Thêm ảnh"}
            <input type="file" accept="image/*" className="hidden" onChange={handleSelectImage} />
          </label>
        </div>
      </div>

      {/* Màu sắc */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium tracking-widest uppercase block">Màu sắc</label>
          <button type="button" onClick={addColor} className="text-xs underline-anim flex items-center gap-1">
            <Plus size={12} /> Thêm màu
          </button>
        </div>
        <div className="space-y-2">
          {colors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => updateColor(idx, { hex: e.target.value })}
                className="w-9 h-9 border border-border flex-none"
              />
              <input
                value={color.name}
                onChange={(e) => updateColor(idx, { name: e.target.value })}
                placeholder="Tên màu (vd: Đen)"
                className="flex-1 border border-border px-3 py-2 text-sm bg-white"
              />
              <span className="text-xs text-muted-foreground w-20 font-mono">{color.slug}</span>
              <button
                type="button"
                onClick={() => removeColor(idx)}
                className="p-2 text-red-500 hover:bg-red-50"
                aria-label="Xoá màu"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {colors.length === 0 && <p className="text-xs text-muted-foreground">Chưa có màu nào.</p>}
        </div>
      </div>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium tracking-widest uppercase block">Biến thể (SKU / size / tồn kho)</label>
          <button type="button" onClick={addVariant} className="text-xs underline-anim flex items-center gap-1">
            <Plus size={12} /> Thêm biến thể
          </button>
        </div>
        <div className="space-y-2">
          {variants.map((variant, idx) => (
            <div key={variant.id ?? `new-${idx}`} className="flex items-center gap-2">
              <input
                value={variant.sku}
                onChange={(e) => updateVariant(idx, { sku: e.target.value })}
                placeholder="SKU"
                className="w-32 border border-border px-2 py-2 text-sm bg-white font-mono"
              />
              <select
                value={variant.color}
                onChange={(e) => updateVariant(idx, { color: e.target.value })}
                className="w-32 border border-border px-2 py-2 text-sm bg-white"
              >
                <option value="">Màu</option>
                {colors.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={variant.size}
                onChange={(e) => updateVariant(idx, { size: e.target.value.toUpperCase() })}
                placeholder="Size"
                className="w-20 border border-border px-2 py-2 text-sm bg-white"
              />
              <input
                type="number"
                min={0}
                value={variant.stock}
                onChange={(e) => updateVariant(idx, { stock: Number(e.target.value) })}
                placeholder="Tồn kho"
                className="w-24 border border-border px-2 py-2 text-sm bg-white"
              />
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                disabled={!!variant.id}
                className="p-2 text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                title={variant.id ? "Biến thể đã tồn tại — đặt tồn kho = 0 để ẩn" : "Xoá"}
                aria-label="Xoá biến thể"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {variants.length === 0 && <p className="text-xs text-muted-foreground">Chưa có biến thể nào.</p>}
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">Thông tin sản phẩm</label>
        <p className="text-xs text-muted-foreground mb-3">
          Mô tả, chất liệu, hướng dẫn bảo quản, bảng size — viết tự do
        </p>
        <RichTextEditor value={information} onChange={setInformation} />
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo sản phẩm"}
      </button>

      <ImageCropModal file={cropFile} onCancel={() => setCropFile(null)} onCropped={handleUploadCroppedImage} />
    </form>
  );
}
