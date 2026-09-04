import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description:
    "Nomad cam kết bảo vệ thông tin cá nhân khách hàng — dữ liệu thu thập, mục đích sử dụng, chia sẻ với bên thứ ba và quyền của bạn đối với dữ liệu.",
};

const SHARED_WITH = [
  {
    party: "Đơn vị vận chuyển",
    data: "Tên, số điện thoại, địa chỉ giao hàng",
    reason: "Giao hàng đến đúng địa chỉ bạn đặt",
  },
  {
    party: "PayOS (cổng thanh toán)",
    data: "Số tiền, mã đơn hàng — không gồm thông tin thẻ/tài khoản ngân hàng",
    reason: "Xử lý thanh toán online, Nomad không lưu trữ thông tin thẻ của bạn",
  },
  {
    party: "Google / Facebook",
    data: "Định danh tài khoản (khi bạn chủ động đăng nhập bằng MXH)",
    reason: "Xác thực đăng nhập, không dùng cho mục đích khác",
  },
  {
    party: "Dịch vụ gửi email",
    data: "Địa chỉ email, nội dung đơn hàng",
    reason: "Gửi email xác nhận đơn hàng, cập nhật trạng thái giao hàng",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
        <Link href="/" className="hover:text-foreground underline-anim">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Chính sách bảo mật</span>
      </nav>

      <p className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">
        Chính sách
      </p>
      <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">Chính sách bảo mật</h1>
      <p className="text-sm text-muted-foreground mb-12">
        Áp dụng cho toàn bộ website Nomad. Bằng việc sử dụng website hoặc đặt hàng, bạn đồng ý với
        cách chúng tôi thu thập và xử lý thông tin cá nhân dưới đây.
      </p>

      <div className="space-y-12 text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">1. Thông tin chúng tôi thu thập</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Họ tên, email, số điện thoại, mật khẩu (được mã hoá, Nomad không bao giờ nhìn thấy mật khẩu gốc) khi bạn tạo tài khoản.</li>
            <li>Thông tin cơ bản (tên, email) do Google/Facebook cung cấp nếu bạn chọn đăng nhập bằng mạng xã hội.</li>
            <li>Địa chỉ giao hàng (tên người nhận, số điện thoại, tỉnh/thành, quận/huyện, phường/xã, địa chỉ cụ thể) khi bạn đặt hàng hoặc lưu vào sổ địa chỉ.</li>
            <li>Lịch sử đơn hàng, sản phẩm đã xem/mua, sản phẩm yêu thích.</li>
            <li>Dữ liệu kỹ thuật cơ bản (cookie giỏ hàng, phiên đăng nhập) để website hoạt động đúng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">2. Mục đích sử dụng</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Xử lý và giao đơn hàng, liên hệ xác nhận khi cần thiết.</li>
            <li>Chăm sóc khách hàng, hỗ trợ đổi trả, giải quyết khiếu nại.</li>
            <li>Gửi email xác nhận đơn hàng và cập nhật trạng thái giao hàng.</li>
            <li>Gửi thông tin khuyến mãi, sản phẩm mới — chỉ khi bạn đã đăng ký nhận tin, có thể huỷ đăng ký bất cứ lúc nào.</li>
            <li>Cải thiện website và trải nghiệm mua sắm.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">3. Chia sẻ thông tin với bên thứ ba</h2>
          <p className="mb-4">
            Nomad không bán hoặc cho thuê dữ liệu cá nhân của bạn. Thông tin chỉ được chia sẻ ở
            mức tối thiểu cần thiết với các đối tác sau để vận hành dịch vụ:
          </p>
          <div className="border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-dwarfs-surface text-foreground">
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Đối tác</th>
                  <th className="text-left px-4 py-3 font-medium">Dữ liệu chia sẻ</th>
                  <th className="text-left px-4 py-3 font-medium">Mục đích</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SHARED_WITH.map((row) => (
                  <tr key={row.party}>
                    <td className="px-4 py-3.5 text-foreground font-medium whitespace-nowrap">{row.party}</td>
                    <td className="px-4 py-3.5">{row.data}</td>
                    <td className="px-4 py-3.5">{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">4. Bảo mật dữ liệu</h2>
          <p>
            Mật khẩu tài khoản được mã hoá trước khi lưu trữ, mọi kết nối giữa trình duyệt và
            website đều qua HTTPS. Chỉ nhân sự cần thiết mới có quyền truy cập hệ thống quản trị,
            và mọi truy cập đều được xác thực bằng tài khoản riêng.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">5. Thời gian lưu trữ</h2>
          <p>
            Thông tin tài khoản được lưu trữ trong suốt thời gian bạn còn sử dụng dịch vụ. Thông
            tin đơn hàng được lưu theo thời hạn quy định của pháp luật về kế toán, hoá đơn. Bạn có
            thể yêu cầu xoá dữ liệu tài khoản theo mục 6 bên dưới.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">6. Quyền của bạn</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>Xem và cập nhật thông tin cá nhân, địa chỉ giao hàng bất cứ lúc nào trong mục &ldquo;Tài khoản của tôi&rdquo;.</li>
            <li>Yêu cầu Nomad cung cấp bản sao dữ liệu cá nhân đang lưu trữ.</li>
            <li>Yêu cầu chỉnh sửa hoặc xoá tài khoản và dữ liệu liên quan — liên hệ theo thông tin bên dưới, Nomad phản hồi trong vòng 7 ngày làm việc.</li>
            <li>Rút lại sự đồng ý nhận email khuyến mãi bất cứ lúc nào.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">7. Đối tượng áp dụng</h2>
          <p>
            Website không chủ đích thu thập dữ liệu của người dưới 16 tuổi. Nếu phát hiện trường
            hợp này, Nomad sẽ xoá dữ liệu liên quan sau khi được thông báo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium text-foreground mb-3">8. Thay đổi chính sách</h2>
          <p>
            Nomad có thể cập nhật chính sách này để phù hợp với thay đổi trong dịch vụ hoặc quy
            định pháp luật. Phiên bản mới nhất luôn được đăng tại trang này.
          </p>
        </section>
      </div>

      {/* Contact */}
      <section className="mt-14 border border-border p-6 sm:p-8">
        <h2 className="text-lg font-medium mb-2">Câu hỏi về chính sách bảo mật?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Liên hệ Nomad để được giải đáp hoặc yêu cầu chỉnh sửa/xoá dữ liệu cá nhân.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="mailto:support@nomad.vn"
            className="flex items-center gap-3 p-4 border border-border hover:border-dwarfs-dark hover:bg-dwarfs-surface transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-none">
              <Mail size={16} className="text-stone-600" />
            </div>
            <div>
              <p className="text-xs font-medium group-hover:underline">Email</p>
              <p className="text-xs text-muted-foreground">support@nomad.vn</p>
            </div>
          </a>

          <a
            href="tel:19001234"
            className="flex items-center gap-3 p-4 border border-border hover:border-dwarfs-dark hover:bg-dwarfs-surface transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center flex-none">
              <Phone size={16} className="text-stone-600" />
            </div>
            <div>
              <p className="text-xs font-medium group-hover:underline">Hotline</p>
              <p className="text-xs text-muted-foreground">1900 1234</p>
            </div>
          </a>
        </div>
      </section>

      {/* Footer links */}
      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/gioi-thieu" className="underline-anim text-muted-foreground hover:text-foreground">
          Giới thiệu
        </Link>
        <Link href="/policy" className="underline-anim text-muted-foreground hover:text-foreground">
          Chính sách đổi trả
        </Link>
        <Link href="/dieu-khoan-su-dung" className="underline-anim text-muted-foreground hover:text-foreground">
          Điều khoản sử dụng
        </Link>
      </div>
    </div>
  );
}
