import mongoose, { Schema, Document, Model } from 'mongoose';

export type SuspiciousType = 'abnormal_wealth_growth' | 'circular_transfer' | 'multi_account_link';

export interface ISuspiciousActivity extends Document {
  activityId: string;
  userId: string;
  type: SuspiciousType;
  details: Record<string, any>;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SuspiciousActivitySchema: Schema = new Schema(
  {
    activityId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['abnormal_wealth_growth', 'circular_transfer', 'multi_account_link'], required: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    resolved: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

const SuspiciousActivity: Model<ISuspiciousActivity> = mongoose.models.SuspiciousActivity || mongoose.model<ISuspiciousActivity>('SuspiciousActivity', SuspiciousActivitySchema);
export default SuspiciousActivity;
