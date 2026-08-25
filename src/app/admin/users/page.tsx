import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminListUsers } from "@/lib/api/users";
import type { UserRole } from "@/types/api";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>;
}) {
  const { search, role, page } = await searchParams;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  const { items: users, meta } = await adminListUsers(accessToken, {
    search,
    role: role as UserRole | undefined,
    page: page ? Number(page) : 1,
    limit: 30,
  });

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Khách hàng ({meta.total})</h1>

      <form className="flex gap-3 mb-6" method="get">
        <input
          name="search"
          defaultValue={search}
          placeholder="Tìm theo tên hoặc email..."
          className="flex-1 max-w-sm border border-border px-3 py-2 text-sm bg-white"
        />
        <select name="role" defaultValue={role ?? ""} className="border border-border px-3 py-2 text-sm bg-white">
          <option value="">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn-outline text-sm px-4">
          Lọc
        </button>
      </form>

      <div className="bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-muted-foreground">{u.email}</td>
                <td className="p-4 capitalize">{u.role}</td>
                <td className="p-4">
                  {u.isActive ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-emerald-600 bg-emerald-50">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-red-600 bg-red-50">
                      Đã khoá
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/users/${u._id}`} className="text-xs underline-anim">
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
