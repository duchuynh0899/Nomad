"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { Search, Heart, User, ShoppingBag, Menu, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { SearchModal } from "@/components/ui/SearchModal";
import { MobileMenu } from "@/components/layout/MobileMenu";
import type { NavItem } from "@/types";

interface HeaderClientProps {
  navItems: NavItem[];
}

export function HeaderClient({ navItems }: HeaderClientProps) {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  // Danh mục được gom nhóm (vd "Áo", "Quần") hiện dạng dropdown trong nav — chỉ 1 dropdown mở
  // tại một thời điểm, đóng khi bấm ra ngoài toàn bộ khu vực nav.
  const [openNavGroup, setOpenNavGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const itemCount = useCartStore((state) => state.itemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng dropdown tài khoản khi bấm ra ngoài
  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountMenuOpen]);

  // Đóng dropdown nhóm danh mục (Áo/Quần...) khi bấm ra ngoài toàn bộ khu vực nav
  useEffect(() => {
    if (!openNavGroup) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenNavGroup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openNavGroup]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-[var(--background)]/95 backdrop-blur-sm border-b border-border shadow-sm"
            : "bg-[var(--background)]"
        )}
      >
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          {/* grid 2 cột 2 bên bằng nhau (1fr) để logo ở giữa luôn canh đúng tâm và không bao giờ
              bị cụm icon/nav đè lên, dù nội dung 2 bên dài/rộng khác nhau (thay cho absolute cũ). */}
          <div className="grid grid-cols-[1fr_auto_1fr] h-16 items-center">
            {/* Mobile: Menu button */}
            <div className="flex items-center justify-self-start">
              <button
                className="lg:hidden p-2 -ml-2"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Mở menu"
              >
                <Menu size={22} />
              </button>

              {/* Desktop: Nav — mục có children (nhóm danh mục "Áo"/"Quần") hiện dạng dropdown
                  thay vì liệt kê phẳng hết ra, tránh tràn hàng khi nhiều danh mục. */}
              <nav className="hidden lg:flex items-center gap-8" ref={navRef}>
                {navItems.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <div key={item.label} className="relative">
                      <button
                        onClick={() => setOpenNavGroup((v) => (v === item.label ? null : item.label))}
                        className="flex items-center gap-1 text-base text-foreground/80 hover:text-foreground transition-colors"
                        aria-expanded={openNavGroup === item.label}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={cn("transition-transform", openNavGroup === item.label && "rotate-180")}
                        />
                      </button>

                      {openNavGroup === item.label && (
                        <div className="absolute left-0 top-full mt-2 w-56 border border-border bg-[var(--background)] shadow-lg py-2 z-50">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpenNavGroup(null)}
                              className="block px-4 py-2.5 text-sm hover:bg-dwarfs-surface transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-base underline-anim text-foreground/80 hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>
            </div>

            {/* Logo – centered */}
            <Link href="/" className="text-2xl font-medium tracking-[0.2em] uppercase whitespace-nowrap">
              Nomad
            </Link>

            {/* Right icons */}
            <div className="flex items-center gap-1 justify-self-end">
              <button
                className="p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                onClick={() => setSearchOpen(true)}
                aria-label="Tìm kiếm"
              >
                <Search size={20} />
              </button>

              {/* Yêu thích/Tài khoản đã có sẵn trong menu hamburger (MobileMenu) — ẩn khỏi thanh
                  header trên điện thoại nhỏ để cụm icon không quá rộng, tránh đè lên logo giữa. */}
              <Link
                href="/wishlist"
                className="hidden sm:inline-flex relative p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                aria-label="Danh sách yêu thích"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dwarfs-dark text-[10px] font-medium text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <div className="hidden sm:block">
              {isAuthed ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    onClick={() => setAccountMenuOpen((v) => !v)}
                    className="flex items-center gap-1 p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                    aria-label="Tài khoản"
                    aria-expanded={accountMenuOpen}
                  >
                    <User size={20} />
                    <ChevronDown size={12} className={cn("transition-transform", accountMenuOpen && "rotate-180")} />
                  </button>

                  {accountMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 border border-border bg-[var(--background)] shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-dwarfs-surface transition-colors"
                      >
                        Tài khoản của tôi
                      </Link>
                      {session?.user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm hover:bg-dwarfs-surface transition-colors"
                        >
                          Trang quản trị
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-dwarfs-surface transition-colors"
                      >
                        <LogOut size={14} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 pl-2 pr-3 py-2 sm:border sm:border-border sm:rounded-full hover:bg-dwarfs-surface transition-colors"
                  aria-label="Đăng nhập / Đăng ký"
                >
                  <User size={20} />
                  <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">Đăng nhập</span>
                </Link>
              )}
              </div>

              <button
                className="relative p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                onClick={toggleCart}
                aria-label="Giỏ hàng"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dwarfs-dark text-[10px] font-medium text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} navItems={navItems} />
    </>
  );
}
