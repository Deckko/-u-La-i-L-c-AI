'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Image as ImageIcon, Video, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import type { AdminProduct } from '@/hooks/useProducts';

type Product = AdminProduct;


export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    video: ''
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', category: '', image: '', video: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      price: (p.minPrice || 0).toString(),
      category: p.brandName || '',
      image: p.imageUrl || '',
      video: p.video || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(formData.price.replace(/\D/g, '')) || 0;
    
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        minPrice: priceNum,
        brandName: formData.category,
        imageUrl: formData.image,
        video: formData.video
      });
    } else {
      const newProduct: any = {
        id: 'PROD-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/ /g, '-'),
        minPrice: priceNum,
        brandName: formData.category,
        imageUrl: formData.image,
        hoverImageUrl: formData.image,
        sizes: ['S', 'M', 'L', 'XL'],
        swatches: [],
        video: formData.video
      };
      addProduct(newProduct);
    }
    setIsModalOpen(false);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-50 tracking-tight uppercase">Kho Sản Phẩm</h1>
          <p className="text-zinc-500 text-sm mt-1">Quản lý kho hàng, cập nhật video KOL, giá bán (Đã đồng bộ Schema).</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Tìm tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#111111] border border-zinc-800 rounded-md pl-9 pr-4 py-2 text-sm text-zinc-100 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 w-64 transition-all"
            />
          </div>
          <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 rounded-md text-sm font-black flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20 hover:scale-105">
            <Plus className="w-4 h-4" /> THÊM SẢN PHẨM
          </button>
        </div>
      </div>

      <div className="bg-[#111111] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-bold">Sản phẩm</th>
              <th className="px-6 py-4 font-bold">Giá bán</th>
              <th className="px-6 py-4 font-bold">Thương hiệu</th>
              <th className="px-6 py-4 font-bold text-center">Media</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-zinc-500">
                  Không tìm thấy sản phẩm nào trong kho.
                </td>
              </tr>
            )}
            {filtered.map((p: Product) => {
              const imageSrc = p.imageUrl || 'https://images.unsplash.com/photo-1550614000-4b95f273b3eb?w=200';
              const priceDisplay = p.minPrice || 0;
              const categoryDisplay = p.brandName || 'DECKKO CLASSIC';

              return (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded overflow-hidden border border-zinc-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageSrc} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-200 group-hover:text-amber-500 transition-colors">{p.name}</p>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-300">
                    {priceDisplay.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider text-amber-500/80">
                      {categoryDisplay}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {p.swatches && p.swatches.length > 0 && <span title="Có màu phụ"><ImageIcon className="w-4 h-4 text-emerald-500" /></span>}
                      {p.video && <span title="Có Video"><Video className="w-4 h-4 text-amber-500" /></span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(p)} className="p-2 hover:bg-zinc-800 hover:text-amber-500 rounded text-zinc-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if(confirm(`Bạn có chắc chắn muốn xóa ${p.name}?`)) deleteProduct(p.id);
                        }} 
                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded text-zinc-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-zinc-800 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50">
              <h2 className="text-xl font-black text-zinc-50 uppercase tracking-widest">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Tên sản phẩm</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500" placeholder="VD: Áo Thun Cổ Lọ Ý" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Giá bán (VND)</label>
                  <input required type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500 font-mono" placeholder="550000" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase">Thương hiệu</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500" placeholder="VD: DECKKO STREETWEAR" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Link Ảnh Cover (URL)</label>
                <input required type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500 font-mono text-[10px]" placeholder="https://unsplash.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Link Video Review (Optional)</label>
                <input type="url" value={formData.video} onChange={e => setFormData({...formData, video: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-amber-500 font-mono text-[10px]" placeholder="https://mixkit.co/..." />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800/50 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded text-sm font-bold text-zinc-400 hover:text-zinc-100 transition-colors">HỦY</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2.5 rounded text-sm font-black transition-colors shadow-lg shadow-amber-500/20">LƯU SẢN PHẨM</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
