'use client';

import React, { useMemo } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

export default function AdminCustomers() {
  const { orders } = useOrders();

  // Phân tích dữ liệu: Gom nhóm khách hàng dựa trên Số điện thoại
  const customers = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      if (!map.has(o.customerInfo.phone)) {
        map.set(o.customerInfo.phone, {
          ...o.customerInfo,
          totalSpent: o.totalAmount,
          ordersCount: 1,
          lastOrderDate: new Date().toLocaleDateString('vi-VN')
        });
      } else {
        const c = map.get(o.customerInfo.phone);
        c.totalSpent += o.totalAmount;
        c.ordersCount += 1;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent); // Xếp hạng VIP
  }, [orders]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-zinc-50 tracking-tight uppercase flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> Hồ sơ Khách hàng
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Hệ thống tự động phân tích và xếp hạng Khách hàng dựa trên lịch sử mua sắm.</p>
      </div>

      <div className="bg-[#111111] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-bold">Khách hàng</th>
              <th className="px-6 py-4 font-bold">Liên hệ</th>
              <th className="px-6 py-4 font-bold">Địa chỉ nhận hàng</th>
              <th className="px-6 py-4 font-bold text-center">Số Đơn</th>
              <th className="px-6 py-4 font-bold text-right">Tổng Chi Tiêu (Hạng VIP)</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-zinc-500">
                  Chưa có khách hàng nào trong cơ sở dữ liệu.
                </td>
              </tr>
            ) : (
              customers.map((c, idx) => (
                <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                        {c.name.substring(0, 1).toUpperCase()}
                      </div>
                      <p className="font-bold text-zinc-200">{c.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <p className="flex items-center gap-2 text-zinc-300"><Phone className="w-3 h-3 text-amber-500" /> {c.phone}</p>
                    <p className="flex items-center gap-2 text-zinc-500 text-xs"><Mail className="w-3 h-3" /> {c.email}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-400 max-w-xs truncate">
                    <MapPin className="w-3 h-3 inline mr-1 text-zinc-600" /> {c.address}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-zinc-300">
                    <span className="bg-zinc-800 px-2 py-1 rounded">{c.ordersCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-black text-amber-500 text-base">{c.totalSpent.toLocaleString('vi-VN')} đ</p>
                    {c.totalSpent >= 2000000 && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                        Khách VIP
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
