import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/api/categories";
import { listProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/http";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SITE_URL, jsonLdScriptProps } from "@/lib/seo";
import type { ProductSort } from "@/types";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; color?: string; size?: string; page?: string }>;
}

async function safeGetCategory(slug: string) {
  try {
    return await getCategory(slug);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await safeGetCategory(slug);
  if (!category) return {};

  const featured = await listProducts({ category: category._id, limit: 1 }).catch(() => null);
  const image = featured?.items[0]?.images[0]?.url;

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: {
      title: category.name,
      description: category.description,
      images: image ? [{ url: image, alt: category.name }] : undefined,
    },
    twitter: image ? { card: "summary_large_image", images: [image] } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const { sort, color, size, page } = await searchParams;

  const category = await safeGetCategory(slug);
  if (!category) notFound();

  const result = await listProducts({
    category: category._id,
    sort: sort as ProductSort | undefined,
    color,
    size,
    page: page ? Number(page) : 1,
    limit: 24,
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${SITE_URL}/shop/${category.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-12">
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />

      {/* Header */}
      <div className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-medium tracking-tight">{category.name.toUpperCase()}</h1>
        {category.description && (
          <p className="mt-3 text-sm text-muted-foreground max-w-xl leading-relaxed">
            {category.description}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{result.meta.total} sản phẩm</p>
      </div>

      <ProductGrid products={result.items} />
    </div>
  );
}
