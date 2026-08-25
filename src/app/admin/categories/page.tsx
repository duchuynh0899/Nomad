import Link from "next/link";
import { getServerSession } from "next-auth";
import { Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { adminListCategories } from "@/lib/api/categories";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;
  const categories = await adminListCategories(accessToken);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-medium">Danh mục ({categories.length})</h1>
        <Link href="/admin/categories/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Thêm danh mục
        </Link>
      </div>

      <div className="bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Tên</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 font-mono text-xs text-muted-foreground">{c.slug}</td>
                <td className="p-4">
                  {c.isActive ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-emerald-600 bg-emerald-50">
                      Hiển thị
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-dwarfs-surface">
                      Đã ẩn
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/categories/${c._id}/edit`} className="text-xs underline-anim">
                      Sửa
                    </Link>
                    <DeleteCategoryButton categoryId={c._id} categoryName={c.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
