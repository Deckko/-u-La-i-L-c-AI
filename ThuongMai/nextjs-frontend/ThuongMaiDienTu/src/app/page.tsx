'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Header } from '@/components/organisms/Header';
import { ProductCard } from '@/components/molecules/ProductCard';
import { useTranslation } from '@/context/LanguageContext';
import { ArrowRight, Flame, ShieldCheck, ChevronDown } from 'lucide-react';
import { mockProducts } from '@/data/mockProducts';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ─── Category filtering config ──────────────────────────────────────────────
type CategoryId = 'áo-thun' | 'quần-jeans' | 'áo-khoác' | 'phụ-kiện';

const CATEGORY_FILTERS: Record<CategoryId, (name: string) => boolean> = {
  'áo-thun': (n) => n.includes('áo thun') || n.includes('polo') || n.includes('sơ mi') || n.includes('tank') || n.includes('croptop') || n.includes('cardigan') || n.includes('len') || n.includes('hoodie'),
  'quần-jeans': (n) => n.includes('quần') || n.includes('jean') || n.includes('chino') || n.includes('denim') || n.includes('jogger') || n.includes('legging') || n.includes('cargo') || n.includes('short') || n.includes('đùi'),
  'áo-khoác': (n) => n.includes('khoác') || n.includes('bomber') || n.includes('blazer') || n.includes('vest') || n.includes('dạ') || n.includes('gió'),
  'phụ-kiện': (n) => n.includes('ví') || n.includes('balo') || n.includes('kính') || n.includes('đồng hồ') || n.includes('mũ') || n.includes('túi') || n.includes('giày') || n.includes('sneaker') || n.includes('dép') || n.includes('cao gót') || n.includes('boot') || n.includes('sandal') || n.includes('nhẫn') || n.includes('dây chuyền') || n.includes('vòng') || n.includes('thắt lưng') || n.includes('găng'),
};

const PRODUCTS_PER_PAGE = 12;

// ─── Timer helpers ───────────────────────────────────────────────────────────
const SESSION_TIMER_KEY = 'deckko_flash_timer';

