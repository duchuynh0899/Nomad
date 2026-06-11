import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/data";
import type { ProductCategory, SortOption } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") as ProductCategory | null;
  const sort = (searchParams.get("sort") as SortOption) ?? "newest";
  const color = searchParams.get("color");
  const size = searchParams.get("size");
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "12");
  const filter = searchParams.get("filter"); // 'new' | 'sale'

  let products = [...PRODUCTS];

  // Category filter
  if (category) {
    products = products.filter((p) => p.category === category);
  }

  // Text search
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  // Color filter
  if (color) {
    products = products.filter((p) =>
      p.colors.some((c) => c.slug === color)
    );
  }

  // Size filter
  if (size) {
    products = products.filter((p) =>
      p.sizes.includes(size as any)
    );
  }

  // Special filters
  if (filter === "new") {
    products = products.filter((p) => p.isNew);
  } else if (filter === "sale") {
    products = products.filter((p) => p.originalPrice);
  }

  // Sort
  switch (sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "best-seller":
      products.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      break;
    case "newest":
    default:
      products.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  // Paginate
  const total = products.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paginatedItems = products.slice(start, start + pageSize).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice,
    images: p.images,
    colors: p.colors,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    category: p.category,
  }));

  return NextResponse.json({
    data: {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    },
  });
}
