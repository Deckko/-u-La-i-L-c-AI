import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import LoginGate from '@/components/organisms/LoginGate';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/atoms/ErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DECKKO CLASSIC — Thời Trang Cao Cấp Tích Hợp AI',
    template: '%s | DECKKO CLASSIC',
  },
  description:
    'Trải nghiệm mua sắm thời trang cao cấp tích hợp trí tuệ nhân tạo. Sản phẩm chất liệu Bamboo, Denim, Da thật — chuẩn thiết kế Ý.',
  keywords: ['thời trang', 'cao cấp', 'áo khoác', 'jeans', 'phụ kiện', 'DECKKO', 'luxury fashion'],
  authors: [{ name: 'DECKKO Classic' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://deckko.vn',
    siteName: 'DECKKO CLASSIC',
    title: 'DECKKO CLASSIC — Thời Trang Cao Cấp Tích Hợp AI',
    description: 'Trải nghiệm mua sắm thời trang cao cấp tích hợp trí tuệ nhân tạo.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'DECKKO CLASSIC Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DECKKO CLASSIC — Thời Trang Cao Cấp',
    description: 'Trải nghiệm mua sắm thời trang cao cấp tích hợp AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deckko.vn',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <ErrorBoundary>
          <AuthProvider>
            <LanguageProvider>
              <ToastProvider>
                <LoginGate>
                  {children}
                </LoginGate>
              </ToastProvider>
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
