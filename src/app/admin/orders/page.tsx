"use client";

import { useState } from "react";
import { formatPrice, cn } from "@/lib/utils";

const MOCK_ORDERS = [
  { id: "NM240815", customer: "Nguyễn Văn A", date: "15/08/2026", total: 1290000, status: "Chờ xác nhận" },
  { id: "NM240722", customer: "Trần Thị B", date: "22/07/2026", total: 890000, status: "Đang giao" },
];

const statuses = ["Chờ xác nhận", "Đang giao", "Hoàn tất", "Đã huỷ"];
const statusColor: Record<string, string> = {
  "Chờ xác nhận": "text-orange-600 bg-orange-50",
  "Đang giao": "text-blue-600 bg-blue-50",
  "Hoàn tất": "text-emerald-600 bg-emerald-50",
  "Đã huỷ": "text-red-600 bg-red-50",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);

  const updateStatus = async (id: string, status: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  return (
    <div>
      <h1 className="text-xl font-medium mb-8">Đơn hàng</h1>
      <div className="bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Ngày</th>
              <th className="p-4">Tổng tiền</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0">
                <td className="p-4 font-medium">#{o.id}</td>
                <td className="p-4">{o.customer}</td>
                <td className="p-4">{o.date}</td>
                <td className="p-4">{formatPrice(o.total)}</td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer",
                      statusColor[o.status]
                    )}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}