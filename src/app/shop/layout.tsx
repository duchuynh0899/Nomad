import type { Metadata } from "next";

// page.tsx ở đây là client component (dùng useSearchParams để filter/tìm kiếm) nên không tự
// export metadata được — đặt ở layout cha. Trang con /shop/[category] có generateMetadata
// riêng nên sẽ tự override, layout này chỉ áp dụng cho đúng route /shop.
export const metadata: Metadata = {
  title: "Tất cả sản phẩm",
  description:
    "Toàn bộ quần nam basic và áo sơ mi tối giản của Nomad — lọc theo màu, size, giá để tìm đúng món bạn cần.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Tất cả sản phẩm | Nomad",
    description:
      "Toàn bộ quần nam basic và áo sơ mi tối giản của Nomad — lọc theo màu, size, giá để tìm đúng món bạn cần.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
