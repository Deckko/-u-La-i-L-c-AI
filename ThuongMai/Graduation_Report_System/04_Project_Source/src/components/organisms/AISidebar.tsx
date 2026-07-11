'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { useTranslation } from '@/context/LanguageContext';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  productContext?: string;
}

export const AISidebar: React.FC<AISidebarProps> = ({
  isOpen,
  onClose,
  productContext = 'Trang chủ Catalog',
}) => {
  const { t } = useTranslation();
  const { messages, isSending, sendMessage } = useAIChat();
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue, productContext);
    setInputValue('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <aside
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col shadow-2xl transition-transform duration-300"
        role="dialog"
        aria-labelledby="ai-sidebar-title"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 id="ai-sidebar-title" className="text-lg font-bold tracking-wider">{t('ai.title')}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-50 transition-colors" aria-label="Đóng Trợ lý AI">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-2 bg-zinc-900/50 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span>Context: <strong className="text-amber-500 font-semibold">{productContext}</strong></span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-600 text-white rounded-br-none'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
                }`}
              >
                {msg.content || (
                  <span className="flex items-center gap-1 opacity-70 text-[10px]">
                    <span className="animate-bounce inline-block w-1 h-1 bg-current rounded-full" style={{ animationDelay: '0ms' }}></span>
                    <span className="animate-bounce inline-block w-1 h-1 bg-current rounded-full" style={{ animationDelay: '150ms' }}></span>
                    <span className="animate-bounce inline-block w-1 h-1 bg-current rounded-full" style={{ animationDelay: '300ms' }}></span>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 border-t border-zinc-800 bg-zinc-950">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t('ai.placeholder')}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3.5 pl-4 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending}
              className="absolute right-2 p-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-full disabled:opacity-50 transition-colors"
              aria-label="Gửi câu hỏi"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
};
