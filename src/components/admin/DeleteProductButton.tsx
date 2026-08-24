// components/admin/DeleteProductButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useSession } from "next-auth/react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();

  const handleDelete = async () => {
    if (
      !confirm(
        `Xoá sản phẩm "${productName}"? Hành động này không thể hoàn tác.`,
      )
    )
      return;

    setLoading(true);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${(session as any)?.accessToken}` },
      },
    );
    setLoading(false);

    if (res.ok) {
      toast("Đã xoá sản phẩm", "success");
      router.refresh();
    } else {
      toast("Xoá thất bại, thử lại sau", "error");
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 underline-anim disabled:opacity-50"
    >
      {loading ? "Đang xoá..." : "Xoá"}
    </button>
  );
}
