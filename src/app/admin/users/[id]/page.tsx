import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminGetUser } from "@/lib/api/users";
import { ApiError } from "@/lib/api/http";
import { UserRoleForm } from "@/components/admin/UserRoleForm";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken as string;

  let user;
  try {
    user = await adminGetUser(accessToken, id);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) notFound();
    throw err;
  }

  return (
    <div>
      <h1 className="text-xl font-medium mb-2">{user.name}</h1>
      <p className="text-sm text-muted-foreground mb-8">{user.email}</p>
      <UserRoleForm user={user} />
    </div>
  );
}
