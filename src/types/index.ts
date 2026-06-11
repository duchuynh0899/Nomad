// ─── Product Types ───────────────────────────────────────────────────────────

export type ProductCategory = "ao" | "quan" | "phu-kien" | "giay-dep";

export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export type ProductColor = {
  name: string;
  hex: string;
  slug: string;
};

export type ProductImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  size: ProductSize;
  color: ProductColor;
  stock: number;
  sku: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  category: ProductCategory;
  colors: ProductColor[];
  sizes: ProductSize[];
  variants: ProductVariant[];
  tags: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  material?: string;
  care?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListItem = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "originalPrice" | "images" | "colors" | "isNew" | "isBestSeller" | "category"
>;

// ─── Cart Types ───────────────────────────────────────────────────────────────

export type CartItem = {
  id: string;
  product: ProductListItem;
  variant: ProductVariant;
  quantity: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

// ─── Category Types ───────────────────────────────────────────────────────────

export type Category = {
  id: string;
  slug: ProductCategory;
  name: string;
  description: string;
  image: ProductImage;
  productCount: number;
};

// ─── Filter & Sort Types ──────────────────────────────────────────────────────

export type SortOption = "newest" | "price-asc" | "price-desc" | "best-seller";

export type FilterState = {
  colors: string[];
  sizes: ProductSize[];
  priceRange: [number, number];
  sort: SortOption;
};

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

// ─── API Response Types ───────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T;
  message?: string;
  error?: string;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

// ─── User / Auth Types ────────────────────────────────────────────────────────

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
};

export type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  province: string;
  isDefault: boolean;
};

// ─── Order Types ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "returned";

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: Address;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};
