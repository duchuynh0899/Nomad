import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminListCategories } from "@/lib/api/categories";
import { BulkFlashSaleForm } from "@/components/admin/BulkFlashSaleForm";

export default async function FlashSalePage() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;
  const categories = await adminListCategories(accessToken);

  return (
    <div>
      <h1 className="text-xl font-medium mb-2">Flash sale hàng loạt</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Áp dụng giảm giá theo % cho toàn bộ sản phẩm trong 1 danh mục, trong 1 khung thời gian nhất định.
        Muốn chọn từng sản phẩm cụ thể, hãy đặt giá sale ở trang sửa từng sản phẩm.
      </p>
      <BulkFlashSaleForm categories={categories} />
    </div>
  );
}
