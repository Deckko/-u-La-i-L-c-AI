'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  variant_id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image_url: string;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('deckko_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  const saveToStorage = (items: CartItem[]) => {
    localStorage.setItem('deckko_cart', JSON.stringify(items));
    // Use setTimeout to defer event dispatch out of the render cycle
    setTimeout(() => window.dispatchEvent(new Event('cart-updated')), 0);
  };

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variant_id === item.variant_id);
      let updated: CartItem[];
      
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex].quantity += qty;
      } else {
        updated = [...prev, { ...item, quantity: qty }];
      }
      
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((variantId: string, qty: number) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) => (item.variant_id === variantId ? { ...item, quantity: qty } : item))
        .filter((item) => item.quantity > 0);
      
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('deckko_cart');
    window.dispatchEvent(new Event('cart-updated'));
  }, []);

  return { cartItems, addToCart, updateQuantity, clearCart };
}
