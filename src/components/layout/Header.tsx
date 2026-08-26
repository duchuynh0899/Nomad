import { listCategories } from "@/lib/api/categories";
import { STATIC_NAV_ITEMS } from "@/lib/data";
import { HeaderClient } from "./HeaderClient";
import type { NavItem } from "@/types";

export async function Header() {
  let navItems: NavItem[] = STATIC_NAV_ITEMS;

  try {
    const categories = await listCategories();
    navItems = [
      ...categories.map((c) => ({ label: c.name, href: `/shop/${c.slug}` })),
      ...STATIC_NAV_ITEMS,
    ];
  } catch {
    // Backend chưa sẵn sàng — vẫn hiển thị header với nav tĩnh thay vì crash trang.
  }

  return <HeaderClient navItems={navItems} />;
}
