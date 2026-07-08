'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/atoms/Button';
import { FormattedPrice } from '@/components/atoms/FormattedPrice';
import { useTranslation } from '@/context/LanguageContext';
import { ShoppingBag, ChevronDown, ChevronUp, Play, X, BadgeCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface MockProduct {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  price: number;
  description: string;
  imageUrl: string;
  hoverImageUrl: string;
  attributes: Record<string, string>;
}

// Consistent color variant mapping
const colorImageMap: Record<string, Record<string, { primary: string; secondary: string }>> = {
  'bomber-luxury-gold': {
    'Đen': {
      primary: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80'
    },
    'Xám Carbon': {
      primary: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80'
    },
    'Vàng Gold': {
      primary: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1620012253295-c05518e99309?w=600&auto=format&fit=crop&q=80'
    }
  },
  'sneaker-ultralight-carbon': {
    'Đỏ': {
      primary: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80'
    },
    'Xanh': {
      primary: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80'
    },
    'Đen': {
      primary: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&auto=format&fit=crop&q=80'
    }
  },
  'wallet-saffiano-black': {
    'Đen': {
      primary: 'https://images.unsplash.com/photo-1627124765135-56c33fc3ae1f?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1524498250077-390f9e378fc0?w=600&auto=format&fit=crop&q=80'
    },
    'Nâu Vàng': {
      primary: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80'
    }
  },
  'polo-bamboo-regular': {
    'Trắng': {
      primary: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80'
    }
  },
  'jean-denim-slim': {
    'Xanh Jeans': {
      primary: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80'
    }
  },
  'tshirt-cotton-compact': {
    'Trắng': {
      primary: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      secondary: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80'
    }
  }
};

export default function ProductDetails({ product }: { product: MockProduct }) {
  const { t, language } = useTranslation();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const colorsList = useMemo(() => {
    const map = colorImageMap[product.slug];
    return map ? Object.keys(map) : ['Đen'];
  }, [product]);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(colorsList[0]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [fade, setFade] = useState(true);

  // Dynamic pricing calculations
  const extraSizePrice = selectedSize === 'L' ? 50000 : selectedSize === 'XL' ? 100000 : 0;
  const extraColorPrice = (selectedColor.includes('Vàng') || selectedColor.includes('Bạc')) ? 200000 : 0;
  const displayPrice = product.price + extraSizePrice + extraColorPrice;

  useEffect(() => {
    setSelectedColor(colorsList[0]);
  }, [colorsList]);

  const variantImages = useMemo(() => {
    const map = colorImageMap[product.slug];
    if (map && map[selectedColor]) {
      return [map[selectedColor].primary, map[selectedColor].secondary];
    }
    return [product.imageUrl, product.hoverImageUrl];
  }, [product, selectedColor]);

  const [activeImage, setActiveImage] = useState(variantImages[0]);

  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => {
      setActiveImage(variantImages[0]);
      setFade(true);
    }, 200);
    return () => clearTimeout(timeout);
  }, [variantImages]);

  const [openSection, setOpenSection] = useState<string | null>('desc');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleAddToCart = async (redirect: boolean = false) => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    addToCart({
      variant_id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: `${product.name} (${selectedSize} / ${selectedColor})`,
      sku: `${product.slug.toUpperCase()}-${selectedSize}-${selectedColor}`,
      price: displayPrice,
      image_url: activeImage
    }, quantity);

    setIsAdding(false);

    if (redirect) {
      window.location.href = '/checkout';
    } else {
      showToast(language === 'vi' ? `Đã thêm ${quantity} sản phẩm vào giỏ hàng!` : `Added ${quantity} items to cart!`, 'success');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-zinc-100">
      
      {/* LEFT COLUMN: Gallery */}
      <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
        <div className="flex md:flex-col gap-3 shrink-0">
          {variantImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(img)}
              className={`relative aspect-[3/4] w-20 bg-zinc-900 border rounded overflow-hidden transition-all ${
                activeImage === img ? 'border-amber-500 scale-95 ring-1 ring-amber-500' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Image src={img} alt="Thumbnail" fill className="object-cover" />
            </button>
          ))}
          
          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className="aspect-[3/4] w-20 bg-zinc-950 border border-zinc-800 hover:border-amber-500 rounded flex flex-col items-center justify-center gap-1.5 text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <Play className="h-5 w-5" />
            <span className="text-[8px] font-black uppercase tracking-wider">{language === 'vi' ? 'Xem Video' : 'Play Video'}</span>
          </button>
        </div>

        <div className="relative aspect-[3/4] w-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
          <div className={`w-full h-full relative transition-all duration-300 ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* RIGHT COLUMN: details */}
      <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
        <div className="space-y-2 border-b border-zinc-900 pb-4">
          <p className="text-[10px] font-black tracking-widest text-amber-500 uppercase">{product.brandName}</p>
          <h1 className="text-2xl font-black text-zinc-50 tracking-tight leading-tight">{product.name}</h1>
          <p className="text-[10px] text-zinc-500 font-mono">SKU: {product.slug.toUpperCase()}-{selectedSize}</p>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-zinc-50 transition-all">
            <FormattedPrice value={displayPrice} />
          </span>
          <span className="text-sm text-zinc-500 line-through transition-all">
            {(displayPrice * 1.25).toLocaleString('vi-VN')} đ
          </span>
          <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[10px] font-bold">
            -20% OFF
          </span>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-850 rounded flex items-center gap-3">
          <BadgeCheck className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-black uppercase text-zinc-200">{t('tech.1.title')}</h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">{t('tech.1.desc')}</p>
          </div>
        </div>

        {/* Color Swatch Circles */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">{language === 'vi' ? 'Màu sắc:' : 'Color:'} <span className="text-zinc-200">{selectedColor}</span></label>
          <div className="flex gap-4">
            {colorsList.map((colorName) => {
              const bgClasses: Record<string, string> = {
                'Đen': 'bg-zinc-900 border-zinc-700',
                'Xám Carbon': 'bg-zinc-700 border-zinc-500',
                'Vàng Gold': 'bg-amber-600 border-amber-500',
                'Đỏ': 'bg-red-600 border-red-500',
                'Xanh': 'bg-emerald-600 border-emerald-500',
                'Nâu Vàng': 'bg-amber-800 border-amber-700',
                'Trắng': 'bg-white border-zinc-300',
                'Xanh Jeans': 'bg-blue-800 border-blue-600'
              };
              
              return (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => setSelectedColor(colorName)}
                  className={`h-8 w-8 rounded-full border ${bgClasses[colorName] || 'bg-zinc-800'} relative flex items-center justify-center transition-all ${
                    selectedColor === colorName ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-950 scale-110' : 'hover:scale-105'
                  }`}
                >
                  {selectedColor === colorName && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Square Size buttons */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">{language === 'vi' ? 'Chọn kích thước:' : 'Select Size:'}</label>
            <button type="button" className="text-[10px] text-amber-500 underline uppercase tracking-widest font-black">{language === 'vi' ? 'Bảng quy đổi size' : 'Size Chart'}</button>
          </div>
          <div className="flex gap-3">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-11 w-11 border text-xs font-bold transition-all ${
                  selectedSize === size
                    ? 'border-amber-500 bg-amber-500 text-zinc-950 shadow-md'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity selector */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">{language === 'vi' ? 'Số lượng:' : 'Quantity:'}</label>
          <div className="flex items-center gap-1 border border-zinc-800 bg-zinc-950 w-fit rounded">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="h-10 w-10 text-zinc-400 hover:text-zinc-100 font-bold"
            >
              -
            </button>
            <span className="text-xs font-bold w-8 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(q => q + 1)}
              className="h-10 w-10 text-zinc-400 hover:text-zinc-100 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            type="button"
            onClick={() => handleAddToCart(false)}
            disabled={isAdding}
            className="w-full border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-900 font-bold text-xs uppercase tracking-wider py-4 rounded transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            {language === 'vi' ? 'Thêm Vào Giỏ' : 'Add to Cart'}
          </button>
          
          <button
            type="button"
            onClick={() => handleAddToCart(true)}
            disabled={isAdding}
            className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs uppercase tracking-wider py-4 rounded transition-all flex items-center justify-center"
          >
            {language === 'vi' ? 'Mua Ngay' : 'Buy Now'}
          </button>
        </div>

        {/* Accordions */}
        <div className="border-t border-zinc-900 pt-6 space-y-3 text-sm">
          <div className="border-b border-zinc-900 pb-3">
            <button
              type="button"
              onClick={() => toggleSection('desc')}
              className="w-full flex justify-between items-center text-xs font-bold text-zinc-200 uppercase tracking-wider py-1.5"
            >
              <span>{language === 'vi' ? 'Thông tin sản phẩm' : 'Product Information'}</span>
              {openSection === 'desc' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>
            {openSection === 'desc' && (
              <div className="mt-3 text-xs text-zinc-400 leading-relaxed pl-1">
                {product.description}
                <ul className="mt-3 space-y-1">
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <li key={k}><strong className="text-zinc-300">{k}:</strong> {v}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* POPUP LIGHTBOX VIDEO MODAL */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
          <button
            onClick={() => setIsVideoOpen(false)}
            className="absolute top-6 right-6 p-3 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close video"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="w-full max-w-4xl aspect-video rounded overflow-hidden shadow-2xl relative bg-zinc-950">
            <video
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
              src="https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40401-large.mp4"
            />
          </div>
        </div>
      )}

    </div>
  );
}
