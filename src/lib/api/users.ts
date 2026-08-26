import { apiFetch, buildQuery } from "./http";
import type { PaginatedResult, User, UserRole } from "@/types/api";

export function getMe(token: string) {
  return apiFetch<User>("/users/me", { token });
}

export function updateMe(token: string, input: { name?: string; phone?: string }) {
  return apiFetch<User>("/users/me", { method: "PATCH", token, body: input });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function adminListUsers(
  token: string,
  params: { search?: string; role?: UserRole; page?: number; limit?: number } = {}
) {
  return apiFetch<PaginatedResult<User>>(`/admin/users${buildQuery(params)}`, { token });
}

export function adminGetUser(token: string, id: string) {
  return apiFetch<User>(`/admin/users/${id}`, { token });
}

export function adminUpdateUser(token: string, id: string, input: { role?: UserRole; isActive?: boolean }) {
  return apiFetch<User>(`/admin/users/${id}`, { method: "PATCH", token, body: input });
}
