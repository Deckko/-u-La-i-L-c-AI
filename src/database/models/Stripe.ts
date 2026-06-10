import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Premium Guild Model
export interface IPremiumGuild extends Document {
  guildId: string;
  subscriptionId: string;
  status: 'active' | 'past_due' | 'canceled';
  expiresAt: Date;
}

const PremiumGuildSchema = new Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    subscriptionId: { type: String, required: true },
    status: { type: String, enum: ['active', 'past_due', 'canceled'], default: 'active' },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export const PremiumGuild: Model<IPremiumGuild> = mongoose.models.PremiumGuild || mongoose.model<IPremiumGuild>('PremiumGuild', PremiumGuildSchema);

// 2. Subscription Model
export interface ISubscription extends Document {
  subscriptionId: string;
  customerId: string;
  guildId: string;
  planId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

const SubscriptionSchema = new Schema(
  {
    subscriptionId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true },
    guildId: { type: String, required: true },
    planId: { type: String, required: true },
    status: { type: String, enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid'], required: true },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

// 3. Invoice Model
export interface IInvoice extends Document {
  invoiceId: string;
  subscriptionId: string;
  customerId: string;
  amountPaid: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  hostedInvoiceUrl?: string;
}

const InvoiceSchema = new Schema(
  {
    invoiceId: { type: String, required: true, unique: true, index: true },
    subscriptionId: { type: String, required: true },
    customerId: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['paid', 'open', 'void', 'uncollectible'], required: true },
    hostedInvoiceUrl: { type: String }
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

// 4. Payment History Model
export interface IPaymentHistory extends Document {
  paymentId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  provider: 'stripe' | 'paypal' | 'momo';
}

const PaymentHistorySchema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['succeeded', 'pending', 'failed'], required: true },
    provider: { type: String, enum: ['stripe', 'paypal', 'momo'], required: true }
  },
  { timestamps: true }
);

export const PaymentHistory: Model<IPaymentHistory> = mongoose.models.PaymentHistory || mongoose.model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);
