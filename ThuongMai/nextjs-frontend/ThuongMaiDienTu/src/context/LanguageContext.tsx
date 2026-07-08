'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    'hero.title': 'TIÊU CHUẨN THỜI TRANG Ý',
    'hero.desc': 'Kiến tạo phong cách may đo chuẩn mực Ý kết hợp công nghệ dệt sợi tự nhiên kháng khuẩn, bảo vệ phom dáng phẳng phiu suốt cả ngày.',
    'hero.cta': 'Xem bộ sưu tập',
    'sale.title': 'FLASH SALE TRONG NGÀY',
    'sale.shipping': 'Miễn phí vận chuyển cho đơn hàng từ 1.500.000 đ',
    'tech.1.title': 'SỢI TRE TỰ NHIÊN (BAMBOO)',
    'tech.1.desc': 'Thoáng khí gấp 3 lần cotton, khả năng kháng khuẩn tự nhiên vượt trội.',
    'tech.2.title': 'ĐỘ BỀN MÀU NÂNG CAO',
    'tech.2.desc': 'Công nghệ nhuộm khóa sợi chống phai màu khi giặt và giữ nguyên phom dáng.',
    'tech.3.title': 'THIẾT KẾ PHOM DÁNG Ý',
    'tech.3.desc': 'Đường may 3 kim tỉ mỉ, tôn dáng người mặc và chống nhăn tối ưu.',
    'cat.title': 'DANH MỤC THỜI TRANG',
    'cat.desc': 'Khám phá các dòng sản phẩm chọn lọc',
    'products.title': 'SẢN PHẨM KHUYÊN DÙNG',
    'products.desc': 'Gợi ý sản phẩm thông minh cá nhân hóa',
    'nav.products': 'Sản phẩm',
    'nav.sale': 'Flash Sale',
    'nav.jackets': 'Áo Khoác',
    'nav.tshirts': 'Áo Thun',
    'nav.denim': 'Quần Denim',
    'nav.accessories': 'Phụ kiện',
    'nav.checkout': 'Thanh toán',
    'nav.track': 'Tra Cứu Đơn',
    'nav.ai': 'TRỢ LÝ AI',
    'cart.empty': 'Giỏ hàng của bạn đang trống',
    'cart.empty.desc': 'Hãy chọn sản phẩm bạn yêu thích từ bộ sưu tập của chúng tôi.',
    'cart.back': 'Quay lại Trang Chủ',
    'checkout.title': 'Thanh Toán Đơn Hàng',
    'checkout.shipping': 'Thông tin giao hàng',
    'checkout.fullname': 'Họ và tên *',
    'checkout.phone': 'Số điện thoại *',
    'checkout.address': 'Địa chỉ nhận hàng chi tiết *',
    'checkout.payment': 'Phương thức thanh toán',
    'checkout.summary': 'Đơn hàng của bạn',
    'checkout.coupon': 'Mã giảm giá (ví dụ: LUXURY50)',
    'checkout.apply': 'Áp dụng',
    'checkout.subtotal': 'Tạm tính:',
    'checkout.shipping_fee': 'Phí vận chuyển:',
    'checkout.total': 'Tổng thanh toán:',
    'checkout.submit': 'Xác Nhận Đặt Hàng',
    'login.title': 'ĐĂNG NHẬP HỆ THỐNG',
    'login.desc': 'Đăng nhập để nhận ưu đãi cá nhân hóa và tích điểm thành viên.',
    'login.guest': 'Duyệt với tư cách Khách',
    'login.submit': 'Đăng Nhập',
    'ai.title': 'Trợ Lý Mua Sắm AI',
    'ai.placeholder': 'Hỏi về size, chất liệu, khuyến mãi...',
  },
  en: {
    'hero.title': 'ITALIAN TAILORING STANDARDS',
    'hero.desc': 'Defining Italian tailoring standards blended with natural antibacterial fabric technology, keeping your silhouette clean all day long.',
    'hero.cta': 'Shop the Collection',
    'sale.title': 'FLASH SALE OF THE DAY',
    'sale.shipping': 'Free shipping on orders above 1,500,000 VND',
    'tech.1.title': 'NATURAL BAMBOO FIBER',
    'tech.1.desc': '3x more breathable than regular cotton with natural antibacterial properties.',
    'tech.2.title': 'FIBER LOCK COLOR TECHNOLOGY',
    'tech.2.desc': 'Advanced dye locking process prevents fading and retains shirt structure.',
    'tech.3.title': 'ITALIAN ERGONOMIC FIT',
    'tech.3.desc': 'Meticulous 3-needle stitching contours the body and limits wrinkling.',
    'cat.title': 'FASHION CATEGORIES',
    'cat.desc': 'Discover our curated selections',
    'products.title': 'RECOMMENDED FOR YOU',
    'products.desc': 'Personalized AI recommendations',
    'nav.products': 'Products',
    'nav.sale': 'Flash Sale',
    'nav.jackets': 'Jackets',
    'nav.tshirts': 'T-Shirts',
    'nav.denim': 'Denim',
    'nav.accessories': 'Accessories',
    'nav.checkout': 'Checkout',
    'nav.track': 'Track Order',
    'nav.ai': 'AI ASSISTANT',
    'cart.empty': 'Your shopping cart is empty',
    'cart.empty.desc': 'Please select your favorite pieces from our curated collections.',
    'cart.back': 'Back to Home',
    'checkout.title': 'Order Checkout',
    'checkout.shipping': 'Shipping Information',
    'checkout.fullname': 'Full Name *',
    'checkout.phone': 'Phone Number *',
    'checkout.address': 'Detailed Address *',
    'checkout.payment': 'Payment Methods',
    'checkout.summary': 'Your Order Summary',
    'checkout.coupon': 'Discount Code (try: LUXURY50)',
    'checkout.apply': 'Apply',
    'checkout.subtotal': 'Subtotal:',
    'checkout.shipping_fee': 'Shipping:',
    'checkout.total': 'Total Due:',
    'checkout.submit': 'Confirm Checkout',
    'login.title': 'LUXURY SIGN IN',
    'login.desc': 'Login to receive personalized recommendations and tracking.',
    'login.guest': 'Continue as Guest',
    'login.submit': 'Sign In',
    'ai.title': 'AI Shopping Assistant',
    'ai.placeholder': 'Ask about sizes, fabrics, discounts...',
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('deckko_lang') as Language;
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('deckko_lang', lang);
    window.dispatchEvent(new Event('lang-changed'));
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
