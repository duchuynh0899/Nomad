import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, ProductListItem, ProductVariant } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: ProductListItem, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        const existingItemId = `${product.id}-${variant.id}`;
        const existing = get().items.find((i) => i.id === existingItemId);

        if (existing) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === existingItemId
                ? { ...item, quantity: Math.min(item.quantity + quantity, variant.stock) }
                : item
            ),
          }));
        } else {
          const newItem: CartItem = {
            id: existingItemId,
            product,
            variant,
            quantity: Math.min(quantity, variant.stock),
          };
          set((state) => ({ items: [...state.items, newItem] }));
        }

        // Auto-open cart after adding
        set({ isOpen: true });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      total: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "dwarfs-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist items, not UI state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
