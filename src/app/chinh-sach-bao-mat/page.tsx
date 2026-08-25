import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
        <Link href="/" className="hover:text-foreground underline-anim">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Chính sách bảo mật</span>
      </nav>

      <h1 className="text-3xl font-medium tracking-tight mb-4">Chính sách bảo mật</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Cập nhật lần cuối: chưa phát hành chính thức.
      </p>

      <div className="border border-border p-6 sm:p-8 text-sm text-muted-foreground leading-relaxed space-y-3">
        <p>
          Nomad thu thập thông tin cá nhân (họ tên, số điện thoại, địa chỉ giao hàng) chỉ nhằm mục
          đích xử lý đơn hàng và không chia sẻ cho bên thứ ba ngoài mục đích giao vận.
        </p>
        <p>
          Nội dung chi tiết về chính sách bảo mật (thời gian lưu trữ, quyền yêu cầu xoá dữ liệu...)
          đang được đội ngũ Nomad hoàn thiện. Nếu bạn cần thông tin cụ thể, vui lòng liên hệ trực
          tiếp với chúng tôi qua trang{" "}
          <Link href="/policy" className="underline-anim text-foreground">
            Chính sách đổi trả
          </Link>{" "}
          để xem thông tin liên hệ.
        </p>
      </div>
    </div>
  );
}
