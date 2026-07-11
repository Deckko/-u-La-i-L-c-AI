import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import ProductDetails from './ProductDetails';

interface PageProps {
  params: Promise<{ slug: string }>;
}

import { mockProducts } from '@/data/mockProducts';

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  price: number;
  description: string;
  imageUrl: string;
  hoverImageUrl: string;
  attributes: Record<string, string>;
  sizes: string[];
  swatches: any[];
}

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }));
}

const getProductBySlug = (slug: string): MockProduct | undefined => {
  const product = mockProducts.find(p => p.slug === slug);
  if (!product) return undefined;
  
  return {
    ...product,
    price: product.minPrice,
    description: `Khám phá bộ sưu tập cao cấp ${product.name} từ thương hiệu ${product.brandName}. Chất liệu tinh tuyển mang lại trải nghiệm khác biệt và đẳng cấp.`,
    attributes: { 'Chất liệu': 'Premium Quality', 'Phong cách': 'Modern Classic', 'Phiên bản': 'Giới hạn' },
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: 'Không tìm thấy sản phẩm' };
  }

  return {
    title: `${product.name} | DECKKO AI`,
    description: product.description,
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': product.imageUrl,
    'description': product.description,
    'brand': {
      '@type': 'Brand',
      'name': product.brandName,
    },
    'offers': {
      '@type': 'Offer',
      'price': product.price,
      'priceCurrency': 'VND',
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <ProductDetails product={product} />
      </main>
      
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950/50 text-center text-xs text-zinc-600">
        <p>© 2026 DECKKO STREETWEAR. All rights reserved.</p>
      </footer>
    </div>
  );
}
