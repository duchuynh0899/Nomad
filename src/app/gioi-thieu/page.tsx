import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Leaf, Ruler, Package, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Nomad — quần nam basic và áo sơ mi tối giản. Tìm hiểu câu chuyện thương hiệu, triết lý sản phẩm và cam kết chất lượng của Nomad.",
};

const VALUES = [
  {
    icon: <Ruler size={22} />,
    title: "Tối giản, đúng trọng tâm",
    description:
      "Không chạy theo xu hướng ngắn hạn. Nomad chỉ tập trung vào vài dáng quần, áo sơ mi cơ bản nhất — form chuẩn, dễ phối, mặc được lâu dài thay vì chỉ một mùa.",
  },
  {
    icon: <Leaf size={22} />,
    title: "Chất liệu bền, đáng tiền",
    description:
      "Vải được chọn lọc kỹ để giữ form sau nhiều lần giặt, thấm hút tốt, phù hợp khí hậu nhiệt đới — ưu tiên độ bền và cảm giác mặc hơn là chạy theo giá rẻ.",
  },
  {
    icon: <Package size={22} />,
    title: "Ít lựa chọn, dễ quyết định",
    description:
      "Thay vì hàng trăm mẫu na ná nhau, Nomad giữ danh mục gọn — mỗi sản phẩm đều có lý do tồn tại, giúp bạn mua nhanh, phối đồ dễ, không tốn thời gian phân vân.",
  },
  {
    icon: <Heart size={22} />,
    title: "Đồng hành sau khi mua",
    description:
      "Đổi size/màu trong 14 ngày, bảo hành lỗi nhà sản xuất 30 ngày. Chúng tôi muốn bạn an tâm mặc lâu dài, không chỉ hài lòng ở lần mua đầu tiên.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-10">
        <Link href="/" className="hover:text-foreground underline-anim">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Giới thiệu</span>
      </nav>

      {/* Hero */}
      <div className="mb-14 border-b border-border pb-10">
        <p className="text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground mb-3">
          Giới thiệu
        </p>
        <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4">
          Đơn giản. Dễ mặc mỗi ngày.
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Nomad là thương hiệu thời trang nam tập trung vào những món đồ cơ bản nhất trong tủ đồ:
          quần nam form basic và áo sơ mi tối giản. Không phải vì chúng tôi không muốn làm nhiều
          hơn, mà vì chúng tôi tin những món đồ đơn giản, chất lượng tốt, mặc được lâu dài mới là
          thứ đáng đầu tư nhất.
        </p>
      </div>

      {/* Story */}
      <section className="mb-14 space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
        <h2 className="text-lg font-medium text-foreground mb-2">Câu chuyện của Nomad</h2>
        <p>
          Nomad bắt đầu từ một quan sát rất đơn giản: tủ đồ của phần lớn nam giới không thiếu quần
          áo, mà thiếu những món cơ bản thực sự vừa vặn, dễ phối và bền theo thời gian. Quá nhiều
          lựa chọn trên thị trường chạy theo xu hướng ngắn hạn, mua về vài lần mặc là chán hoặc
          xuống form.
        </p>
        <p>
          Vì vậy, thay vì cố gắng làm thật nhiều mẫu mã, Nomad chọn làm ít hơn nhưng làm kỹ hơn —
          tập trung vào form dáng, chất liệu và độ bền của từng sản phẩm, để mỗi món đồ trong bộ
          sưu tập đều xứng đáng có mặt trong tủ đồ của bạn.
        </p>
      </section>

      {/* Values */}
      <section className="mb-14">
        <h2 className="text-lg font-medium mb-6">Điều Nomad theo đuổi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((value) => (
            <div key={value.title} className="border border-border p-6">
              <div className="w-10 h-10 rounded-full bg-dwarfs-surface flex items-center justify-center mb-4">
                {value.icon}
              </div>
              <h3 className="font-medium text-base mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border border-border p-6 sm:p-8 text-center">
        <h2 className="text-lg font-medium mb-2">Sẵn sàng đơn giản hoá tủ đồ của bạn?</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Khám phá bộ sưu tập quần nam và áo sơ mi tối giản của Nomad — dễ chọn, dễ phối, dễ mặc
          mỗi ngày.
        </p>
        <Link href="/shop" className="btn-primary inline-block">
          Khám phá sản phẩm
        </Link>
      </section>

      {/* Footer links */}
      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/policy" className="underline-anim text-muted-foreground hover:text-foreground">
          Chính sách đổi trả
        </Link>
        <Link href="/dieu-khoan-su-dung" className="underline-anim text-muted-foreground hover:text-foreground">
          Điều khoản sử dụng
        </Link>
        <Link href="/chinh-sach-bao-mat" className="underline-anim text-muted-foreground hover:text-foreground">
          Chính sách bảo mật
        </Link>
      </div>
    </div>
  );
}
