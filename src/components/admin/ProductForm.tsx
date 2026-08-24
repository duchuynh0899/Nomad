// components/admin/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./RichTextEditor";
import { useToast } from "@/components/ui/Toast";
import type { Product } from "@/types";
import { useSession } from "next-auth/react";

interface ProductFormProps {
  initialData?: Partial<Product>;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!initialData?.id;

  const [name, setName] = useState(initialData?.name ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice?.toString() ?? "",
  );
  const [category, setCategory] = useState(initialData?.category ?? "ao");
  const [information, setInformation] = useState(
    (initialData as any)?.information ?? "",
  );
  const [saving, setSaving] = useState(false);

  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      information,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products${isEdit ? `/${initialData!.id}` : ""}`,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    setSaving(false);

    if (res.ok) {
      toast(isEdit ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm", "success");
      router.push("/admin/products");
      router.refresh();
    } else {
      toast("Có lỗi xảy ra, thử lại sau", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
          Tên sản phẩm
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-border px-3 py-2.5 text-sm bg-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Giá bán
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
            Giá gốc (nếu sale)
          </label>
          <input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full border border-border px-3 py-2.5 text-sm bg-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
          Danh mục
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="w-full border border-border px-3 py-2.5 text-sm bg-white"
        >
          <option value="ao">Áo</option>
          <option value="quan">Quần</option>
          <option value="phu-kien">Phụ kiện</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium tracking-widest uppercase mb-2 block">
          Thông tin sản phẩm
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Mô tả, chất liệu, bảo quản, bảng size — viết tự do
        </p>
        <RichTextEditor value={information} onChange={setInformation} />
      </div>

      {/* TODO: upload ảnh, quản lý màu/size/variants — tuỳ độ phức tạp bạn cần, có thể làm riêng 1 phần */}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo sản phẩm"}
      </button>
    </form>
  );
}
