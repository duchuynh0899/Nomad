"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";

export function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, total } = useCartStore();

  // Lock body scroll
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
          "fixed inset-0 z-50 bg-black/30 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-[var(--background)] shadow-xl",
          "transition-transform duration-300 ease-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-medium tracking-widest uppercase">
            Giỏ hàng ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="p-1 hover:bg-dwarfs-surface rounded-full transition-colors"
            aria-label="Đóng giỏ hàng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium">Giỏ hàng trống</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hãy thêm sản phẩm để bắt đầu mua sắm
                </p>
              </div>
              <button
                onClick={closeCart}
                className="btn-outline text-sm mt-2"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 border-b border-border last:border-b-0">
                  {/* Image */}
                  <Link
                    href={`/shop/${item.product.category.slug}/${item.product.slug}`}
                    onClick={closeCart}
                    className="flex-none w-20 aspect-[3/4] bg-dwarfs-surface overflow-hidden"
                  >
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.images[0].alt ?? item.product.name}
                        width={80}
                        height={107}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/shop/${item.product.category.slug}/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium leading-tight hover:underline line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {item.variant.size} · Màu: {item.color.name}
                        </p>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-none p-1 hover:text-red-500 transition-colors"
                        aria-label="Xóa sản phẩm"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-dwarfs-surface transition-colors"
                          aria-label="Giảm số lượng"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 py-1 text-sm min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stock}
                          className="px-2 py-1 hover:bg-dwarfs-surface transition-colors disabled:opacity-40"
                          aria-label="Tăng số lượng"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-sm font-medium">
                        {formatPrice(item.product.effectivePrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-medium">{formatPrice(total())}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Phí vận chuyển sẽ được tính ở bước thanh toán
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full block text-center"
            >
              Thanh toán
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-sm text-muted-foreground hover:text-foreground underline-anim text-center"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
}
