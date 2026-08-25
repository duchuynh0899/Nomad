import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, listProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/http";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { SITE_URL, jsonLdScriptProps } from "@/lib/seo";
import { getPriceDisplay, stripHtml, truncate } from "@/lib/utils";

interface Props {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

async function safeGetProduct(slug: string) {
  try {
    return await getProduct(slug);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await safeGetProduct(slug);
  if (!product) return {};

  const description = product.information
    ? truncate(stripHtml(product.information), 160)
    : `${product.name} — chính hãng Nomad, giao hàng toàn quốc.`;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.category.slug}/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { category, slug } = await params;

  const product = await safeGetProduct(slug);

  if (!product || product.category.slug !== category) {
    notFound();
  }

  const relatedRes = await listProducts({ category: product.category._id, limit: 5 }).catch(() => null);
  const related = (relatedRes?.items ?? []).filter((p) => p._id !== product._id).slice(0, 4);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.information
      ? truncate(stripHtml(product.information), 500)
      : undefined,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Nomad" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.category.slug}/${product.slug}`,
      priceCurrency: "VND",
      price: getPriceDisplay(product).current,
      availability:
        product.variants.some((v) => v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: `${SITE_URL}/shop/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${SITE_URL}/shop/${product.category.slug}/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script {...jsonLdScriptProps(productJsonLd)} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
