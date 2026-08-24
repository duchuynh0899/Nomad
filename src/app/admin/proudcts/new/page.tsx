// app/admin/products/new/page.tsx

import { ProductForm } from "../../../../components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Thêm sản phẩm mới</h1>
      <ProductForm />
    </div>
  );
}