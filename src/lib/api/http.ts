// lib/api/http.ts — fetch wrapper dùng chung cho toàn bộ lib/api/*
import type { ApiErrorBody } from "@/types/api";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export class ApiError extends Error {
  statusCode: number;
  body: ApiErrorBody | null;

  constructor(statusCode: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
  /** Gửi kèm cookie (chỉ cần cho các endpoint /auth/* cần refresh_token) */
  withCredentials?: boolean;
}

function buildQuery(params?: object) {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, token, withCredentials, headers, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: withCredentials ? "include" : rest.credentials,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const errorBody = isJson && data ? (data as ApiErrorBody) : null;
    const message = errorBody
      ? Array.isArray(errorBody.message)
        ? errorBody.message.join(", ")
        : errorBody.message
      : `Yêu cầu thất bại (${res.status})`;
    throw new ApiError(res.status, message, errorBody);
  }

  return data as T;
}

export { buildQuery };
