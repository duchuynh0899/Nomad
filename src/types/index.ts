// types/index.ts — re-export types khớp API backend + type thuần FE (cart, nav, filter)

export * from "./api";

import type { Product, ProductColor, ProductVariant } from "./api";

// ProductListItem: backend trả cùng 1 shape Product cho cả list và detail,
// giữ alias này để không phải đổi tên prop ở nhiều component.
export type ProductListItem = Product;

// ─── Cart Types (client-only, không có ở backend) ─────────────────────────────

export type CartItem = {
  id: string; // `${product._id}-${variant.id}`
  product: Product;
  variant: ProductVariant;
  color: ProductColor;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

// ─── Filter & Sort Types ──────────────────────────────────────────────────────

export type { ProductSort as SortOption } from "./api";

export type FilterState = {
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
  sort: import("./api").ProductSort;
};

// ─── Navigation Types (FE tự quản lý, không có ở backend) ─────────────────────

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};
