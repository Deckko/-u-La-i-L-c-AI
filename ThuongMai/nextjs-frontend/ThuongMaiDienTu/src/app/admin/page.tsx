'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, ArrowUpRight, Activity, TrendingUp } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/hooks/useOrders';

// Day labels for chart
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function buildDayChart(orders: Order[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun=0 … Sat=6
  for (const o of orders) {
    const day = new Date(o.createdAt).getDay();
    counts[day]++;
  }
  const max = Math.max(...counts, 1);
  return counts.map((c) => Math.round((c / max) * 85) + 5); // 5–90% height
}

// Reorder to Mon-Sun display (index 1..6, 0)
function reorderForDisplay(arr: number[]): { label: string; height: number; count: number }[] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((i) => ({ label: DAY_LABELS[i], height: arr[i], count: 0 }));
}

export default function AdminDashboard() {
  const { orders } = useOrders();

  const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const orderCount = orders.length;
  const uniqueCustomers = new Set(orders.map((o) => o.customerInfo.phone)).size;
  const recentOrders = [...orders].reverse().slice(0, 5);

  const chartHeights = buildDayChart(orders);
  const chartData = reorderForDisplay(chartHeights);

  // Average order value
  const avgOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-zinc-50 tracking-tight uppercase">Tổng quan</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Dữ liệu thực tế từ hệ thống đơn hàng.{' '}
          {orderCount === 0 && (
            <span className="text-amber-500">Chưa có đơn hàng nào.</span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="TỔNG DOANH THU"
          value={`${revenue.toLocaleString('vi-VN')} đ`}
          icon={<DollarSign className="w-5 h-5 text-amber-500" />}
          trend={orderCount > 0 ? '+Realtime' : '—'}
          trendUp={orderCount > 0}
        />
        <StatCard
          title="TỔNG ĐƠN HÀNG"
          value={orderCount.toString()}
          icon={<ShoppingCart className="w-5 h-5 text-emerald-500" />}
          trend="Realtime"
          trendUp={true}
        />
        <StatCard
          title="KHÁCH HÀNG"
          value={uniqueCustomers.toString()}
          icon={<Users className="w-5 h-5 text-blue-500" />}
          trend="Unique"
          trendUp={true}
        />
        <StatCard
          title="ĐƠN HÀNG TB"
          value={avgOrder > 0 ? `${avgOrder.toLocaleString('vi-VN')} đ` : '—'}
          icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
          trend="/ đơn"
          trendUp={avgOrder > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Order Chart by Day of Week */}
        <div className="lg:col-span-2 bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" aria-hidden="true" />
              Đơn hàng theo ngày trong tuần
            </h2>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              {orderCount} đơn tổng
            </span>
          </div>

          {orderCount === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-zinc-600 text-sm font-medium">
              Chưa có dữ liệu đơn hàng
            </div>
          ) : (
            <>
              <div className="h-[200px] flex items-end justify-between gap-2 px-1">
                {chartData.map(({ label, height }, i) => (
                  <div key={i} className="w-full relative group flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-zinc-800 rounded-t-sm group-hover:bg-amber-500 transition-colors duration-300"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                {chartData.map(({ label }, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-5 border-b border-zinc-800/50 pb-4">
            Đơn hàng mới nhất
          </h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-zinc-500 text-sm italic text-center py-6">Chưa có đơn hàng nào.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex justify-between items-center p-3 hover:bg-zinc-900/50 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center border shrink-0 ${
                        order.status === 'Chờ xử lý'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                          : order.status === 'Đang giao'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                          : order.status === 'Đã hủy'
                          ? 'bg-red-500/10 border-red-500/20 text-red-500'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-200 truncate">{order.customerInfo.name}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{order.id}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-amber-500">
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-[#111111] border border-zinc-800 p-5 rounded-xl relative overflow-hidden group shadow-xl">
      <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:scale-110 group-hover:opacity-30 transition-all duration-500" aria-hidden="true">
        {icon}
      </div>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{title}</p>
      <h3 className="text-2xl font-black text-zinc-50 tracking-tight leading-none">{value}</h3>
      <div className="flex items-center gap-2 mt-3">
        <span
          className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded ${
            trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          {trendUp && <ArrowUpRight className="w-3 h-3 mr-0.5" aria-hidden="true" />}
          {trend}
        </span>
      </div>
    </div>
  );
}
