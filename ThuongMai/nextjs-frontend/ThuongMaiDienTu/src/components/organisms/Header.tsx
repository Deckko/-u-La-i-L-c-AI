'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { AISidebar } from './AISidebar';
import { useTranslation } from '@/context/LanguageContext';
import type { CartItem } from '@/hooks/useCart';

const NAV_LINKS = [
  { key: 'nav.products', href: '/', label: 'Sản phẩm' },
  { key: 'nav.sale', href: '/#flash-sale-section', label: 'Flash Sale' },
  { key: 'nav.jackets', href: '/?category=áo-khoác', label: 'Áo Khoác' },
  { key: 'nav.tshirts', href: '/?category=áo-thun', label: 'Áo Thun' },
  { key: 'nav.denim', href: '/?category=quần-jeans', label: 'Quần Denim' },
  { key: 'nav.accessories', href: '/?category=phụ-kiện', label: 'Phụ Kiện' },
  { key: 'nav.checkout', href: '/checkout', label: 'Thanh Toán' },
  { key: 'nav.track', href: '/track', label: 'Tra Cứu Đơn', highlight: true },
];

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCount = () => {
    try {
      const saved = localStorage.getItem('deckko_cart');
      if (saved) {
        const items: CartItem[] = JSON.parse(saved);
        setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setCartCount(0);
      }
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('cart-updated', updateCount);
    return () => window.removeEventListener('cart-updated', updateCount);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('deckko_logged_in');
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md transition-colors duration-300">
        <nav
          className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between px-4 md:px-6"
          aria-label="Main Navigation"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="DECKKO Classic Home">
              <svg
                className="w-7 h-7 text-amber-500 group-hover:text-amber-400 transition-colors shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-8-4.5v-9L12 3l8 4.5v9L12 21z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5l8 4.5 8-4.5" />
              </svg>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-black tracking-[0.2em] text-zinc-50 group-hover:text-white transition-colors leading-none">
                  DECKKO
                </span>
                <span className="text-[9px] text-amber-500 font-medium tracking-[0.3em] uppercase mt-0.5">
                  Classic
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden md:flex gap-5 text-[11px] uppercase tracking-wider font-bold text-zinc-400">
              {NAV_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className={`hover:text-amber-400 transition-colors ${
                      link.highlight
                        ? 'text-amber-500 font-black underline decoration-amber-500/30 underline-offset-4'
                        : ''
                    }`}
                  >
                    {t(link.key) || link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Switch */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
              <button
                onClick={() => setLanguage('vi')}
                aria-label="Chuyển sang Tiếng Việt"
                className={`px-2 py-1 rounded-full text-[9px] font-black transition-all ${
                  language === 'vi' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                VI
              </button>
              <button
                onClick={() => setLanguage('en')}
                aria-label="Switch to English"
                className={`px-2 py-1 rounded-full text-[9px] font-black transition-all ${
                  language === 'en' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                EN
              </button>
            </div>

            {/* AI Assistant */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/30 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all font-black text-[10px] tracking-wider"
              aria-label="Mở Trợ lý AI"
              aria-expanded={isSidebarOpen}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden lg:block">{t('nav.ai')}</span>
            </button>

            {/* Cart Icon */}
            <Link
              href="/checkout"
              className="p-2 text-zinc-400 hover:text-zinc-50 transition-colors relative"
              aria-label={`Giỏ hàng${cartCount > 0 ? ` (${cartCount} sản phẩm)` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-[9px] font-black text-zinc-950 flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:block p-2 text-zinc-400 hover:text-red-400 transition-colors"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-900 bg-zinc-950/98 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-md transition-colors ${
                    link.highlight
                      ? 'text-amber-400 bg-amber-500/5'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  {t(link.key) || link.label}
                </Link>
              ))}
              {/* Mobile: language + AI + logout */}
              <div className="pt-3 border-t border-zinc-900 flex items-center gap-3 px-4">
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-0.5">
                  <button
                    onClick={() => setLanguage('vi')}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                      language === 'vi' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400'
                    }`}
                  >VI</button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                      language === 'en' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400'
                    }`}
                  >EN</button>
                </div>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setIsSidebarOpen(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/30 rounded-full bg-amber-500/10 text-amber-400 font-black text-[10px]"
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI
                </button>
                <button
                  onClick={handleLogout}
                  className="ml-auto p-2 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <AISidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};
