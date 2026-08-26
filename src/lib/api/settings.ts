import { apiFetch } from "./http";
import type { ShippingSettings } from "@/types/api";

export function adminGetShippingSettings(token: string) {
  return apiFetch<ShippingSettings>("/admin/settings/shipping", { token });
}

export function adminUpdateShippingSettings(token: string, input: Partial<ShippingSettings>) {
  return apiFetch<ShippingSettings>("/admin/settings/shipping", { method: "PATCH", token, body: input });
}
