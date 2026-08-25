"use client";

import { useState, useEffect, useCallback } from "react";
import { listProducts } from "@/lib/api/products";
import { ApiError } from "@/lib/api/http";
import type { Product, ProductSort } from "@/types/api";

interface UseProductsOptions {
  category?: string; // id danh mục
  sort?: ProductSort;
  color?: string;
  size?: string;
  search?: string;
  isBestSeller?: boolean;
  limit?: number;
}

interface ProductsState {
  products: Product[];
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

  const { category, sort = "newest", color, size, search, isBestSeller, limit = 12 } = options;

  const fetchProducts = useCallback(
    async (page = 1) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const res = await listProducts({ category, sort, color, size, search, isBestSeller, page, limit });
        setState({
          products: res.items,
          total: res.meta.total,
          page: res.meta.page,
          totalPages: res.meta.totalPages,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof ApiError ? err.message : "Không thể tải sản phẩm. Vui lòng thử lại.",
        }));
      }
    },
    [category, sort, color, size, search, isBestSeller, limit]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const goToPage = (page: number) => fetchProducts(page);

  return { ...state, goToPage, refetch: () => fetchProducts(state.page) };
}
