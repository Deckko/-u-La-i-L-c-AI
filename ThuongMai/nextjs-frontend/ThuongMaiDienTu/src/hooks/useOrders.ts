'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem } from './useCart';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'Chờ xử lý' | 'Đang giao' | 'Hoàn tất' | 'Đã hủy';
  trackingCode?: string;
  createdAt: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from LocalStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('deckko_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse orders', e);
      }
    }
  }, []);

  const createOrder = useCallback((orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
    // Generate a beautiful, professional Order ID
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${randomHex}`,
      status: 'Chờ xử lý',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('deckko_orders', JSON.stringify(updated));
      return updated;
    });

    const savedMyOrders = localStorage.getItem('deckko_my_orders');
    const myOrders = savedMyOrders ? JSON.parse(savedMyOrders) : [];
    localStorage.setItem('deckko_my_orders', JSON.stringify([newOrder.id, ...myOrders]));

    return newOrder.id;
  }, []);

  const updateOrderStatus = useCallback((id: string, status: Order['status'], trackingCode?: string) => {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id === id) {
          return { ...order, status, trackingCode: trackingCode || order.trackingCode };
        }
        return order;
      });
      localStorage.setItem('deckko_orders', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getOrderById = useCallback((id: string) => {
    return orders.find(o => o.id.toUpperCase() === id.toUpperCase()) || null;
  }, [orders]);
  
  // Direct storage accessor for pages that might render before state is loaded
  const getOrderFromStorage = useCallback((id: string) => {
    if (typeof window === 'undefined') return null;
    const savedOrders = localStorage.getItem('deckko_orders');
    if (savedOrders) {
      const parsed: Order[] = JSON.parse(savedOrders);
      return parsed.find(o => o.id.toUpperCase() === id.toUpperCase()) || null;
    }
    return null;
  }, []);

  return { orders, createOrder, updateOrderStatus, getOrderById, getOrderFromStorage };
}
