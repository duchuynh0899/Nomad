import Link from "next/link";
import Image from "next/image";
// import { PRODUCTS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { DeleteProductButton } from "../../../components/admin/DeleteProductButton";
async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function AdminProductsPage() {
  const PRODUCTS = await getProducts();
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">Sản phẩm ({PRODUCTS.length})</h1>
        <Link
          href="/admin/products/new"
          className="btn-primary flex items-center gap-2"
        >
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
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => {
              const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-dwarfs-surface flex-none">
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{p.category}</td>
                  <td className="p-4">{formatPrice(p.price)}</td>
                  <td className="p-4">
                    <span className={totalStock <= 5 ? "text-orange-600" : ""}>
                      {totalStock}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs underline-anim"
                      >
                        Sửa
                      </Link>
                      <DeleteProductButton
                        productId={p.id}
                        productName={p.name}
                      />
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
