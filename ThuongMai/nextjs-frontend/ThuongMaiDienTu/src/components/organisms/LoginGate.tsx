'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { Lock, Eye, EyeOff } from 'lucide-react';

const STORAGE_KEY = 'deckko_logged_in';

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const status = localStorage.getItem(STORAGE_KEY);
    if (status === 'true') setIsLoggedIn(true);
    setChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    localStorage.setItem(STORAGE_KEY, 'true');
    // Store email for order tracking
    try { localStorage.setItem('deckko_user_email', email.trim().toLowerCase()); } catch { /* ignore */ }
    setIsLoggedIn(true);
  };

  const handleGuest = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsLoggedIn(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" aria-label="Đang tải">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500" />
      </div>
    );
  }

  if (isLoggedIn) return <>{children}</>;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Decorative bg blobs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Language toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-full p-1 z-50">
        <button
          onClick={() => setLanguage('vi')}
          aria-label="Tiếng Việt"
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
            language === 'vi' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >VI</button>
        <button
          onClick={() => setLanguage('en')}
          aria-label="English"
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
            language === 'en' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >EN</button>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 rounded-xl space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <svg className="w-10 h-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-8-4.5v-9L12 3l8 4.5v9L12 21z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5l8 4.5 8-4.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-widest text-zinc-100 uppercase">
            DECKKO <span className="text-amber-500 font-light">CLASSIC</span>
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">{t('login.desc')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full p-3 bg-zinc-950/80 border border-zinc-800 rounded text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
              Mật khẩu
            </label>
            <div className="relative flex items-center">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pr-12 bg-zinc-950/80 border border-zinc-800 rounded text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium" role="alert">{error}</p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-zinc-950 font-black text-xs uppercase tracking-wider py-3.5 rounded-sm transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              {t('login.submit')}
            </button>
          </div>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="absolute bg-zinc-900 px-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {language === 'vi' ? 'hoặc' : 'or'}
          </span>
        </div>

        <button
          onClick={handleGuest}
          className="w-full border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-zinc-100 font-bold text-xs uppercase tracking-wider py-3.5 rounded-sm transition-colors"
        >
          {t('login.guest')}
        </button>

        <p className="text-center text-[10px] text-zinc-600 leading-relaxed">
          {language === 'vi'
            ? 'Demo: Nhập bất kỳ email và mật khẩu hợp lệ để đăng nhập'
            : 'Demo: Enter any valid email and password to sign in'}
        </p>
      </div>
    </div>
  );
}
