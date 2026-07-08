import { useState, useEffect, useCallback } from 'react';
import { mockProducts } from '@/data/mockProducts';
// Import the canonical Product type from the single source of truth
import type { Product as CatalogProduct } from '@/data/mockProducts';

/**
 * AdminProduct extends the catalog Product with extra admin-only fields.
 * This avoids the type conflict between mockProducts.Product and the old
 * useProducts interface.
 */
export interface AdminProduct extends CatalogProduct {
  category?: string;
  description?: string;
  stock?: number;
  isActive?: boolean;
  video?: string;
}

// Re-export the catalog type so consumers can use a single import
export type { CatalogProduct as Product };

const STORAGE_KEY = 'deckko_products';

export function useProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);

  const loadProducts = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setProducts(JSON.parse(saved) as AdminProduct[]);
      } else {
        const initial = mockProducts as AdminProduct[];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setProducts(initial);
      }
    } catch {
      // If storage is corrupted, fall back to mock data
      setProducts(mockProducts as AdminProduct[]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = useCallback((p: AdminProduct) => {
    setProducts((prev) => {
      const updated = [p, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<AdminProduct>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { products, addProduct, updateProduct, deleteProduct, reloadProducts: loadProducts };
}
