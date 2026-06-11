import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getProductsByCategory } from "@/lib/data";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { ProductCategory } from "@/types";

interface Props {
  params: { category: string };
  searchParams: { sort?: string; color?: string; size?: string };
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.slug === params.category);
  if (!category) return {};
  return {
    title: `${category.name} | Nomad`,
    description: category.description,
  };
}

export default function CategoryPage({ params, searchParams }: Props) {
  const category = CATEGORIES.find((c) => c.slug === params.category);
  if (!category) notFound();

  const allProducts = getProductsByCategory(params.category as ProductCategory).map((p) => ({
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

  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-border pb-8">
        <h1 className="text-3xl font-medium tracking-tight">
          {category.name.toUpperCase()}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl leading-relaxed">
          {category.description}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {allProducts.length} sản phẩm
        </p>
      </div>

      <ProductGrid products={allProducts} />
    </div>
  );
}
