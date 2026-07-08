'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, User } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      router.push('/admin/orders'); // Đăng nhập xong tự nhảy vào phần Quản lý đơn hàng
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#111111] p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <span className="text-amber-500 font-black text-3xl">D</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-50 uppercase tracking-widest">Deckko CMS</h1>
          <p className="text-sm text-zinc-500 mt-2">Đăng nhập phân quyền nội bộ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded text-center font-semibold animate-in fade-in zoom-in duration-300">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tên đăng nhập</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                placeholder="Nhập nvdeckko hoặc ADDECKKO"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm text-zinc-100 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-4 rounded-lg transition-colors uppercase tracking-widest text-sm mt-4 shadow-lg shadow-amber-500/20 hover:scale-[1.02]">
            Đăng nhập hệ thống
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-xs text-zinc-500 text-center space-y-2 bg-zinc-900/50 p-4 rounded-lg">
          <p className="font-bold text-zinc-400 uppercase tracking-widest mb-1">Tài khoản Test</p>
          <div className="flex justify-between items-center border-b border-zinc-800 pb-1">
            <span>Nhân viên: <code className="text-amber-500 font-bold">nvdeckko</code></span>
            <span>Mk: <code className="text-amber-500 font-bold">123456</code></span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span>Quản trị viên: <code className="text-amber-500 font-bold">ADDECKKO</code></span>
            <span>Mk: <code className="text-amber-500 font-bold">Deckko</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
