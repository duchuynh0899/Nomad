import { apiFetch } from "./http";
import type { Address, AddressInput } from "@/types/api";

export function listMyAddresses(token: string) {
  return apiFetch<Address[]>("/users/me/addresses", { token });
}

export function createAddress(token: string, input: AddressInput) {
  return apiFetch<Address>("/users/me/addresses", { method: "POST", token, body: input });
}

export function updateAddress(token: string, id: string, input: Partial<AddressInput>) {
  return apiFetch<Address>(`/users/me/addresses/${id}`, { method: "PATCH", token, body: input });
}

export function deleteAddress(token: string, id: string) {
  return apiFetch<{ success: boolean }>(`/users/me/addresses/${id}`, { method: "DELETE", token });
}
