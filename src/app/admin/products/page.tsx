import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminListProducts } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  const { items: products, meta } = await adminListProducts(accessToken, { limit: 100 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">Sản phẩm ({meta.total})</h1>
        <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Sản phẩm</th>
              <th className="p-4">Danh mục</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Tồn kho</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p._id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-dwarfs-surface flex-none">
                        {p.images[0] && (
                          <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{p.category?.name ?? "—"}</td>
                  <td className="p-4">
                    {formatPrice(p.effectivePrice)}
                    {p.isOnSale && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium text-red-600 bg-red-50">
                        Sale
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={totalStock <= 5 ? "text-orange-600" : ""}>{totalStock}</span>
                  </td>
                  <td className="p-4">
                    {p.isActive ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-emerald-600 bg-emerald-50">
                        Đang bán
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-dwarfs-surface">
                        Đã ẩn
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/products/${p._id}/edit`} className="text-xs underline-anim">
                        Sửa
                      </Link>
                      <DeleteProductButton productId={p._id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
