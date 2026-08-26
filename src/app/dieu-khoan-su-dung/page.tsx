import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
        <Link href="/" className="hover:text-foreground underline-anim">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Điều khoản sử dụng</span>
      </nav>

      <h1 className="text-3xl font-medium tracking-tight mb-4">Điều khoản sử dụng</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Cập nhật lần cuối: chưa phát hành chính thức.
      </p>

      <div className="border border-border p-6 sm:p-8 text-sm text-muted-foreground leading-relaxed space-y-3">
        <p>
          Trang này đang được đội ngũ Nomad hoàn thiện nội dung điều khoản sử dụng chính thức
          (quyền và nghĩa vụ khi mua hàng, chính sách thanh toán COD, xử lý tranh chấp...).
        </p>
        <p>
          Nếu bạn cần thông tin cụ thể trước khi đặt hàng, vui lòng liên hệ trực tiếp với chúng tôi
          qua trang{" "}
          <Link href="/policy" className="underline-anim text-foreground">
            Chính sách đổi trả
          </Link>{" "}
          để xem thông tin liên hệ.
        </p>
      </div>
    </div>
  );
}
