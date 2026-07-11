import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ColorSwatch {
  name: string;
  colorCode: string; // bg-class e.g. 'bg-zinc-900'
  imageUrl: string;
  hoverImageUrl: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  minPrice: number;
  imageUrl: string;
  hoverImageUrl: string;
  sizes: string[];
  swatches?: ColorSwatch[];
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  slug,
  brandName,
  minPrice,
  imageUrl,
  hoverImageUrl,
  sizes,
  swatches = [],
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeImage, setActiveImage] = useState(imageUrl);
  const [activeHoverImage, setActiveHoverImage] = useState(hoverImageUrl);
  const [selectedColor, setSelectedColor] = useState('');

  // Synchronize base images if props change
  useEffect(() => {
    setActiveImage(imageUrl);
    setActiveHoverImage(hoverImageUrl);
  }, [imageUrl, hoverImageUrl]);

  const handleSwatchClick = (swatch: ColorSwatch) => {
    setSelectedColor(swatch.name);
    setActiveImage(swatch.imageUrl);
    setActiveHoverImage(swatch.hoverImageUrl);
  };

  return (
    <article
      className="group relative flex flex-col bg-zinc-950 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Double Hover Swap */}
      <div className="relative aspect-[3/4] w-full bg-zinc-900 border border-zinc-900 overflow-hidden cursor-pointer">
        <Link href={`/products/${slug}`} className="absolute inset-0 block z-10">
          <span className="sr-only">Xem chi tiết {name}</span>
        </Link>
        
        {/* Primary Image */}
        <Image
          src={activeImage}
          alt={`Hình ảnh sản phẩm ${name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-opacity duration-500 ease-in-out ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />

        {/* Hover Swap Image */}
        <Image
          src={activeHoverImage}
          alt={`Chi tiết sản phẩm ${name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-500 ease-in-out scale-100 group-hover:scale-105 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Discount Tag */}
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-amber-500 text-zinc-950 font-black text-[9px] uppercase tracking-wider z-20 rounded-sm">
          -25%
        </div>

        {/* Quick size badge selector overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-zinc-950/95 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 flex flex-col items-center gap-1.5">
          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Kích cỡ sẵn có</p>
          <div className="flex gap-1">
            {sizes.map((size) => (
              <span
                key={size}
                className="h-6 w-6 rounded border border-zinc-800 bg-zinc-950 text-[9px] font-black text-zinc-400 flex items-center justify-center"
              >
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Details & Interactive Swatches */}
      <div className="pt-3 pb-2 space-y-1.5">
        
        {/* Color Swatch Dots */}
        {swatches.length > 0 && (
          <div className="flex gap-2 pt-1 z-25 relative">
            {swatches.map((swatch) => (
              <button
                key={swatch.name}
                type="button"
                onClick={() => handleSwatchClick(swatch)}
                className={`h-4.5 w-4.5 rounded-full border ${swatch.colorCode} relative flex items-center justify-center transition-all ${
                  selectedColor === swatch.name ? 'ring-1 ring-amber-500 scale-110' : 'hover:scale-105 border-zinc-800'
                }`}
                title={swatch.name}
              >
                {selectedColor === swatch.name && (
                  <span className="h-1 w-1 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        )}

        <p className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">{brandName}</p>
        <Link href={`/products/${slug}`} className="block">
          <h3 className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-zinc-100">
            {minPrice.toLocaleString('vi-VN')} đ
          </span>
          <span className="text-[10px] text-zinc-500 line-through">
            {(minPrice * 1.25).toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>
    </article>
  );
};
