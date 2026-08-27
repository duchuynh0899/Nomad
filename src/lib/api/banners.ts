import { apiFetch } from "./http";
import type { Banner, BannerInput } from "@/types/api";

export function listBanners() {
  return apiFetch<Banner[]>("/banners");
}

export function adminListBanners(token: string) {
  return apiFetch<Banner[]>("/admin/banners", { token });
}

export function adminCreateBanner(token: string, input: BannerInput) {
  return apiFetch<Banner>("/admin/banners", { method: "POST", token, body: input });
}

export function adminUpdateBanner(token: string, id: string, input: Partial<BannerInput>) {
  return apiFetch<Banner>(`/admin/banners/${id}`, { method: "PATCH", token, body: input });
}

export function adminDeleteBanner(token: string, id: string) {
  return apiFetch<{ success: boolean }>(`/admin/banners/${id}`, { method: "DELETE", token });
}
