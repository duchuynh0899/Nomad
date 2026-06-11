import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Đặt hàng thành công | Dwarfs",
};

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <CheckCircle size={56} className="mx-auto text-green-500 mb-6" />

      <h1 className="text-2xl font-medium mb-3">Đặt hàng thành công!</h1>
      <p className="text-muted-foreground text-sm leading-relaxed mb-2">
        Cảm ơn bạn đã mua sắm tại Dwarfs.
      </p>

      {searchParams.orderId && (
        <p className="text-sm mb-6">
          Mã đơn hàng:{" "}
          <span className="font-medium tracking-wider">#{searchParams.orderId}</span>
        </p>
      )}

      <p className="text-sm text-muted-foreground mb-10">
        Chúng tôi sẽ gửi email xác nhận và thông báo vận chuyển đến địa chỉ email của bạn.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account/orders" className="btn-outline">
          Xem đơn hàng
        </Link>
        <Link href="/" className="btn-primary">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
