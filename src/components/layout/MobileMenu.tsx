"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { X, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 bg-[var(--background)] shadow-xl transition-transform duration-300 ease-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="text-base font-medium tracking-[0.2em] uppercase">Nomad</span>
          <button onClick={onClose} className="p-1" aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between px-6 py-3.5 text-sm hover:bg-dwarfs-surface transition-colors"
            >
              {item.label}
              <ChevronRight size={14} className="text-muted-foreground" />
            </Link>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-6 space-y-3">
          {isAuthed ? (
            <>
              <Link href="/account" onClick={onClose} className="block text-sm text-muted-foreground hover:text-foreground underline-anim">
                Tài khoản của tôi
              </Link>
              <button
                onClick={() => {
                  onClose();
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground underline-anim"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block text-sm font-medium text-foreground underline-anim"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
          <Link href="/wishlist" onClick={onClose} className="block text-sm text-muted-foreground hover:text-foreground underline-anim">
            Danh sách yêu thích
          </Link>
          <Link href="/policy" onClick={onClose} className="block text-sm text-muted-foreground hover:text-foreground underline-anim">
            Liên hệ
          </Link>
        </div>
      </div>
    </>
  );
}
