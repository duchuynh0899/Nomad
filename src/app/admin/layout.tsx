import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, Ticket, Truck, Zap, Image as ImageIcon, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/products/flash-sale", label: "Flash sale", icon: Zap },
  { href: "/admin/categories", label: "Danh mục", icon: Tag },
  { href: "/admin/banners", label: "Banner", icon: ImageIcon },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingBag },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
  { href: "/admin/settings/shipping", label: "Phí vận chuyển", icon: Truck },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-border p-6 flex flex-col">
        <Link href="/" className="text-lg font-medium tracking-tight mb-10">
          Nomad Admin
        </Link>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-dwarfs-surface transition-colors"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} />
          Về trang chủ
        </Link>
      </aside>

      <main className="flex-1 p-8 bg-dwarfs-surface/30">{children}</main>
    </div>
  );
}