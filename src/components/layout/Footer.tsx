"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--background)] mt-16">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-medium tracking-[0.2em] uppercase">
              Dwarfs
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              Thời trang tối giản, chất liệu cao cấp. Được thiết kế cho cuộc sống hiện đại của bạn.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com/dwarfs.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline-anim"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/dwarfs.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline-anim"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                href="https://tiktok.com/@dwarfs.vn"
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
                { label: "Áo", href: "/shop/ao" },
                { label: "Quần", href: "/shop/quan" },
                { label: "Phụ kiện", href: "/shop/phu-kien" },
                { label: "New Arrivals", href: "/shop?filter=new" },
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
                { label: "Chính sách đổi trả", href: "/chinh-sach-doi-tra" },
                { label: "Chính sách vận chuyển", href: "/chinh-sach-van-chuyen" },
                { label: "Câu hỏi thường gặp", href: "/faq" },
                { label: "Liên hệ", href: "/lien-he" },
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
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email của bạn"
                className="input-base flex-1 text-xs py-2"
              />
              <button type="submit" className="btn-primary py-2 px-4 text-xs whitespace-nowrap">
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Dwarfs. All rights reserved.
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
