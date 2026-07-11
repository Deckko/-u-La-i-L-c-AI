import { MetadataRoute } from 'next';
import { mockProducts } from '@/data/mockProducts';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const productUrls: MetadataRoute.Sitemap = mockProducts.map((p) => ({
    url: `https://deckko.vn/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: 'https://deckko.vn',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://deckko.vn/checkout',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://deckko.vn/track',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    ...productUrls,
  ];
}
