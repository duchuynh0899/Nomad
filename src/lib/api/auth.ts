import { apiFetch } from "./http";
import type { AuthResponse } from "@/types/api";

export function register(input: { name: string; email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/register", { method: "POST", body: input });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input });
}

// idToken lấy từ Google Identity Services (credential JWT) ở client — không phải access_token.
export function loginWithGoogle(idToken: string) {
  return apiFetch<AuthResponse>("/auth/google", { method: "POST", body: { idToken } });
}

// accessToken lấy từ Facebook Login JS SDK (FB.login) ở client.
export function loginWithFacebook(accessToken: string) {
  return apiFetch<AuthResponse>("/auth/facebook", { method: "POST", body: { accessToken } });
}

export function changePassword(token: string, input: { currentPassword: string; newPassword: string }) {
  return apiFetch<void>("/auth/change-password", { method: "POST", token, body: input });
}

export function forgotPassword(email: string) {
  return apiFetch<void>("/auth/forgot-password", { method: "POST", body: { email } });
}

export function resetPassword(token: string, password: string) {
  return apiFetch<void>("/auth/reset-password", { method: "POST", body: { token, password } });
}
