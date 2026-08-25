import type { NavItem } from "@/types";

// Nav tĩnh không phải là danh mục sản phẩm — mục danh mục (Áo, Quần, ...) được
// nạp từ API thật (/categories) ở components/layout/Header.tsx, không hard-code ở đây.
// (Xem API_REFERENCE.md §17 — banner/nav/CMS là việc của FE, backend không có API riêng.)
export const STATIC_NAV_ITEMS: NavItem[] = [
  { label: "Chính sách đổi trả", href: "/policy" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Sale", href: "/shop?filter=sale" },
];
