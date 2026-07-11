export interface ProductSwatch {
  name: string;
  colorCode: string;
  imageUrl: string;
  hoverImageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  minPrice: number;
  imageUrl: string;
  hoverImageUrl: string;
  sizes: string[];
  swatches: ProductSwatch[];
}

// ─── IMAGE LIBRARY (matched by category) ───────────────────────────────────
// Jackets  : 1551028719, 1617137968, 1604644401, 1551488831, 1611312449
// T-Shirts : 1581655353, 1583743814, 1596755094, 1588359348, 1578587018
// Jeans    : 1541099649, 1602293589, 1624378439, 1584865288, 1552902865
// Shorts   : 1591195853, 1598032895
// Hoodies  : 1556821840, 1509942774, 1620799140
// Sweaters : 1594938298
// Shoes    : 1542291026, 1608231387, 1595950653, 1549298916, 1614252339, 1581852322
// Watches  : 1524805444, 1542496658
// Wallets  : 1588850561, 1563245372, 1601924994
// Bags     : 1553062407, 1622560480, 1590874103, 1547949003
// Sunglss  : 1511499767, 1508296695
// Caps     : 1576871337
// Rings    : 1605100804, 1599643477

export const mockProducts: Product[] = [

  // ── ÁO KHOÁC ─────────────────────────────────────────────────────────────
  {
    id: 'p1',
    name: 'Áo Khoác Bomber Luxury Gold Accent',
    slug: 'bomber-luxury-gold',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 2450000,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80' },
      { name: 'Xám Carbon', colorCode: 'bg-zinc-600', imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p37',
    name: 'Áo Khoác Bomber Vintage',
    slug: 'vintage-bomber',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 2100000,
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Xám', colorCode: 'bg-zinc-500', imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen', colorCode: 'bg-black', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p14',
    name: 'Áo Khoác Gió Windbreaker Thể Thao',
    slug: 'windbreaker-sports-jacket',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 720000,
    imageUrl: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Đen Nhám', colorCode: 'bg-zinc-800', imageUrl: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p53',
    name: 'Áo Khoác Gió Đen Phối Nỉ',
    slug: 'black-fleece-jacket',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 790000,
    imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-black', imageUrl: 'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p29',
    name: 'Áo Khoác Dạ Dáng Dài Nam',
    slug: 'long-wool-coat',
    brandName: 'DECKKO WINTER',
    minPrice: 3450000,
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    sizes: ['L', 'XL'],
    swatches: [
      { name: 'Đen Mờ', colorCode: 'bg-black', imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p50',
    name: 'Áo Khoác Dạ Blazer Classic',
    slug: 'classic-wool-blazer',
    brandName: 'DECKKO FORMAL',
    minPrice: 2750000,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Xám', colorCode: 'bg-gray-500', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── ÁO THUN / ÁO SƠ MI ───────────────────────────────────────────────────
  {
    id: 'p4',
    name: 'Áo Thun Polo Premium Bamboo',
    slug: 'polo-bamboo-regular',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 550000,
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Trắng', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p44',
    name: 'Áo Thun Polo Nam Đa Màu',
    slug: 'multi-polo-tee',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 420000,
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Nâu', colorCode: 'bg-amber-800', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p41',
    name: 'Áo Thun Slogan Retro',
    slug: 'retro-slogan-tee',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 340000,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p6',
    name: 'Áo Sơ Mi Flannel Classic',
    slug: 'flannel-shirt-classic',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Ca-rô Đỏ Đen', colorCode: 'bg-red-800', imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p16',
    name: 'Áo Sơ Mi Trắng Form Rộng Oversize',
    slug: 'white-shirt-oversize',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 590000,
    imageUrl: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Trắng Tinh', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p19',
    name: 'Áo Sơ Mi Nam Tay Ngắn Họa Tiết',
    slug: 'short-sleeve-pattern-shirt',
    brandName: 'DECKKO SUMMER',
    minPrice: 550000,
    imageUrl: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Họa Tiết Biển', colorCode: 'bg-teal-500', imageUrl: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p59',
    name: 'Áo Sơ Mi Lụa Nam Cao Cấp',
    slug: 'silk-button-up',
    brandName: 'DECKKO LUXURY',
    minPrice: 1650000,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Trắng', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p31',
    name: 'Áo Thun Đường Phố Urban Graphic',
    slug: 'urban-graphic-shirt',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 420000,
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1578587018452-892bace03529?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1578587018452-892bace03529?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── ÁO HOODIE / ÁO LEN ───────────────────────────────────────────────────
  {
    id: 'p9',
    name: 'Áo Hoodie Essential Cotton',
    slug: 'hoodie-essential-cotton',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 750000,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Xám Nhạt', colorCode: 'bg-gray-200', imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen Trơn', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p43',
    name: 'Áo Hoodie Fleece Đen',
    slug: 'black-fleece-hoodie',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p12',
    name: 'Áo Len Cổ Lọ Nam Turtleneck Knit',
    slug: 'turtleneck-knit-sweater',
    brandName: 'DECKKO WINTER',
    minPrice: 890000,
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Trắng Kem', colorCode: 'bg-stone-100', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p35',
    name: 'Áo Len Vòng Cổ Dày',
    slug: 'thick-neck-sweater',
    brandName: 'DECKKO WINTER',
    minPrice: 980000,
    imageUrl: 'https://images.unsplash.com/photo-1580331451062-99ff652288d7?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Xám', colorCode: 'bg-gray-500', imageUrl: 'https://images.unsplash.com/photo-1580331451062-99ff652288d7?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p46',
    name: 'Áo Len Hoodie Có Cổ',
    slug: 'hoodie-collar-sweater',
    brandName: 'DECKKO WINTER',
    minPrice: 1190000,
    imageUrl: 'https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Nâu', colorCode: 'bg-amber-900', imageUrl: 'https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── QUẦN DENIM / QUẦN DÀI ─────────────────────────────────────────────────
  {
    id: 'p5',
    name: 'Quần Jeans Denim Slim Fit Premium',
    slug: 'jean-denim-slim',
    brandName: 'DECKKO DENIM',
    minPrice: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=600&auto=format&fit=crop&q=80',
    sizes: ['29', '30', '31', '32'],
    swatches: [
      { name: 'Xanh Navy', colorCode: 'bg-blue-900', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p38',
    name: 'Quần Short Denim Cắt Ngắn',
    slug: 'denim-short',
    brandName: 'DECKKO DENIM',
    minPrice: 560000,
    imageUrl: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    swatches: [
      { name: 'Xanh', colorCode: 'bg-blue-500', imageUrl: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p11',
    name: 'Quần Khaki Chino Smart Casual',
    slug: 'khaki-chino-smart',
    brandName: 'DECKKO ESSENTIALS',
    minPrice: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80',
    sizes: ['29', '30', '31', '32', '34'],
    swatches: [
      { name: 'Màu Be', colorCode: 'bg-orange-100', imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p42',
    name: 'Quần Tây Slim Fit Chino',
    slug: 'slim-fit-chino',
    brandName: 'DECKKO ESSENTIALS',
    minPrice: 780000,
    imageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
    sizes: ['30', '32', '34', '36'],
    swatches: [
      { name: 'Xanh Navy', colorCode: 'bg-blue-900', imageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p20',
    name: 'Quần Jogger Thun Co Giãn Active',
    slug: 'jogger-active-pants',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 620000,
    imageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p32',
    name: 'Quần Jogger Đen Kẻ Sọc',
    slug: 'black-jogger-pants',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 680000,
    imageUrl: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p47',
    name: 'Quần Legging Thể Thao',
    slug: 'sport-leggings',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── QUẦN ĐÙI / SHORTS ─────────────────────────────────────────────────────
  {
    id: 'p17',
    name: 'Quần Đùi Nam Thể Thao Trọng Lượng Nhẹ',
    slug: 'sports-shorts-lightweight',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Xanh Navy', colorCode: 'bg-blue-900', imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p28',
    name: 'Quần Bơi Nam Chống Thấm Nước',
    slug: 'swim-shorts-water-repellent',
    brandName: 'DECKKO SUMMER',
    minPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1562183241-840b8af0721e?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Đỏ San Hô', colorCode: 'bg-red-500', imageUrl: 'https://images.unsplash.com/photo-1562183241-840b8af0721e?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p52',
    name: 'Quần Đùi Nữ Thể Thao Nhẹ',
    slug: 'women-sport-shorts',
    brandName: 'DECKKO SUMMER',
    minPrice: 420000,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    swatches: [
      { name: 'Xanh', colorCode: 'bg-blue-400', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── GIÀY THỂ THAO / SNEAKERS ──────────────────────────────────────────────
  {
    id: 'p2',
    name: 'Sneaker UltraLight Carbon Edition',
    slug: 'sneaker-ultralight-carbon',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 1850000,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
    sizes: ['40', '41', '42', '43'],
    swatches: [
      { name: 'Đỏ', colorCode: 'bg-red-600', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80' },
      { name: 'Trắng', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p34',
    name: 'Giày Thể Thao High Top',
    slug: 'high-top-sneakers',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 1500000,
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    sizes: ['40', '41', '42', '43'],
    swatches: [
      { name: 'Trắng', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p51',
    name: 'Giày Lười Loafer Da Công Nghệ',
    slug: 'tech-loafers',
    brandName: 'DECKKO LUXURY',
    minPrice: 1980000,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80',
    sizes: ['40', '41', '42', '43'],
    swatches: [
      { name: 'Nâu', colorCode: 'bg-amber-800', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── GIÀY TÂY / FORMAL SHOES ───────────────────────────────────────────────
  {
    id: 'p13',
    name: 'Giày Tây Nam Oxford Classic Da Bò',
    slug: 'oxford-classic-leather',
    brandName: 'DECKKO FORMAL',
    minPrice: 2250000,
    imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1614252339460-e1b15aa658a5?w=600&auto=format&fit=crop&q=80',
    sizes: ['40', '41', '42'],
    swatches: [
      { name: 'Nâu Đen', colorCode: 'bg-amber-900', imageUrl: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1614252339460-e1b15aa658a5?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── PHỤ KIỆN: VÍ ─────────────────────────────────────────────────────────
  {
    id: 'p3',
    name: 'Ví Da Nam Saffiano Black Leather',
    slug: 'wallet-saffiano-black',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 950000,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nâu Vàng', colorCode: 'bg-amber-700', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1524498250077-390f9e378fc0?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p33',
    name: 'Ví Da Nữ Petit Chic',
    slug: 'women-purse-chic',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 720000,
    imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Hồng', colorCode: 'bg-pink-500', imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── PHỤ KIỆN: TÚI / BALO ─────────────────────────────────────────────────
  {
    id: 'p15',
    name: 'Balo Da Công Sở Laptop 15 inch',
    slug: 'leather-backpack-office',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 1450000,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Nâu Sáng', colorCode: 'bg-amber-700', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p45',
    name: 'Balo Thể Thao Water Resistant',
    slug: 'water-resistant-backpack',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 1650000,
    imageUrl: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Xanh Rừng', colorCode: 'bg-green-800', imageUrl: 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p18',
    name: 'Túi Đeo Chéo Nam Mini Messenger',
    slug: 'mini-messenger-bag',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Đen Ghi', colorCode: 'bg-gray-800', imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── PHỤ KIỆN: KÍNH MẮT ───────────────────────────────────────────────────
  {
    id: 'p7',
    name: 'Kính Râm Aviator Phân Cực',
    slug: 'sunglasses-aviator-polar',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 1250000,
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Gọng Đen', colorCode: 'bg-black', imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p39',
    name: 'Kính Mắt Tròn Retro',
    slug: 'retro-round-glasses',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 790000,
    imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-black', imageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── PHỤ KIỆN: MŨ ─────────────────────────────────────────────────────────
  {
    id: 'p10',
    name: 'Mũ Lưỡi Trai Classic Snapback',
    slug: 'cap-classic-snapback',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 350000,
    imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-black', imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p36',
    name: 'Mũ Lưỡi Trai Vintage',
    slug: 'vintage-cap',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Nâu', colorCode: 'bg-amber-800', imageUrl: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p56',
    name: 'Khăn Quàng Cổ Wool Đơn Sắc',
    slug: 'wool-scarf',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 210000,
    imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Be', colorCode: 'bg-amber-200', imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── PHỤ KIỆN: ĐỒNG HỒ ────────────────────────────────────────────────────
  {
    id: 'p8',
    name: 'Đồng Hồ Nam Cơ Khí Skeleton',
    slug: 'watch-skeleton-mech',
    brandName: 'DECKKO LUXURY',
    minPrice: 5850000,
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Bạc', colorCode: 'bg-gray-300', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p40',
    name: 'Đồng Hồ Nam Quartz Classic',
    slug: 'quartz-classic-watch',
    brandName: 'DECKKO LUXURY',
    minPrice: 2350000,
    imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── PHỤ KIỆN: NHẪN ───────────────────────────────────────────────────────
  {
    id: 'p30',
    name: 'Nhẫn Nam Bạc Nguyên Khối S925',
    slug: 'silver-ring-s925',
    brandName: 'DECKKO LUXURY',
    minPrice: 1150000,
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f66150ce8?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
    sizes: ['17mm', '18mm', '19mm'],
    swatches: [
      { name: 'Bạc Đánh Bóng', colorCode: 'bg-gray-400', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f66150ce8?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p57',
    name: 'Dây Chuyền Bạc Nam 925',
    slug: 'men-silver-chain',
    brandName: 'DECKKO LUXURY',
    minPrice: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1605100804763-247f66150ce8?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Bạc', colorCode: 'bg-gray-300', imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1605100804763-247f66150ce8?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── BỘ ĐỒ / SET ──────────────────────────────────────────────────────────
  {
    id: 'p55',
    name: 'Bộ Đồ Thể Thao Nam 3 Mảnh',
    slug: 'men-sports-set',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 2150000,
    imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p58',
    name: 'Bộ Đồ Tập Gym 2 Mảnh',
    slug: 'gym-set-two',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 990000,
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Xanh', colorCode: 'bg-blue-500', imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p49',
    name: 'Set Đồ Ngủ Nữ Cotton Cao Cấp',
    slug: 'women-sleepwear-set',
    brandName: 'DECKKO COMFORT',
    minPrice: 620000,
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Xanh Nhạt', colorCode: 'bg-blue-200', imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── HÀNG LUXURY / ĐẦM NỮ ─────────────────────────────────────────────────
  {
    id: 'p48',
    name: 'Áo Đầm Cánh Bướm Nữ Cao Cấp',
    slug: 'butterfly-dress-women',
    brandName: 'DECKKO LUXURY',
    minPrice: 3950000,
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    swatches: [
      { name: 'Hồng', colorCode: 'bg-pink-500', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'p60',
    name: 'Áo Đầm Dạ Hội Vàng Sang Trọng',
    slug: 'golden-evening-dress',
    brandName: 'DECKKO LUXURY',
    minPrice: 7250000,
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    swatches: [
      { name: 'Vàng', colorCode: 'bg-amber-500', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── BỘ ĐỒ THỂ THAO / GYM BỔ SUNG ────────────────────────────────────────
  {
    id: 'p54',
    name: 'Áo Len Đan 3D Cổ Tròn',
    slug: '3d-knit-sweater',
    brandName: 'DECKKO WINTER',
    minPrice: 1080000,
    imageUrl: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Xanh', colorCode: 'bg-blue-600', imageUrl: 'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── ÁO KHOÁC BỔ SUNG ─────────────────────────────────────────────────────
  {
    id: 'np1',
    name: 'Áo Khoác Denim Jean Wash Xanh',
    slug: 'denim-jean-jacket',
    brandName: 'DECKKO DENIM',
    minPrice: 1350000,
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Xanh Wash', colorCode: 'bg-blue-500', imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np2',
    name: 'Áo Blazer Nam Công Sở Slim Fit',
    slug: 'slim-fit-office-blazer',
    brandName: 'DECKKO FORMAL',
    minPrice: 2980000,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80' },
      { name: 'Xám', colorCode: 'bg-gray-500', imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── ÁO THUN / SƠ MI BỔ SUNG ──────────────────────────────────────────────
  {
    id: 'np3',
    name: 'Áo Polo Kẻ Sọc Classic',
    slug: 'stripe-polo-classic',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 480000,
    imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Trắng Sọc', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np4',
    name: 'Áo Tank Top Thể Thao Dry-Fit',
    slug: 'dry-fit-tank-top',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 280000,
    imageUrl: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80' },
      { name: 'Xanh', colorCode: 'bg-blue-600', imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np5',
    name: 'Áo Sơ Mi Kẻ Ô Ca-rô Nam',
    slug: 'men-plaid-shirt',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 620000,
    imageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    swatches: [
      { name: 'Xanh Đen', colorCode: 'bg-blue-900', imageUrl: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np6',
    name: 'Áo Croptop Nữ Cotton Fashion',
    slug: 'women-crop-top',
    brandName: 'DECKKO SUMMER',
    minPrice: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1485218126466-34e19c4bf0f7?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    swatches: [
      { name: 'Trắng', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1485218126466-34e19c4bf0f7?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1485218126466-34e19c4bf0f7?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np7',
    name: 'Áo Cardigan Nữ Len Mỏng Casual',
    slug: 'women-knit-cardigan',
    brandName: 'DECKKO WINTER',
    minPrice: 750000,
    imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    swatches: [
      { name: 'Kem', colorCode: 'bg-amber-100', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── QUẦN BỔ SUNG ─────────────────────────────────────────────────────────
  {
    id: 'np8',
    name: 'Quần Cargo Multi-Pocket Nam',
    slug: 'cargo-multi-pocket',
    brandName: 'DECKKO STREETWEAR',
    minPrice: 820000,
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
    sizes: ['30', '32', '34', '36'],
    swatches: [
      { name: 'Olive', colorCode: 'bg-olive-600', imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np9',
    name: 'Quần Wide Leg Nữ Ống Rộng',
    slug: 'women-wide-leg-pants',
    brandName: 'DECKKO ESSENTIALS',
    minPrice: 890000,
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80',
    sizes: ['XS', 'S', 'M', 'L'],
    swatches: [
      { name: 'Trắng', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1584865288642-42078afe6942?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── GIÀY BỔ SUNG ─────────────────────────────────────────────────────────
  {
    id: 'np10',
    name: 'Giày Chelsea Boot Nam Da Thật',
    slug: 'chelsea-boot-men',
    brandName: 'DECKKO FORMAL',
    minPrice: 2650000,
    imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1614252339460-e1b15aa658a5?w=600&auto=format&fit=crop&q=80',
    sizes: ['40', '41', '42', '43', '44'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1614252339460-e1b15aa658a5?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nâu', colorCode: 'bg-amber-800', imageUrl: 'https://images.unsplash.com/photo-1614252339460-e1b15aa658a5?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np11',
    name: 'Dép Sandal Thể Thao Unisex',
    slug: 'sport-sandal-unisex',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 450000,
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    sizes: ['38', '39', '40', '41', '42'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np12',
    name: 'Dép Slides Premium Unisex',
    slug: 'premium-slides-unisex',
    brandName: 'DECKKO PERFORMANCE',
    minPrice: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
    sizes: ['38', '39', '40', '41', '42'],
    swatches: [
      { name: 'Trắng', colorCode: 'bg-white', imageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np13',
    name: 'Giày Cao Gót Nữ Thanh Lịch',
    slug: 'women-stiletto-heels',
    brandName: 'DECKKO LUXURY',
    minPrice: 1850000,
    imageUrl: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
    sizes: ['36', '37', '38', '39'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nude', colorCode: 'bg-amber-200', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── TÚI / HÀNH LÝ BỔ SUNG ────────────────────────────────────────────────
  {
    id: 'np14',
    name: 'Túi Tote Canvas Hàng Ngày',
    slug: 'canvas-tote-daily',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 520000,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Be', colorCode: 'bg-amber-100', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np15',
    name: 'Túi Clutch Da Nữ Dự Tiệc',
    slug: 'women-clutch-party',
    brandName: 'DECKKO LUXURY',
    minPrice: 980000,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80' },
      { name: 'Vàng Kim', colorCode: 'bg-amber-400', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80' }
    ]
  },

  // ── PHỤ KIỆN BỔ SUNG ─────────────────────────────────────────────────────
  {
    id: 'np16',
    name: 'Thắt Lưng Da Nam Automatic Buckle',
    slug: 'men-leather-belt-auto',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 650000,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    sizes: ['90cm', '95cm', '100cm', '105cm'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nâu', colorCode: 'bg-amber-800', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np17',
    name: 'Vòng Tay Da Nam Handmade',
    slug: 'men-leather-bracelet',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 290000,
    imageUrl: 'https://images.unsplash.com/photo-1573408301185-9519f7ec8d79?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Nâu Da', colorCode: 'bg-amber-700', imageUrl: 'https://images.unsplash.com/photo-1573408301185-9519f7ec8d79?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np18',
    name: 'Mũ Bucket Hat Unisex Premium',
    slug: 'bucket-hat-unisex',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 320000,
    imageUrl: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80',
    sizes: ['FREE'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80' },
      { name: 'Kem', colorCode: 'bg-amber-100', imageUrl: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np19',
    name: 'Găng Tay Da Nam Mùa Đông',
    slug: 'men-winter-leather-gloves',
    brandName: 'DECKKO ACCESSORIES',
    minPrice: 580000,
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nâu', colorCode: 'bg-amber-800', imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'np20',
    name: 'Áo Vest Dạ Nam Cao Cấp',
    slug: 'men-wool-suit-vest',
    brandName: 'DECKKO FORMAL',
    minPrice: 1580000,
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
    hoverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    swatches: [
      { name: 'Đen', colorCode: 'bg-zinc-900', imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80' },
      { name: 'Xám Đậm', colorCode: 'bg-gray-700', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', hoverImageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80' }
    ]
  }
];
