"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, Heart, User, ShoppingBag, Menu } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = useCartStore((state) => state.itemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const toggleCart = useCartStore((state) => state.toggleCart);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <div className="flex h-14 items-center justify-between">
            {/* Mobile: Menu button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>

            {/* Desktop: Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm underline-anim text-foreground/80 hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Logo – centered */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 text-xl font-medium tracking-[0.2em] uppercase"
            >
              Nomad
            </Link>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                onClick={() => setSearchOpen(true)}
                aria-label="Tìm kiếm"
              >
                <Search size={18} />
              </button>

              <Link
                href="/wishlist"
                className="relative p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                aria-label="Danh sách yêu thích"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dwarfs-dark text-[10px] font-medium text-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account"
                className="p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                aria-label="Tài khoản"
              >
                <User size={18} />
              </Link>

              <button
                className="relative p-2 hover:bg-dwarfs-surface rounded-full transition-colors"
                onClick={toggleCart}
                aria-label="Giỏ hàng"
              >
                <ShoppingBag size={18} />
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
