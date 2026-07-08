'use client';

import React, { useState } from 'react';
import { Truck, CheckCircle2, PackageSearch } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const handleUpdate = (orderId: string) => {
    updateOrderStatus(orderId, 'Đang giao', trackingInput);
    setEditingId(null);
    setTrackingInput('');
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-zinc-50 tracking-tight uppercase">Quản lý Đơn hàng & Vận đơn</h1>
        <p className="text-zinc-500 text-sm mt-1">Theo dõi đơn hàng thực tế, cập nhật mã vận đơn Giao Hàng Nhanh.</p>
      </div>

      <div className="bg-[#111111] border border-zinc-800 rounded-lg p-6 shadow-2xl">
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 space-y-4">
              <PackageSearch className="w-12 h-12 mx-auto text-zinc-700" />
              <p className="text-lg font-bold text-zinc-400">Chưa có đơn hàng nào trong hệ thống</p>
              <p className="text-sm">Vui lòng quay lại giao diện Shop, giả lập đặt một đơn hàng mới để kiểm tra luồng hoạt động thực tế.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-900 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-4 font-bold">Mã Đơn</th>
                  <th className="px-4 py-4 font-bold">Khách Hàng</th>
                  <th className="px-4 py-4 font-bold">Tổng Tiền</th>
                  <th className="px-4 py-4 font-bold">Trạng Thái</th>
                  <th className="px-4 py-4 font-bold">Mã Vận Đơn GHN</th>
                  <th className="px-4 py-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors animate-in fade-in">
                    <td className="px-4 py-5 font-mono font-bold text-amber-500">
                      {order.id}
                    </td>
                    <td className="px-4 py-5">
                      <p className="font-bold text-zinc-200">{order.customerInfo.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{order.customerInfo.phone}</p>
                    </td>
                    <td className="px-4 py-5 font-bold text-zinc-300">
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-2 py-1.5 rounded text-[10px] font-black uppercase tracking-widest shadow-inner ${
                        order.status === 'Chờ xử lý' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        order.status === 'Đang giao' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      {editingId === order.id ? (
                        <div className="flex gap-2 items-center animate-in zoom-in-95 duration-200">
                          <input 
                            type="text" 
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Nhập mã GHN..."
                            className="bg-zinc-950 border border-blue-500/50 rounded px-3 py-1.5 text-xs text-zinc-100 outline-none w-36 focus:ring-1 focus:ring-blue-500/50 font-mono uppercase transition-all"
                            autoFocus
                          />
                          <button onClick={() => handleUpdate(order.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-500 transition-colors">
                            Lưu
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-zinc-300 bg-zinc-950 px-3 py-1.5 rounded border border-zinc-800">
                          {order.trackingCode || '---'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5 text-right">
                      {editingId !== order.id && order.status === 'Chờ xử lý' && (
                        <button 
                          onClick={() => {
                            setEditingId(order.id);
                            setTrackingInput(order.trackingCode || '');
                          }}
                          className="bg-amber-500 text-zinc-950 px-4 py-2 rounded text-xs font-black tracking-wide hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:scale-105"
                        >
                          <Truck className="w-3.5 h-3.5" /> Xuất kho & Giao hàng
                        </button>
                      )}
                      {order.status === 'Đang giao' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'Hoàn tất')}
                          className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded text-xs font-black tracking-wide hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:scale-105"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Xác nhận Hoàn tất
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
