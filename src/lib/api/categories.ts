import { apiFetch } from "./http";
import type { Category } from "@/types/api";

export function listCategories() {
  return apiFetch<Category[]>("/categories");
}

export function getCategory(idOrSlug: string) {
  return apiFetch<Category>(`/categories/${idOrSlug}`);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function adminListCategories(token: string) {
  return apiFetch<Category[]>("/admin/categories", { token });
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export function adminCreateCategory(token: string, input: CategoryInput) {
  return apiFetch<Category>("/admin/categories", { method: "POST", token, body: input });
}

export function adminUpdateCategory(token: string, id: string, input: Partial<CategoryInput>) {
  return apiFetch<Category>(`/admin/categories/${id}`, { method: "PATCH", token, body: input });
}

export function adminDeleteCategory(token: string, id: string) {
  return apiFetch<void>(`/admin/categories/${id}`, { method: "DELETE", token });
}
