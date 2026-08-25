import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminGetProduct } from "@/lib/api/products";
import { ApiError } from "@/lib/api/http";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  let product;
  try {
    product = await adminGetProduct(accessToken, id);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) notFound();
    throw err;
  }

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Sửa sản phẩm</h1>
      <ProductForm initialData={product} />
    </div>
  );
}
