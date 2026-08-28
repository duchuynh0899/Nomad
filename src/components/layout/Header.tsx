import { listCategories } from "@/lib/api/categories";
import { STATIC_NAV_ITEMS } from "@/lib/data";
import { HeaderClient } from "./HeaderClient";
import type { NavItem } from "@/types";

export async function Header() {
  let navItems: NavItem[] = STATIC_NAV_ITEMS;

  try {
    const categories = await listCategories();

    // Danh mục gán nhóm "ao"/"quan" (đặt ở admin) gộp vào dropdown "Áo"/"Quần" trên header thay
    // vì liệt kê phẳng hết ra — tránh tràn hàng khi có nhiều danh mục. Danh mục chưa gán nhóm vẫn
    // hiện rời như trước (không phá danh mục cũ).
    const aoCategories = categories.filter((c) => c.group === "ao");
    const quanCategories = categories.filter((c) => c.group === "quan");
    const ungroupedCategories = categories.filter((c) => !c.group);

    const groupNavItems: NavItem[] = [
      quanCategories.length > 0 && {
        label: "Quần",
        href: "",
        children: quanCategories.map((c) => ({ label: c.name, href: `/shop/${c.slug}` })),
      },
      aoCategories.length > 0 && {
        label: "Áo",
        href: "",
        children: aoCategories.map((c) => ({ label: c.name, href: `/shop/${c.slug}` })),
      },
    ].filter(Boolean) as NavItem[];

    navItems = [
      ...groupNavItems,
      ...ungroupedCategories.map((c) => ({ label: c.name, href: `/shop/${c.slug}` })),
      ...STATIC_NAV_ITEMS,
    ];
  } catch {
    // Backend chưa sẵn sàng — vẫn hiển thị header với nav tĩnh thay vì crash trang.
  }

  return <HeaderClient navItems={navItems} />;
}
