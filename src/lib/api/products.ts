import { apiFetch, buildQuery } from "./http";
import type {
  BulkSaleInput,
  BulkSaleResult,
  ListProductsParams,
  PaginatedResult,
  Product,
  ProductInput,
} from "@/types/api";

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

export function listProducts(params: ListProductsParams = {}) {
  return apiFetch<PaginatedResult<Product>>(`/products${buildQuery(toQueryParams(params))}`);
}

export function getProduct(idOrSlug: string) {
  return apiFetch<Product>(`/products/${idOrSlug}`);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function adminListProducts(token: string, params: ListProductsParams = {}) {
  return apiFetch<PaginatedResult<Product>>(`/admin/products${buildQuery(toQueryParams(params))}`, {
    token,
  });
}

export function adminGetProduct(token: string, id: string) {
  return apiFetch<Product>(`/admin/products/${id}`, { token });
}

export function adminCreateProduct(token: string, input: ProductInput) {
  return apiFetch<Product>("/admin/products", { method: "POST", token, body: input });
}

export function adminUpdateProduct(token: string, id: string, input: Partial<ProductInput>) {
  return apiFetch<Product>(`/admin/products/${id}`, { method: "PATCH", token, body: input });
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
