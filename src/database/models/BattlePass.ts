import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBattlePassProgress extends Document {
  userId: string;
  seasonId: string;
  tier: number;
  exp: number;
  claimedFreeRewards: number[];    // Mảng lưu số cấp độ Free đã nhận quà (ví dụ: [1, 2, 5])
  claimedPremiumRewards: number[]; // Mảng lưu số cấp độ Premium đã nhận quà
  createdAt: Date;
  updatedAt: Date;
}

const BattlePassProgressSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    seasonId: { type: String, required: true, index: true },
    tier: { type: Number, default: 1 },
    exp: { type: Number, default: 0 },
    claimedFreeRewards: { type: [Number], default: [] },
    claimedPremiumRewards: { type: [Number], default: [] }
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness per user per season
BattlePassProgressSchema.index({ userId: 1, seasonId: 1 }, { unique: true });

const BattlePassProgress: Model<IBattlePassProgress> = mongoose.models.BattlePassProgress || mongoose.model<IBattlePassProgress>('BattlePassProgress', BattlePassProgressSchema);
export default BattlePassProgress;
