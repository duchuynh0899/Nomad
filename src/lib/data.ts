import type { Product, ProductListItem, Category, NavItem } from "@/types";

// ─── Categories ───────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  {
    id: "cat-1",
    slug: "ao",
    name: "Áo",
    description:
      "Bộ sưu tập áo Dwarfs – từ polo dệt kim thoáng mát đến sơ mi thanh lịch, chất liệu mềm mại, thiết kế tối giản, lý tưởng cho ngày hè n...",
    image: {
      url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
      alt: "Áo Dwarfs",
      width: 800,
      height: 1000,
    },
    productCount: 24,
  },
  {
    id: "cat-2",
    slug: "quan",
    name: "Quần",
    description:
      "Quần Dwarfs – đa dạng nhiều dáng quần cơ bản regular, dáng relaxed và dáng wide ống suông, chất liệu cotton pha linen thoáng khi...",
    image: {
      url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
      alt: "Quần Dwarfs",
      width: 800,
      height: 1000,
    },
    productCount: 18,
  },
  {
    id: "cat-3",
    slug: "phu-kien",
    name: "Phụ kiện",
    description: "Phụ kiện Dwarfs – hoàn thiện outfit của bạn với những món phụ kiện tinh tế.",
    image: {
      url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
      alt: "Phụ kiện Dwarfs",
      width: 800,
      height: 1000,
    },
    productCount: 12,
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    slug: "texture-henley-neck-t-shirt",
    name: "Texture Henley Neck T-Shirt",
    description:
      "Áo thun cổ Henley chất liệu cotton texture cao cấp. Thiết kế tối giản với chi tiết cổ đặc trưng, mang lại vẻ thanh lịch mà vẫn thoải mái cho ngày hè.",
    price: 450000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
        alt: "Texture Henley Neck T-Shirt - Gray",
        width: 600,
        height: 800,
      },
      {
        url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
        alt: "Texture Henley Neck T-Shirt - Back",
        width: 600,
        height: 800,
      },
    ],
    category: "ao",
    colors: [
      { name: "Xám", hex: "#9E9E9E", slug: "gray" },
      { name: "Trắng", hex: "#F5F5F5", slug: "white" },
      { name: "Đen", hex: "#212121", slug: "black" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { id: "v1-1", size: "S", color: { name: "Xám", hex: "#9E9E9E", slug: "gray" }, stock: 5, sku: "THNT-GR-S" },
      { id: "v1-2", size: "M", color: { name: "Xám", hex: "#9E9E9E", slug: "gray" }, stock: 8, sku: "THNT-GR-M" },
      { id: "v1-3", size: "L", color: { name: "Xám", hex: "#9E9E9E", slug: "gray" }, stock: 3, sku: "THNT-GR-L" },
      { id: "v1-4", size: "S", color: { name: "Trắng", hex: "#F5F5F5", slug: "white" }, stock: 6, sku: "THNT-WH-S" },
      { id: "v1-5", size: "M", color: { name: "Trắng", hex: "#F5F5F5", slug: "white" }, stock: 10, sku: "THNT-WH-M" },
    ],
    tags: ["t-shirt", "henley", "cotton", "summer"],
    isNew: true,
    material: "100% Cotton Texture",
    care: ["Giặt máy ở 30°C", "Không dùng máy sấy", "Ủi ở nhiệt độ thấp"],
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "prod-2",
    slug: "crinkle-silk-pocket-relaxed-shirt",
    name: "Crinkle Silk Pocket Relaxed Shirt",
    description:
      "Sơ mi lụa crinkle với thiết kế túi ngực đặc trưng. Chất liệu lụa tự nhiên nhẹ nhàng, form relaxed thoải mái, phù hợp cho cả dịp thường ngày lẫn những buổi ra ngoài.",
    price: 890000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
        alt: "Crinkle Silk Pocket Relaxed Shirt - Beige",
        width: 600,
        height: 800,
      },
    ],
    category: "ao",
    colors: [
      { name: "Be", hex: "#C8A882", slug: "beige" },
      { name: "Xanh lam", hex: "#4A6FA5", slug: "blue" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { id: "v2-1", size: "S", color: { name: "Be", hex: "#C8A882", slug: "beige" }, stock: 4, sku: "CSP-BE-S" },
      { id: "v2-2", size: "M", color: { name: "Be", hex: "#C8A882", slug: "beige" }, stock: 7, sku: "CSP-BE-M" },
    ],
    tags: ["shirt", "silk", "relaxed", "pocket"],
    isBestSeller: true,
    material: "100% Silk Crinkle",
    care: ["Giặt tay nhẹ nhàng", "Phơi nơi thoáng mát", "Không vắt mạnh"],
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
  {
    id: "prod-3",
    slug: "dwarfs-symbol-round-neck-t-shirt",
    name: "Dwarfs Symbol Round Neck T-Shirt",
    description:
      "Áo thun cổ tròn với logo symbol đặc trưng của Dwarfs. Chất liệu cotton mềm mại, form basic dễ phối đồ, là item must-have trong tủ quần áo.",
    price: 450000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
        alt: "Dwarfs Symbol Round Neck T-Shirt",
        width: 600,
        height: 800,
      },
    ],
    category: "ao",
    colors: [
      { name: "Xanh rêu", hex: "#8B9D77", slug: "sage" },
      { name: "Đen", hex: "#212121", slug: "black" },
      { name: "Trắng", hex: "#F5F5F5", slug: "white" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [
      { id: "v3-1", size: "S", color: { name: "Xanh rêu", hex: "#8B9D77", slug: "sage" }, stock: 9, sku: "DSR-SG-S" },
      { id: "v3-2", size: "M", color: { name: "Xanh rêu", hex: "#8B9D77", slug: "sage" }, stock: 12, sku: "DSR-SG-M" },
    ],
    tags: ["t-shirt", "logo", "basic", "cotton"],
    isBestSeller: true,
    material: "100% Cotton Combed",
    care: ["Giặt máy ở 30°C", "Lộn trái khi giặt"],
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-04-01T00:00:00Z",
  },
  {
    id: "prod-4",
    slug: "half-sleeve-relaxed-shirt",
    name: "Half Sleeve Relaxed Shirt",
    description:
      "Sơ mi tay lỡ form relaxed thời thượng. Chất liệu cotton pha linen thoáng mát, thiết kế đơn giản nhưng tinh tế với đường may tỉ mỉ.",
    price: 690000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
        alt: "Half Sleeve Relaxed Shirt - Navy",
        width: 600,
        height: 800,
      },
    ],
    category: "ao",
    colors: [
      { name: "Navy", hex: "#1B2A4A", slug: "navy" },
      { name: "Trắng", hex: "#F5F5F5", slug: "white" },
      { name: "Be", hex: "#C8A882", slug: "beige" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    variants: [
      { id: "v4-1", size: "M", color: { name: "Navy", hex: "#1B2A4A", slug: "navy" }, stock: 6, sku: "HSR-NV-M" },
      { id: "v4-2", size: "L", color: { name: "Navy", hex: "#1B2A4A", slug: "navy" }, stock: 4, sku: "HSR-NV-L" },
    ],
    tags: ["shirt", "relaxed", "half-sleeve", "linen"],
    isNew: true,
    material: "Cotton 60% - Linen 40%",
    care: ["Giặt máy ở 30°C", "Ủi mặt trái", "Phơi nơi thoáng"],
    createdAt: "2024-06-10T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
  },
  {
    id: "prod-5",
    slug: "wide-leg-linen-pants",
    name: "Wide Leg Linen Pants",
    description:
      "Quần ống rộng chất liệu linen cao cấp. Dáng wide leg thoải mái, lưng thun dễ mặc, lý tưởng cho những ngày hè.",
    price: 650000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
        alt: "Wide Leg Linen Pants",
        width: 600,
        height: 800,
      },
    ],
    category: "quan",
    colors: [
      { name: "Be", hex: "#C8A882", slug: "beige" },
      { name: "Đen", hex: "#212121", slug: "black" },
      { name: "Xanh navy", hex: "#1B2A4A", slug: "navy" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variants: [
      { id: "v5-1", size: "S", color: { name: "Be", hex: "#C8A882", slug: "beige" }, stock: 5, sku: "WLP-BE-S" },
      { id: "v5-2", size: "M", color: { name: "Be", hex: "#C8A882", slug: "beige" }, stock: 8, sku: "WLP-BE-M" },
    ],
    tags: ["pants", "linen", "wide-leg", "summer"],
    isNew: true,
    material: "100% Linen",
    care: ["Giặt tay nhẹ", "Phơi trong bóng râm"],
    createdAt: "2024-06-05T00:00:00Z",
    updatedAt: "2024-06-05T00:00:00Z",
  },
  {
    id: "prod-6",
    slug: "relaxed-chino-pants",
    name: "Relaxed Chino Pants",
    description:
      "Quần chino form relaxed phong cách. Chất liệu cotton twill mềm mại, dễ phối với nhiều loại áo khác nhau.",
    price: 590000,
    originalPrice: 750000,
    images: [
      {
        url: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7",
        alt: "Relaxed Chino Pants",
        width: 600,
        height: 800,
      },
    ],
    category: "quan",
    colors: [
      { name: "Khaki", hex: "#B5A490", slug: "khaki" },
      { name: "Đen", hex: "#212121", slug: "black" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      { id: "v6-1", size: "M", color: { name: "Khaki", hex: "#B5A490", slug: "khaki" }, stock: 7, sku: "RCP-KH-M" },
    ],
    tags: ["pants", "chino", "relaxed", "cotton"],
    isBestSeller: true,
    material: "98% Cotton - 2% Elastane",
    care: ["Giặt máy ở 30°C", "Ủi ở nhiệt độ trung bình"],
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
  },
];

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Áo",
    href: "/shop/ao",
    children: [
      { label: "Áo thun", href: "/shop/ao?type=t-shirt" },
      { label: "Sơ mi", href: "/shop/ao?type=shirt" },
      { label: "Polo", href: "/shop/ao?type=polo" },
    ],
  },
  {
    label: "Quần",
    href: "/shop/quan",
    children: [
      { label: "Quần dài", href: "/shop/quan?type=long" },
      { label: "Quần short", href: "/shop/quan?type=short" },
    ],
  },
  {
    label: "Phụ kiện",
    href: "/shop/phu-kien",
  },
  {
    label: "New Arrivals",
    href: "/shop?filter=new",
  },
  {
    label: "Sale",
    href: "/shop?filter=sale",
  },
];

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(price);
}

export function getProductListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    images: product.images,
    colors: product.colors,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
    category: product.category,
  };
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): ProductListItem[] {
  return PRODUCTS.filter((p) => p.isBestSeller || p.isNew).map(getProductListItem);
}
