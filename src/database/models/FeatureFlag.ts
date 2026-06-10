import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeatureFlag extends Document {
  flagName: string;
  status: 'enabled' | 'disabled' | 'beta' | 'premium' | 'admin-only';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema: Schema = new Schema(
  {
    flagName: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ['enabled', 'disabled', 'beta', 'premium', 'admin-only'], default: 'enabled' },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

const FeatureFlag: Model<IFeatureFlag> = mongoose.models.FeatureFlag || mongoose.model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);
export default FeatureFlag;
