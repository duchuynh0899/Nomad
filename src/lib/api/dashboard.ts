import { apiFetch, buildQuery } from "./http";
import type { DashboardSummary } from "@/types/api";

export function adminGetDashboardSummary(
  token: string,
  params: { days?: number; lowStockThreshold?: number } = {}
) {
  return apiFetch<DashboardSummary>(`/admin/dashboard/summary${buildQuery(params)}`, { token });
}
