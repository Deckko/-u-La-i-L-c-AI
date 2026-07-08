'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { useOrders, Order } from '@/hooks/useOrders';
import { Package, Truck, CheckCircle2, Search, ArrowRight, History } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get('orderId') || '';
  const { getOrderFromStorage } = useOrders();
  
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (initialOrderId) {
      handleSearch(initialOrderId);
    }
    
    // Load order history
    const savedMyOrders = localStorage.getItem('deckko_my_orders');
    if (savedMyOrders) {
      try {
        const orderIds = JSON.parse(savedMyOrders);
        const loadedOrders = orderIds
          .map((id: string) => getOrderFromStorage(id))
          .filter(Boolean) as Order[];
        setMyOrders(loadedOrders);
      } catch (e) {}
    }
  }, [initialOrderId, getOrderFromStorage]);

  const handleSearch = (idToSearch = searchInput) => {
    if (!idToSearch) return;
    const found = getOrderFromStorage(idToSearch);
    setOrder(found);
    setSearched(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xử lý': return 'text-amber-500';
      case 'Đang giao': return 'text-blue-500';
      case 'Hoàn tất': return 'text-emerald-500';
      case 'Đã hủy': return 'text-red-500';
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Header />
      <div className="flex-1 max-w-3xl w-full mx-auto p-6 mt-10">
        <h1 className="text-3xl font-black text-zinc-50 tracking-tight uppercase mb-2">Tra cứu Đơn hàng</h1>
        <p className="text-zinc-400 mb-8">Nhập mã đơn hàng (VD: ORD-XYZ) của bạn để kiểm tra tình trạng vận chuyển.</p>

        <div className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="VD: ORD-XYZ123" 
              className="w-full bg-[#111111] border border-zinc-800 rounded-lg pl-12 pr-4 py-4 text-zinc-100 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 uppercase font-mono tracking-wider transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={() => handleSearch()}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-8 py-4 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-amber-500/20"
          >
            TRA CỨU
          </button>
        </div>

        {/* Lịch sử mua hàng tự động (My Orders) */}
        {!order && myOrders.length > 0 && (
          <div className="mb-10 animate-in fade-in">
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-amber-500" /> Đơn hàng gần đây của bạn
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myOrders.map((myOrder, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSearch(myOrder.id)}
                  className="bg-[#111111] hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 p-4 rounded-lg flex items-center justify-between text-left transition-all group"
                >
                  <div>
                    <p className="font-mono font-bold text-zinc-200 group-hover:text-amber-500 transition-colors">{myOrder.id}</p>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(myOrder.createdAt).toLocaleDateString('vi-VN')} • {myOrder.items.length} SP</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      myOrder.status === 'Chờ xử lý' ? 'bg-amber-500/10 text-amber-500' :
                      myOrder.status === 'Đang giao' ? 'bg-blue-500/10 text-blue-500' :
                      myOrder.status === 'Hoàn tất' ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>{myOrder.status}</p>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {searched && !order && (
          <div className="bg-[#111111] border border-zinc-800 p-8 rounded-lg text-center animate-in fade-in">
            <p className="text-zinc-400">Không tìm thấy đơn hàng với mã <span className="text-amber-500 font-bold tracking-widest">{searchInput}</span></p>
          </div>
        )}

        {order && (
          <div className="bg-[#111111] border border-zinc-800 p-8 rounded-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-zinc-800/50 pb-6">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Mã Đơn</p>
                <h2 className="text-2xl font-mono font-black text-zinc-50 tracking-wider">{order.id}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Trạng Thái</p>
                <p className={`text-xl font-black tracking-wide uppercase ${getStatusColor(order.status)}`}>{order.status}</p>
              </div>
            </div>

            {/* Tracking Button for GHN */}
            {order.trackingCode && order.status === 'Đang giao' && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div>
                  <p className="text-sm font-bold text-blue-400 mb-1">Đơn hàng đang được giao bởi Giao Hàng Nhanh (GHN)</p>
                  <p className="text-xs text-blue-500/70 uppercase font-semibold tracking-wider">Mã vận đơn: <span className="font-mono text-zinc-300 font-black">{order.trackingCode}</span></p>
                </div>
                <a 
                  href={`https://donhang.ghn.vn/?order_code=${order.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded text-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0 shadow-lg shadow-blue-500/20 hover:scale-105"
                >
                  <Truck className="w-4 h-4" />
                  Xem trên GHN <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" /> Sản phẩm
                </h3>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-950 p-2 rounded border border-zinc-800/50">
                      <div className="w-12 h-12 bg-zinc-900 rounded overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-300 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-zinc-500">SL: {item.quantity} x {item.price.toLocaleString('vi-VN')} đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" /> Thông tin nhận hàng
                </h3>
                <div className="bg-zinc-950 p-4 rounded border border-zinc-800 space-y-2 text-sm text-zinc-400">
                  <p><span className="text-zinc-500">Người nhận:</span> <strong className="text-zinc-200">{order.customerInfo.name}</strong></p>
                  <p><span className="text-zinc-500">SĐT:</span> <strong className="text-zinc-200">{order.customerInfo.phone}</strong></p>
                  <p><span className="text-zinc-500">Địa chỉ:</span> <strong className="text-zinc-200">{order.customerInfo.address}</strong></p>
                  <div className="pt-2 mt-2 border-t border-zinc-800 flex justify-between">
                    <span className="text-zinc-500 uppercase tracking-wider text-xs">Tổng thanh toán:</span>
                    <strong className="text-amber-500 text-lg">{order.totalAmount.toLocaleString('vi-VN')} đ</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <TrackContent />
    </Suspense>
  );
}
