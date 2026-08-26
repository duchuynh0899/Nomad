import { cn, formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/api";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Hoàn tất",
  cancelled: "Đã huỷ",
};

const statusColor: Record<OrderStatus, string> = {
  pending: "text-orange-600 bg-orange-50",
  confirmed: "text-blue-600 bg-blue-50",
  shipping: "text-blue-600 bg-blue-50",
  delivered: "text-emerald-600 bg-emerald-50",
  cancelled: "text-red-600 bg-red-50",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColor[status])}>
      {statusLabel[status]}
    </span>
  );
}

export function OrderDetail({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
          <p className="text-lg font-medium tracking-wide">#{order.orderNumber}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border border-border p-4">
        <p className="text-xs font-medium tracking-widest uppercase mb-2 text-muted-foreground">
          Địa chỉ giao hàng
        </p>
        <p className="text-sm font-medium">
          {order.shippingAddress.recipientName} · {order.shippingAddress.phone}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {order.shippingAddress.addressLine}, {order.shippingAddress.ward},{" "}
          {order.shippingAddress.district}, {order.shippingAddress.province}
        </p>
        {order.note && <p className="text-sm text-muted-foreground mt-2">Ghi chú: {order.note}</p>}
      </div>

      <div className="border border-border">
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={`${item.product}-${item.variantId}`} className="flex gap-3 p-4">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-14 h-[74px] object-cover bg-dwarfs-surface" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.size} · {item.color} · SL: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium flex-none">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border pt-4 space-y-2 text-sm max-w-sm ml-auto">
        <div className="flex justify-between text-muted-foreground">
          <span>Tạm tính</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Phí vận chuyển</span>
          <span>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá {order.couponCode ? `(${order.couponCode})` : ""}</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-base border-t border-border pt-3 mt-2">
          <span>Tổng cộng</span>
          <span>{formatPrice(order.total)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Thanh toán: {order.paymentMethod === "cod" ? "Khi nhận hàng (COD)" : "Online (PayOS)"} ·{" "}
          {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
        </p>
        {order.refundStatus === "pending" && (
          <p className="text-xs text-orange-600 font-medium">
            Đang chờ hoàn tiền — đơn đã thanh toán nhưng bị huỷ, cửa hàng sẽ hoàn tiền cho bạn sớm nhất.
          </p>
        )}
        {order.refundStatus === "refunded" && (
          <p className="text-xs text-emerald-600 font-medium">
            Đã hoàn tiền{order.refundedAt ? ` vào ${new Date(order.refundedAt).toLocaleDateString("vi-VN")}` : ""}
            {order.refundNote ? ` — ${order.refundNote}` : ""}
          </p>
        )}
      </div>
    </div>
  );
}
