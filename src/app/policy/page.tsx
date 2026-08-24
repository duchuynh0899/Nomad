import type { Metadata } from "next";
import Link from "next/link";
import {
  RefreshCw,
  Banknote,
  ShieldCheck,
  PackageCheck,
  XCircle,
  Phone,
  Mail,
  Clock,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Chính sách đổi trả | Nomad",
  description:
    "Chính sách đổi trả sản phẩm của Nomad – đổi size/màu, hoàn tiền và bảo hành lỗi nhà sản xuất trong vòng 14 ngày.",
};

// ─── Section data ─────────────────────────────────────────────────────────────

const POLICIES = [
  {
    icon: <RefreshCw size={22} />,
    title: "Đổi size / màu sắc",
    days: "14 ngày",
    color: "bg-stone-100 text-stone-700",
    conditions: [
      "Sản phẩm còn nguyên tem, nhãn, chưa qua sử dụng",
      "Còn hóa đơn mua hàng hoặc xác nhận đơn qua email/Zalo",
      "Không bị bẩn, rách, biến dạng hoặc có mùi lạ",
      "Đổi sang size / màu còn hàng trong cùng sản phẩm",
    ],
    note: "Khách hàng chịu phí vận chuyển chiều gửi về. Nomad chịu phí gửi hàng đổi lại.",
  },
  {
    icon: <Banknote size={22} />,
    title: "Hoàn tiền",
    days: "14 ngày",
    color: "bg-emerald-100 text-emerald-700",
    conditions: [
      "Sản phẩm bị lỗi do Nomad giao sai (sai sản phẩm, sai size, sai màu)",
      "Sản phẩm bị hư hỏng trong quá trình vận chuyển",
      "Sản phẩm không đúng mô tả trên website",
      "Khách chưa nhận được hàng sau 10 ngày kể từ khi xác nhận đơn",
    ],
    note: "Hoàn tiền 100% qua chuyển khoản ngân hàng trong 3–5 ngày làm việc. Không áp dụng hoàn tiền khi khách đổi ý.",
  },
  {
    icon: <ShieldCheck size={22} />,
    title: "Bảo hành lỗi nhà sản xuất",
    days: "30 ngày",
    color: "bg-blue-100 text-blue-700",
    conditions: [
      "Đường may bị bung, tuột trong điều kiện sử dụng bình thường",
      "Vải bị lỗi: thủng, sờn, phai màu bất thường sau 1–2 lần giặt",
      "Khóa kéo, cúc áo bị hỏng do lỗi sản xuất",
      "Form dáng biến dạng bất thường dù giặt đúng hướng dẫn",
    ],
    note: "Nomad chịu toàn bộ chi phí vận chuyển 2 chiều cho trường hợp lỗi nhà sản xuất.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Liên hệ Nomad",
    description:
      "Nhắn tin qua Zalo OA, email hoặc hotline kèm ảnh/video sản phẩm và lý do đổi trả. Phản hồi trong vòng 2 giờ trong giờ hành chính.",
  },
  {
    step: "02",
    title: "Xác nhận & gửi hàng",
    description:
      "Nomad xác nhận yêu cầu và cung cấp địa chỉ kho. Đóng gói sản phẩm cẩn thận kèm phiếu ghi rõ tên, SĐT, mã đơn hàng và lý do.",
  },
  {
    step: "03",
    title: "Kiểm tra hàng",
    description:
      "Nomad kiểm tra sản phẩm trong vòng 1–2 ngày làm việc sau khi nhận hàng. Thông báo kết quả qua Zalo/email.",
  },
  {
    step: "04",
    title: "Xử lý & hoàn tất",
    description:
      "Gửi hàng đổi trong 1–2 ngày làm việc hoặc hoàn tiền trong 3–5 ngày làm việc sau khi duyệt.",
  },
];

