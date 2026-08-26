import { apiFetch, buildQuery } from "./http";
import type {
  CreateOrderInput,
  CreateOrderResult,
  CreatePaymentResult,
  ListOrdersParams,
  Order,
  OrderStatus,
  PaginatedResult,
} from "@/types/api";

export function createOrder(token: string, input: CreateOrderInput) {
  return apiFetch<CreateOrderResult>("/orders", { method: "POST", token, body: input });
}

export function listMyOrders(token: string, status?: OrderStatus) {
  return apiFetch<PaginatedResult<Order>>(`/orders${buildQuery({ status })}`, { token });
}

export function getMyOrder(token: string, id: string) {
  return apiFetch<Order>(`/orders/${id}`, { token });
}

export function cancelMyOrder(token: string, id: string) {
  return apiFetch<Order>(`/orders/${id}/cancel`, { method: "PATCH", token });
}

// Tạo/tạo lại link thanh toán PayOS (đơn payos chưa trả tiền, vd link cũ hết hạn hoặc lần đầu tạo lỗi)
export function createPaymentForOrder(token: string, id: string) {
  return apiFetch<CreatePaymentResult>(`/orders/${id}/pay`, { method: "POST", token });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function adminListOrders(token: string, params: ListOrdersParams = {}) {
  return apiFetch<PaginatedResult<Order>>(`/admin/orders${buildQuery(params)}`, { token });
}

export function adminGetOrder(token: string, id: string) {
  return apiFetch<Order>(`/admin/orders/${id}`, { token });
}

export function adminCreateOrder(token: string, input: CreateOrderInput) {
  return apiFetch<CreateOrderResult>("/admin/orders", { method: "POST", token, body: input });
}

export function adminUpdateOrderStatus(token: string, id: string, status: Exclude<OrderStatus, "pending">) {
  return apiFetch<Order>(`/admin/orders/${id}/status`, { method: "PATCH", token, body: { status } });
}

// Đánh dấu đơn đã hoàn tiền thủ công (chuyển khoản ngoài hệ thống) — chỉ gọi được khi refundStatus:"pending".
export function adminRefundOrder(token: string, id: string, note?: string) {
  return apiFetch<Order>(`/admin/orders/${id}/refund`, {
    method: "PATCH",
    token,
    body: note ? { note } : {},
  });
}

export async function adminExportOrdersCsv(token: string, params: ListOrdersParams = {}) {
  const { API_BASE_URL } = await import("./http");
  const res = await fetch(`${API_BASE_URL}/admin/orders/export${buildQuery(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Xuất CSV thất bại");
  return res.blob();
}
