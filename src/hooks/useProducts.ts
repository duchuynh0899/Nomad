"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProductListItem, SortOption, ProductCategory } from "@/types";

interface UseProductsOptions {
  category?: ProductCategory;
  sort?: SortOption;
  color?: string;
  size?: string;
  q?: string;
  filter?: "new" | "sale";
  pageSize?: number;
}

interface ProductsState {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    total: 0,
    page: 1,
    totalPages: 1,
    isLoading: true,
    error: null,
  });

  const { category, sort = "newest", color, size, q, filter, pageSize = 12 } = options;

  const fetchProducts = useCallback(
    async (page = 1) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        if (color) params.set("color", color);
        if (size) params.set("size", size);
        if (q) params.set("q", q);
        if (filter) params.set("filter", filter);
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const json = await res.json();
        setState({
          products: json.data.items,
          total: json.data.total,
          page: json.data.page,
          totalPages: json.data.totalPages,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Không thể tải sản phẩm. Vui lòng thử lại.",
        }));
      }
    },
    [category, sort, color, size, q, filter, pageSize]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const goToPage = (page: number) => fetchProducts(page);

  return { ...state, goToPage, refetch: () => fetchProducts(state.page) };
}
