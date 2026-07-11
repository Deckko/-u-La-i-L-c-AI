'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, PackageSearch } from 'lucide-react';
import { Header } from '@/components/organisms/Header';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#111111] border border-zinc-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-zinc-50 tracking-tight uppercase">Đặt Hàng Thành Công</h1>
          <p className="text-zinc-400">Cảm ơn bạn đã tin tưởng và mua sắm tại DECKKO. Đơn hàng của bạn đang được xử lý.</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg inline-block w-full shadow-inner">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Mã đơn hàng của bạn</p>
          <p className="text-2xl font-mono font-black text-amber-500 tracking-wider">{orderId || 'ORD-UNKNOWN'}</p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Link href={`/track?orderId=${orderId || ''}`} className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-6 py-4 rounded transition-colors flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20">
            <PackageSearch className="w-5 h-5" />
            THEO DÕI ĐƠN HÀNG
          </Link>
          <Link href="/" className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold px-6 py-4 rounded transition-colors">
            TIẾP TỤC MUA SẮM
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
        <SuccessContent />
      </Suspense>
    </>
  );
}
