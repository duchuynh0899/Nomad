import Link from "next/link";
import { listCategories } from "@/lib/api/categories";
import { NewsletterForm } from "./NewsletterForm";

export async function Footer() {
  const categories = await listCategories().catch(() => []);
  // Quần là dòng chủ lực — ưu tiên hiển thị trước trong danh sách "Mua sắm".
  const shopLinks = [...categories]
    .sort((a, b) => Number(b.slug === "quan") - Number(a.slug === "quan"))
    .map((c) => ({ label: c.name, href: `/shop/${c.slug}` }));

  return (
    <footer className="border-t border-border bg-[var(--background)] mt-16">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-medium tracking-[0.2em] uppercase">
              Nomad
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Quần nam basic và áo sơ mi tối giản — đơn giản, dễ phối, dễ mặc mỗi ngày.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com/nomad.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline-anim"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/nomad.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline-anim"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href="https://tiktok.com/@nomad.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline-anim"
                aria-label="TikTok"
              >
                TikTok
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-medium tracking-widest uppercase mb-4">Mua sắm</h3>
            <ul className="space-y-3">
              {[
                ...shopLinks,
                { label: "Hàng mới về", href: "/shop?filter=new" },
                { label: "Sale", href: "/shop?filter=sale" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground underline-anim transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-medium tracking-widest uppercase mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              {[
                { label: "Hướng dẫn chọn size", href: "/huong-dan-chon-size" },
                { label: "Chính sách đổi trả", href: "/policy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground underline-anim transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xs font-medium tracking-widest uppercase mb-4">Nhận thông tin</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi độc quyền.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Nomad. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/chinh-sach-bao-mat" className="text-xs text-muted-foreground hover:text-foreground underline-anim">
              Chính sách bảo mật
            </Link>
            <Link href="/dieu-khoan-su-dung" className="text-xs text-muted-foreground hover:text-foreground underline-anim">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
