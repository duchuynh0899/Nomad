import { apiFetch } from "./http";
import type { ShippingSettings } from "@/types/api";

// Public — chỉ trả defaultFee/freeShippingThreshold (không có provinceFees) để hiện ở storefront,
// vd banner "Miễn phí vận chuyển cho đơn từ X".
export function getShippingSettings() {
  return apiFetch<Pick<ShippingSettings, "defaultFee" | "freeShippingThreshold">>("/settings/shipping");
}

export function adminGetShippingSettings(token: string) {
  return apiFetch<ShippingSettings>("/admin/settings/shipping", { token });
}

export function adminUpdateShippingSettings(token: string, input: Partial<ShippingSettings>) {
  return apiFetch<ShippingSettings>("/admin/settings/shipping", { method: "PATCH", token, body: input });
}
