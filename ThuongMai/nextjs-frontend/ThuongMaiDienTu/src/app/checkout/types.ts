import { z } from 'zod';

export interface CartItem {
  variant_id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image_url: string;
}

export const checkoutFormSchema = z.object({
  full_name: z.string().min(2, { message: 'Vui lòng nhập họ tên' }),
  phone: z.string().min(10, { message: 'SĐT không hợp lệ' }),
  email: z.string().optional().or(z.literal('')),
  shipping_address: z
    .string()
    .min(10, { message: 'Địa chỉ nhận hàng phải có độ dài tối thiểu 10 ký tự.' })
    .max(500, { message: 'Địa chỉ nhận hàng quá dài.' }),
  payment_method: z.enum(['VietQR', 'MoMo', 'VNPAY', 'Stripe', 'COD'], {
    errorMap: () => ({ message: 'Vui lòng chọn hình thức thanh toán khả dụng.' })
  } as any),
  idempotency_key: z.string(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
