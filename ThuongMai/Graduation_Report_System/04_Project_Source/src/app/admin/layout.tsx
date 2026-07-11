'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Middleware bảo vệ hệ thống
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isLoading, pathname, router]);

  // Nếu đang loading auth, hiện màn hình chờ
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-amber-500 font-bold text-sm uppercase tracking-widest animate-pulse">Đang kiểm tra quyền...</p>
      </div>
    );
  }

  // Chặn không cho render nếu chưa đăng nhập (để tránh chớp giao diện)
  if (!user && pathname !== '/admin/login') {
    return null;
  }

  // Nếu đang ở trang login, render trang login trống trải không sidebar
  if (pathname === '/admin/login') {
    return <main className="bg-zinc-950 min-h-screen">{children}</main>;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Phân Quyền */}
      <aside className="w-full md:w-64 bg-[#111111] border-r border-zinc-800 flex-col hidden md:flex shrink-0 z-10 relative">
        <div className="p-6 border-b border-zinc-800">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <span className="text-amber-500 font-black text-xl">D</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-widest text-zinc-50 leading-none">ADMIN</span>
              <span className="text-[10px] text-amber-500 font-black tracking-[0.2em] uppercase mt-1">{user?.role}</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* CÁC QUYỀN CỦA QUẢN TRỊ VIÊN */}
          {isAdmin && (
            <Link href="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${pathname === '/admin' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold shadow-inner' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}>
              <LayoutDashboard className="w-4 h-4" />
              Tổng quan
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${pathname.includes('/products') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold shadow-inner' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}>
              <Package className="w-4 h-4" />
              Sản phẩm
            </Link>
          )}
          
          {/* QUYỀN CHUNG (AI CŨNG THẤY) */}
          <Link href="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${pathname.includes('/orders') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold shadow-inner' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}>
            <ShoppingCart className="w-4 h-4" />
            Đơn hàng
          </Link>

          {isAdmin && (
            <Link href="/admin/customers" className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${pathname.includes('/customers') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold shadow-inner' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}>
              <Users className="w-4 h-4" />
              Khách hàng
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${pathname.includes('/settings') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold shadow-inner' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'}`}>
              <Settings className="w-4 h-4" />
              Cài đặt
            </Link>
          )}
        </nav>

        {/* Thông tin User Đăng nhập */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <div className="px-4 py-3 flex items-center gap-3 bg-zinc-900/50 rounded-md border border-zinc-800/50">
            <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center uppercase font-bold text-xs text-zinc-400">
              {user?.username.substring(0,2)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-zinc-200 leading-none truncate">{user?.fullName}</p>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">{user?.username}</p>
            </div>
          </div>
          <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 transition-colors uppercase tracking-widest text-[10px]">
            <Home className="w-4 h-4" />
            Về Trang Chủ
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors uppercase tracking-widest text-[10px]">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a]">
        {children}
      </main>
    </div>
  );
}
