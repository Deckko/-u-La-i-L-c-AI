import { Metadata } from 'next';
import CheckoutForm from './CheckoutForm';
import { Suspense } from 'react';
import { Header } from '@/components/organisms/Header';

export const metadata: Metadata = {
  title: 'Thanh toán An toàn | DECKKO CLASSIC',
  description: 'Trang đặt hàng an toàn tích hợp thanh toán bảo mật đa nền tảng và kiểm soát tồn kho tự động.',
  robots: 'noindex, nofollow',
};

export default function CheckoutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Trang Thanh Toán An Toàn',
    'description': 'Hoàn tất đơn hàng của bạn qua cổng thanh toán bảo mật mã hóa SSL.',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl space-y-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <Suspense fallback={<CheckoutFormSkeleton />}>
          <CheckoutForm />
        </Suspense>
      </main>
    </div>
  );
}

function CheckoutFormSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
      <div className="md:col-span-2 space-y-6">
        <div className="h-40 bg-zinc-900 rounded-lg border border-zinc-800"></div>
        <div className="h-48 bg-zinc-900 rounded-lg border border-zinc-800"></div>
      </div>
      <div className="h-64 bg-zinc-900 rounded-lg border border-zinc-800"></div>
    </div>
  );
}
