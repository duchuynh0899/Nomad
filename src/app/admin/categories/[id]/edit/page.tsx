import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminListCategories } from "@/lib/api/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  const categories = await adminListCategories(accessToken);
  const category = categories.find((c) => c._id === id);
  if (!category) notFound();

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Sửa danh mục</h1>
      <CategoryForm initialData={category} />
    </div>
  );
}
