'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutFormSchema, CheckoutFormData } from './types';
import { Button } from '@/components/atoms/Button';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useTranslation } from '@/context/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingCart, Percent } from 'lucide-react';

export default function CheckoutForm() {
  const { t } = useTranslation();
  const { cartItems: items, updateQuantity, clearCart } = useCart();
  const { createOrder } = useOrders();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const clientGeneratedIdempotencyKey = useMemo(() => {
    return `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      idempotency_key: clientGeneratedIdempotencyKey,
      payment_method: 'VietQR',
    },
  });

  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapLocation, setMapLocation] = useState('106.69089,10.77196,106.71181,10.78310');

  const shippingAddress = watch('shipping_address');
  const paymentMethod = watch('payment_method');

  useEffect(() => {
    if (!shippingAddress || shippingAddress.length < 5) {
      setAddressSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(shippingAddress)}&format=json&addressdetails=1&countrycodes=vn&limit=5`);
        const data = await res.json();
        if (data && data.length > 0) {
          setAddressSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching address:', err);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [shippingAddress]);

  const handleSelectAddress = (suggestion: any) => {
    setValue('shipping_address', suggestion.display_name, { shouldValidate: true });
    setShowSuggestions(false);
    if (suggestion.boundingbox) {
      const [latMin, latMax, lonMin, lonMax] = suggestion.boundingbox;
      setMapLocation(`${lonMin},${latMin},${lonMax},${latMax}`);
    }
  };

  const shippingFee = useMemo(() => {
    const baseShippingFee = subtotal > 1500000 ? 0 : 30000;
    return paymentMethod === 'COD' ? baseShippingFee + 20000 : baseShippingFee;
  }, [subtotal, paymentMethod]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal + shippingFee - appliedDiscount);
  }, [subtotal, shippingFee, appliedDiscount]);

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'LUXURY50') {
      setAppliedDiscount(50000);
      setCouponError('');
      alert('Áp dụng mã giảm giá LUXURY50 thành công: Giảm 50.000 đ');
    } else {
      setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const orderId = createOrder({
      customerInfo: {
        name: data.full_name,
        email: data.email || 'guest@deckko.com',
        phone: data.phone,
        address: data.shipping_address,
      },
      items: items,
      totalAmount: totalAmount,
      paymentMethod: data.payment_method,
    });

    clearCart();
    window.location.href = `/checkout/success?orderId=${orderId}`;
  };

  if (items.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center space-y-6 max-w-lg mx-auto text-zinc-100">
        <div className="mx-auto h-16 w-16 bg-zinc-850 border border-zinc-800 rounded-full flex items-center justify-center text-amber-500">
          <ShoppingCart className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{t('cart.empty')}</h2>
          <p className="text-sm text-zinc-400">{t('cart.empty.desc')}</p>
        </div>
        <Link href="/" className="inline-block bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold px-6 py-3 rounded-md transition-colors text-sm">
          {t('cart.back')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-zinc-100 items-start">
      
      {/* LEFT COLUMN: Shipping & Billing Forms */}
      <div className="lg:col-span-7 space-y-8">
        <h1 className="text-3xl font-black text-zinc-50 tracking-wide">{t('checkout.title')}</h1>
        
        {/* Contact information form */}
        <section className="bg-zinc-900 p-6 rounded border border-zinc-850 space-y-4" aria-labelledby="shipping-heading">
          <h2 id="shipping-heading" className="text-lg font-bold text-zinc-100 uppercase tracking-wider">{t('checkout.shipping')}</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="fullname" className="text-xs font-semibold text-zinc-400">{t('checkout.fullname')}</label>
                <input
                  id="fullname"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-amber-500/50"
                  {...register('full_name')}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-zinc-400">{t('checkout.phone')}</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-amber-500/50"
                  {...register('phone')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="shipping_address" className="text-xs font-semibold text-zinc-400">{t('checkout.address')}</label>
              
              {/* OpenStreetMap Mini Map */}
              <div className="w-full h-40 bg-zinc-950 rounded border border-zinc-800 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(mapLocation)}&layer=mapnik`}
                  className="absolute inset-0 z-0 opacity-70"
                />
                <div className="absolute top-2 right-2 z-10 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800 text-[10px] text-zinc-300 backdrop-blur">
                  Xác nhận vị trí
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="shipping_address"
                  className={`w-full p-3 bg-zinc-950 border rounded text-sm outline-none focus:ring-1 focus:ring-amber-500/50 text-zinc-100 ${errors.shipping_address ? 'border-red-500' : 'border-zinc-800'}`}
                  rows={3}
                  placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                  {...register('shipping_address')}
                  onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {showSuggestions && addressSuggestions.length > 0 && (
                  <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded shadow-2xl max-h-48 overflow-y-auto">
                    {addressSuggestions.map((item, idx) => (
                      <li 
                        key={idx}
                        className="px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 cursor-pointer border-b border-zinc-800 last:border-0 leading-relaxed"
                        onMouseDown={() => handleSelectAddress(item)}
                      >
                        {item.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.shipping_address && (
                <p role="alert" className="text-sm text-red-500 font-semibold">{errors.shipping_address.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Payment options */}
        <section className="bg-zinc-900 p-6 rounded border border-zinc-850 space-y-4" aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-lg font-bold text-zinc-100 uppercase tracking-wider">{t('checkout.payment')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'VietQR', title: 'Chuyển khoản VietQR' },
              { id: 'MoMo', title: 'Ví điện tử MoMo' },
              { id: 'VNPAY', title: 'Cổng VNPAY' },
              { id: 'Stripe', title: 'Thẻ Quốc tế (Stripe)' },
              { id: 'COD', title: 'Thanh toán khi nhận hàng (COD)' }
            ].map((method) => (
              <label key={method.id} className="flex items-center p-4 border border-zinc-800 bg-zinc-950 rounded cursor-pointer hover:bg-zinc-900/50 transition-colors">
                <input
                  type="radio"
                  value={method.id}
                  className="mr-3 accent-amber-500"
                  {...register('payment_method')}
                />
                <span className="text-xs font-bold text-zinc-200">{method.title}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Summary Box */}
      <aside className="lg:col-span-5 bg-zinc-900 border border-zinc-850 p-6 rounded space-y-6 lg:sticky lg:top-24">
        <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wider border-b border-zinc-850 pb-3">{t('checkout.summary')}</h3>

        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.variant_id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-12 bg-zinc-950 rounded border border-zinc-800 overflow-hidden shrink-0">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-zinc-800 text-[10px] text-zinc-300 font-bold border border-zinc-700 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-200 line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono">{item.sku}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateQuantity(item.variant_id, item.quantity - 1)} className="text-[10px] text-zinc-400 hover:text-zinc-200">-</button>
                    <button type="button" onClick={() => updateQuantity(item.variant_id, item.quantity + 1)} className="text-[10px] text-zinc-400 hover:text-zinc-200">+</button>
                    <button type="button" onClick={() => updateQuantity(item.variant_id, 0)} className="text-[10px] text-red-500 hover:text-red-400 ml-2">Xóa</button>
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-zinc-100">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
            </div>
          ))}
        </div>

        {/* Promo code entry */}
        <div className="border-t border-b border-zinc-850 py-4 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder={t('checkout.coupon')}
              className="flex-1 p-2.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 outline-none focus:border-zinc-700"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 hover:text-white rounded text-xs font-bold transition-all uppercase tracking-wider"
            >
              {t('checkout.apply')}
            </button>
          </div>
          {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
          {appliedDiscount > 0 && (
            <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Percent className="h-3 w-3" /> Đã giảm {appliedDiscount.toLocaleString('vi-VN')} đ
            </p>
          )}
        </div>

        {/* Calculation block */}
        <div className="space-y-2 border-b border-zinc-850 pb-4 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>{t('checkout.subtotal')}</span>
            <span className="font-semibold text-zinc-200">{subtotal.toLocaleString('vi-VN')} đ</span>
          </div>
          <div className="flex justify-between">
            <span>{t('checkout.shipping_fee')}</span>
            <span className="font-semibold text-zinc-200">{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}</span>
          </div>
          {appliedDiscount > 0 && (
            <div className="flex justify-between text-emerald-500 font-semibold">
              <span>Mã giảm giá:</span>
              <span>-{appliedDiscount.toLocaleString('vi-VN')} đ</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-baseline text-zinc-50 pt-2">
          <span className="text-sm font-bold uppercase tracking-wider">{t('checkout.total')}</span>
          <span className="text-2xl font-black text-amber-500">{totalAmount.toLocaleString('vi-VN')} đ</span>
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="w-full bg-amber-500 text-zinc-950 hover:bg-amber-600 font-bold focus:ring-amber-500 py-4 rounded text-xs uppercase tracking-wider transition-colors"
        >
          {t('checkout.submit')}
        </Button>
      </aside>
    </form>
  );
}
