import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/data";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    category: p.category,
    slug: p.slug,
  }));
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { slug } = await params;

  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return {};
  }

  return {
    title: `${product.name} | Dwarfs`,
    description: product.description,
  };
}

export default async function ProductPage(
  { params }: Props
) {
  const { category, slug } = await params;

  const product = PRODUCTS.find(
    (p) => p.slug === slug
  );

  if (!product || product.category !== category) {
    notFound();
  }

  const related = PRODUCTS
    .filter(
      (p) =>
        p.category === product.category &&
        p.id !== product.id
    )
    .slice(0, 4)
    .map((p) => ({
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
    <ProductDetailClient
      product={product}
      related={related}
    />
  );
}