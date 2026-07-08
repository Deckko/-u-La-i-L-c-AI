'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, Server, Key, Webhook } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  
  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-2xl font-black text-zinc-50 tracking-tight uppercase flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" /> Cài Đặt Hệ Thống
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Trung tâm kiểm soát phân quyền và cấu hình Database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Key className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Quyền Hạn Tài Khoản</h2>
          </div>
          
          <div className="space-y-4 text-sm text-zinc-400">
            <p>Xin chào, <span className="font-bold text-zinc-200">{user?.fullName}</span>!</p>
            <p>Tài khoản của bạn đang được cấp quyền: <strong className="text-amber-500">{user?.role}</strong></p>
            
            <div className="bg-zinc-950 p-4 rounded border border-zinc-800 mt-4">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quyền thao tác của bạn:</h3>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-center gap-2">✓ Xem đơn hàng</li>
                <li className="flex items-center gap-2">✓ Cập nhật trạng thái giao hàng</li>
                {user?.role === 'ADMIN' && (
                  <>
                    <li className="flex items-center gap-2 text-emerald-400">✓ Thêm/Sửa/Xóa Sản phẩm</li>
                    <li className="flex items-center gap-2 text-emerald-400">✓ Xem Phân tích Doanh thu</li>
                    <li className="flex items-center gap-2 text-emerald-400">✓ Xem Hồ sơ Khách hàng VIP</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Server className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-black text-zinc-100 uppercase tracking-widest">Trạng Thái Kết Nối</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-zinc-950 p-4 rounded border border-zinc-800">
              <span className="text-sm text-zinc-400 font-bold uppercase">Cơ sở dữ liệu (Storage)</span>
              <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded text-xs font-black uppercase">Đang hoạt động</span>
            </div>
            <div className="flex justify-between items-center bg-zinc-950 p-4 rounded border border-zinc-800">
              <span className="text-sm text-zinc-400 font-bold uppercase">Webhooks (GHN API)</span>
              <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded text-xs font-black uppercase">Giả lập</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
