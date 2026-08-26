import { apiFetch, buildQuery } from "./http";
import type {
  BulkSaleInput,
  BulkSaleResult,
  ListProductsParams,
  PaginatedResult,
  Product,
  ProductInput,
} from "@/types/api";

// Backend trả variant với field `_id` (không phải `id`) khi đọc — xem ghi chú ở
// types/api.ts::ProductVariant. Đồng bộ ngay tại đây để mọi nơi khác trong FE
// (cart, checkout, admin) chỉ cần đọc `variant.id` mà không lo undefined.
function normalizeProduct(product: Product): Product {
  return {
    ...product,
    variants: product.variants.map((v) => ({ ...v, id: v.id ?? v._id })),
  };
}

function normalizePaginated(result: PaginatedResult<Product>): PaginatedResult<Product> {
  return { ...result, items: result.items.map(normalizeProduct) };
}

function toQueryParams(params: ListProductsParams) {
  return {
    page: params.page,
    limit: params.limit,
    search: params.search,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    color: params.color,
    size: params.size,
    isBestSeller: params.isBestSeller,
    onSale: params.onSale,
    sort: params.sort,
  };
}

export async function listProducts(params: ListProductsParams = {}) {
  const res = await apiFetch<PaginatedResult<Product>>(`/products${buildQuery(toQueryParams(params))}`);
  return normalizePaginated(res);
}

export async function getProduct(idOrSlug: string) {
  const product = await apiFetch<Product>(`/products/${idOrSlug}`);
  return normalizeProduct(product);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminListProducts(token: string, params: ListProductsParams = {}) {
  const res = await apiFetch<PaginatedResult<Product>>(`/admin/products${buildQuery(toQueryParams(params))}`, {
    token,
  });
  return normalizePaginated(res);
}

export async function adminGetProduct(token: string, id: string) {
  const product = await apiFetch<Product>(`/admin/products/${id}`, { token });
  return normalizeProduct(product);
}

export async function adminCreateProduct(token: string, input: ProductInput) {
  const product = await apiFetch<Product>("/admin/products", { method: "POST", token, body: input });
  return normalizeProduct(product);
}

export async function adminUpdateProduct(token: string, id: string, input: Partial<ProductInput>) {
  const product = await apiFetch<Product>(`/admin/products/${id}`, { method: "PATCH", token, body: input });
  return normalizeProduct(product);
}

export function adminDeleteProduct(token: string, id: string) {
  return apiFetch<void>(`/admin/products/${id}`, { method: "DELETE", token });
}

// Giảm giá hàng loạt (flash sale) — chọn đúng 1 trong categoryId | productIds.
export function adminBulkSetSale(token: string, input: BulkSaleInput) {
  return apiFetch<BulkSaleResult>("/admin/products/bulk-sale", { method: "POST", token, body: input });
}

export function adminBulkClearSale(
  token: string,
  input: { categoryId?: string; productIds?: string[] }
) {
  return apiFetch<BulkSaleResult>("/admin/products/bulk-sale/clear", {
    method: "POST",
    token,
    body: input,
  });
}
