import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProductListItem } from "@/types";

interface WishlistStore {
  items: ProductListItem[];
  addItem: (product: ProductListItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: ProductListItem) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isWishlisted(product._id)) {
          set((state) => ({ items: [...state.items, product] }));
        }
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item._id !== productId),
        }));
      },

      toggleItem: (product) => {
        if (get().isWishlisted(product._id)) {
          get().removeItem(product._id);
        } else {
          get().addItem(product);
        }
      },

      isWishlisted: (productId) => {
        return get().items.some((item) => item._id === productId);
      },
    }),
    {
      name: "dwarfs-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
