// app/admin/products/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Sửa sản phẩm</h1>
      <ProductForm initialData={product} />
    </div>
  );
}