const NOT_ACCEPTED = [
  "Sản phẩm đã qua sử dụng, giặt là hoặc có dấu hiệu mặc",
  "Sản phẩm không còn nguyên tem, nhãn mác",
  "Quá thời hạn đổi trả quy định",
  "Sản phẩm thuộc danh mục sale cuối mùa (ghi rõ trên trang sản phẩm)",
  "Khách đổi ý không có lý do liên quan đến chất lượng sản phẩm (chỉ áp dụng hoàn tiền)",
  "Sản phẩm bị hư hỏng do giặt sai hướng dẫn, bảo quản không đúng cách",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
        <Link href="/" className="hover:text-foreground underline-anim">Trang chủ</Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Chính sách đổi trả</span>
      </nav>

      {/* Hero */}
      <div className="mb-12 border-b border-border pb-10">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Chính sách
        </p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
          Đổi trả & Bảo hành
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Nomad cam kết mang đến trải nghiệm mua sắm an tâm. Chúng tôi hỗ trợ đổi size/màu,
          hoàn tiền và bảo hành lỗi nhà sản xuất — minh bạch, nhanh chóng, không rắc rối.
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-6 mt-8">
          {[
            { value: "14 ngày", label: "Đổi trả" },
            { value: "30 ngày", label: "Bảo hành NSX" },
            { value: "3–5 ngày", label: "Hoàn tiền" },
            { value: "2 giờ", label: "Phản hồi" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-medium">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Policy cards */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6">Các hình thức hỗ trợ</h2>
        <div className="space-y-5">
          {POLICIES.map((policy) => (
            <div key={policy.title} className="border border-border p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${policy.color}`}>
                    {policy.icon}
                  </div>
                  <h3 className="font-medium text-base">{policy.title}</h3>
                </div>
                <span className="text-xs font-medium tracking-wide border border-border px-3 py-1">
                  {policy.days}
                </span>
              </div>

              {/* Conditions */}
              <ul className="space-y-2 mb-4">
                {policy.conditions.map((condition, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground flex-none" />
                    {condition}
                  </li>
                ))}
              </ul>

              {/* Note */}
              <div className="bg-dwarfs-surface px-4 py-3 text-xs text-muted-foreground leading-relaxed border-l-2 border-border">
                <span className="font-medium text-foreground">Lưu ý: </span>
                {policy.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process steps */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6">Quy trình đổi trả</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-4 p-5 border border-border">
              <span className="text-3xl font-light text-muted-foreground/30 flex-none leading-none">
                {s.step}
              </span>
              <div>
                <p className="font-medium text-sm mb-1.5">{s.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Not accepted */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
          <XCircle size={20} className="text-red-500" />
          Trường hợp không được đổi trả
        </h2>
        <div className="border border-border p-6">
          <ul className="space-y-3">
            {NOT_ACCEPTED.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <XCircle size={15} className="text-red-400 flex-none mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Shipping cost */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
          <PackageCheck size={20} />
          Phí vận chuyển đổi trả
        </h2>
        <div className="border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-dwarfs-surface">
                <th className="text-left px-5 py-3 font-medium">Trường hợp</th>
                <th className="text-left px-5 py-3 font-medium">Chiều gửi về</th>
                <th className="text-left px-5 py-3 font-medium">Chiều gửi lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-5 py-3.5">Đổi size / màu (khách muốn)</td>
                <td className="px-5 py-3.5 text-muted-foreground">Khách chịu</td>
                <td className="px-5 py-3.5 text-emerald-600 font-medium">Nomad chịu</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5">Lỗi do Nomad giao sai</td>
                <td className="px-5 py-3.5 text-emerald-600 font-medium">Nomad chịu</td>
                <td className="px-5 py-3.5 text-emerald-600 font-medium">Nomad chịu</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5">Lỗi nhà sản xuất</td>
                <td className="px-5 py-3.5 text-emerald-600 font-medium">Nomad chịu</td>
                <td className="px-5 py-3.5 text-emerald-600 font-medium">Nomad chịu</td>
              </tr>
              <tr>
                <td className="px-5 py-3.5">Hoàn tiền (Nomad giao sai)</td>
                <td className="px-5 py-3.5 text-emerald-600 font-medium">Nomad chịu</td>
                <td className="px-5 py-3.5 text-muted-foreground">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Contact */}
      <section className="border border-border p-6 sm:p-8">
        <h2 className="text-lg font-medium mb-2">Cần hỗ trợ đổi trả?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Đội ngũ Nomad phản hồi trong vòng 2 giờ trong giờ hành chính (8:00 – 21:00, kể cả T7 CN).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://zalo.me/nomad"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-border hover:border-dwarfs-dark hover:bg-dwarfs-surface transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-none">
              Z
            </div>
            <div>
              <p className="text-xs font-medium group-hover:underline">Zalo OA</p>
              <p className="text-xs text-muted-foreground">@Nomad Official</p>
            </div>
          </a>

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

        <div className="flex items-center gap-2 mt-5 text-xs text-muted-foreground">
          <Clock size={13} />
          <span>Giờ làm việc: 8:00 – 21:00 hàng ngày (kể cả T7, CN)</span>
        </div>
      </section>

      {/* Footer links */}
      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/chinh-sach-van-chuyen" className="underline-anim text-muted-foreground hover:text-foreground">
          Chính sách vận chuyển
        </Link>
        <Link href="/huong-dan-chon-size" className="underline-anim text-muted-foreground hover:text-foreground">
          Hướng dẫn chọn size
        </Link>
        <Link href="/faq" className="underline-anim text-muted-foreground hover:text-foreground">
          Câu hỏi thường gặp
        </Link>
      </div>
    </div>
  );
}
