import type { MetadataRoute } from "next";
import { listCategories } from "@/lib/api/categories";
import { listProducts } from "@/lib/api/products";
import { SITE_URL } from "@/lib/seo";

async function getAllProducts() {
  const first = await listProducts({ limit: 100, page: 1 }).catch(() => null);
  if (!first) return [];
  const all = [...first.items];
  for (let page = 2; page <= first.meta.totalPages; page++) {
    const next = await listProducts({ limit: 100, page }).catch(() => null);
    if (next) all.push(...next.items);
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    listCategories().catch(() => []),
    getAllProducts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/huong-dan-chon-size`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/policy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/dieu-khoan-su-dung`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/chinh-sach-bao-mat`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/shop/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.category.slug}/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
    images: p.images.length > 0 ? p.images.map((img) => img.url) : undefined,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