function getInitialTimer() {
  if (typeof window === 'undefined') return { hours: 2, minutes: 14, seconds: 35 };
  try {
    const saved = sessionStorage.getItem(SESSION_TIMER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as { hours: number; minutes: number; seconds: number; ts: number };
      const elapsed = Math.floor((Date.now() - parsed.ts) / 1000);
      let total = parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds - elapsed;
      if (total > 0) {
        return {
          hours: Math.floor(total / 3600),
          minutes: Math.floor((total % 3600) / 60),
          seconds: total % 60,
        };
      }
    }
  } catch { /* ignore */ }
  return { hours: 2, minutes: 14, seconds: 35 };
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function HomeContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get('category');

  const [timeLeft, setTimeLeft] = useState(getInitialTimer);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Scroll & category from URL param
  useEffect(() => {
    if (categoryParam && categoryParam in CATEGORY_FILTERS) {
      setActiveCategory(categoryParam as CategoryId);
      const el = document.getElementById('products-grid');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, [categoryParam]);

  // Countdown timer — persists across same-session navigation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let next: typeof prev;
        if (prev.seconds > 0) {
          next = { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          next = { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          next = { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
        // Persist to sessionStorage
        try {
          sessionStorage.setItem(SESSION_TIMER_KEY, JSON.stringify({ ...next, ts: Date.now() }));
        } catch { /* ignore */ }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNum = (n: number) => n.toString().padStart(2, '0');

  const handleScrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleCategoryClick = useCallback((id: CategoryId) => {
    setActiveCategory((prev) => (prev === id ? null : id));
    setVisibleCount(PRODUCTS_PER_PAGE);
    handleScrollToSection('products-grid');
  }, [handleScrollToSection]);

  // Dynamic category counts from actual product data
  const categoryCounts = useMemo(() => {
    const result: Record<CategoryId, number> = {
      'áo-thun': 0, 'quần-jeans': 0, 'áo-khoác': 0, 'phụ-kiện': 0,
    };
    for (const p of mockProducts) {
      const n = p.name.toLowerCase();
      for (const [id, fn] of Object.entries(CATEGORY_FILTERS) as [CategoryId, (n: string) => boolean][]) {
        if (fn(n)) { result[id]++; break; }
      }
    }
    return result;
  }, []);

  const categories = useMemo(() => [
    {
      id: 'áo-thun' as CategoryId,
      name: 'ÁO THUN & POLO',
      img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'quần-jeans' as CategoryId,
      name: 'QUẦN DENIM & JEANS',
      img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'áo-khoác' as CategoryId,
      name: 'ÁO KHOÁC LUXURY',
      img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'phụ-kiện' as CategoryId,
      name: 'PHỤ KIỆN CAO CẤP',
      img: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    },
  ], []);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return mockProducts;
    const fn = CATEGORY_FILTERS[activeCategory];
    return mockProducts.filter((p) => fn(p.name.toLowerCase()));
  }, [activeCategory]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const techItems = useMemo(() => [
    { title: t('tech.1.title'), desc: t('tech.1.desc') },
    { title: t('tech.2.title'), desc: t('tech.2.desc') },
    { title: t('tech.3.title'), desc: t('tech.3.desc') },
  ], [t]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header />

      {/* 1. HERO BANNER */}
      <section className="relative w-full aspect-[16/9] max-h-[680px] bg-zinc-950 overflow-hidden flex items-center justify-start" aria-label="Hero Banner">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&auto=format&fit=crop&q=80"
            alt="DECKKO Classic — Italian Fashion Collection 2026"
            fill
            className="object-cover opacity-80"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/40 to-transparent" aria-hidden="true" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 space-y-6">
          <div className="flex items-center gap-2 text-amber-500" aria-hidden="true">
            <span className="text-xs font-black uppercase tracking-[0.3em]">LOOKBOOK CAMPAIGN 2026</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none uppercase text-zinc-50">
            {t('hero.title')}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 max-w-lg leading-relaxed">
            {t('hero.desc')}
          </p>
          <div className="pt-2 flex gap-4">
            <button
              onClick={() => handleScrollToSection('products-grid')}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-sm shadow-lg shadow-amber-500/10"
            >
              {t('hero.cta')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. FLASH SALE */}
      <section id="flash-sale-section" className="bg-zinc-900 border-t border-b border-zinc-800 py-6" aria-label="Flash Sale">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-amber-500 animate-pulse" aria-hidden="true" />
            <h2 className="text-sm font-black tracking-wider uppercase text-zinc-50">{t('sale.title')}</h2>
            <div className="flex gap-1.5 text-xs font-black pl-4" aria-label={`Còn ${formatNum(timeLeft.hours)}:${formatNum(timeLeft.minutes)}:${formatNum(timeLeft.seconds)}`}>
              <span className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2.5 py-1 rounded-sm tabular-nums">{formatNum(timeLeft.hours)}</span>
              <span className="text-zinc-500 self-center" aria-hidden="true">:</span>
              <span className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2.5 py-1 rounded-sm tabular-nums">{formatNum(timeLeft.minutes)}</span>
              <span className="text-zinc-500 self-center" aria-hidden="true">:</span>
              <span className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2.5 py-1 rounded-sm tabular-nums">{formatNum(timeLeft.seconds)}</span>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">{t('sale.shipping')}</span>
        </div>
      </section>

      {/* 3. TECH BADGES */}
      <section className="bg-zinc-950 py-10 border-b border-zinc-900" aria-label="Technology Features">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {techItems.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start p-4 bg-zinc-900/40 border border-zinc-800 rounded-sm">
              <ShieldCheck className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase text-zinc-200">{item.title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CATEGORIES */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16 space-y-8" aria-labelledby="categories-heading">
        <div className="text-center space-y-1">
          <h2 id="categories-heading" className="text-2xl font-black uppercase tracking-widest text-zinc-50">{t('cat.title')}</h2>
          <p className="text-xs text-zinc-500">{t('cat.desc')}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`group relative aspect-[3/4] bg-zinc-900 border overflow-hidden cursor-pointer rounded-sm transition-all duration-300 text-left ${
                activeCategory === cat.id
                  ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
              aria-pressed={activeCategory === cat.id}
              aria-label={`Lọc danh mục ${cat.name} (${categoryCounts[cat.id]} sản phẩm)`}
            >
              <Image
                src={cat.img}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out opacity-60"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" aria-hidden="true" />
              <div className="absolute bottom-4 left-4 space-y-1 z-10">
                <p className="text-xs font-black uppercase tracking-wider text-zinc-100 group-hover:text-amber-400 transition-colors leading-tight">
                  {cat.name}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  {categoryCounts[cat.id]} sản phẩm
                </p>
                {activeCategory === cat.id && (
                  <span className="inline-block text-[9px] font-black text-amber-500 uppercase tracking-wider">
                    ✓ Đang lọc
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {activeCategory && (
          <div className="text-center">
            <button
              onClick={() => { setActiveCategory(null); setVisibleCount(PRODUCTS_PER_PAGE); }}
              className="text-xs text-zinc-500 hover:text-amber-400 transition-colors font-bold uppercase tracking-wider underline underline-offset-4"
            >
              Xóa bộ lọc — Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </section>

      {/* 5. PRODUCTS GRID */}
      <main id="products-grid" className="max-w-7xl mx-auto w-full px-6 pb-24 space-y-10" role="main">
        <div className="border-b border-zinc-900 pb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-zinc-100">{t('products.title')}</h2>
            <p className="text-xs text-zinc-500 mt-1">{t('products.desc')}</p>
          </div>
          <span className="text-xs text-zinc-600 font-bold">
            {filteredProducts.length} sản phẩm
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Load More */}
            {visibleCount < filteredProducts.length && (
              <div className="text-center pt-6">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                  className="inline-flex items-center gap-2 border border-zinc-800 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 px-10 py-3.5 text-xs font-black uppercase tracking-widest transition-all rounded-sm"
                >
                  Xem thêm ({filteredProducts.length - visibleCount} còn lại)
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center text-zinc-500 font-medium">
            Không tìm thấy sản phẩm nào trong danh mục này.
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-12 bg-zinc-950/50 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p className="font-black tracking-widest text-zinc-500 uppercase text-[11px]">DECKKO CLASSIC</p>
          <p>© 2026 DECKKO CLASSIC. All rights reserved.</p>
          <p className="text-zinc-700">Thời trang cao cấp · Tích hợp AI · Chất liệu tự nhiên</p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
