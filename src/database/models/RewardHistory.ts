import mongoose, { Schema, Document, Model } from 'mongoose';

export type RewardType = 'daily' | 'weekly' | 'comeback' | 'loyalty';

export interface IRewardHistory extends Document {
  userId: string;
  rewardType: RewardType;
  claimedAt: Date;
  rewardCoins: number;
  rewardExp: number;
  createdAt: Date;
  updatedAt: Date;
}

const RewardHistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    rewardType: { type: String, enum: ['daily', 'weekly', 'comeback', 'loyalty'], required: true, index: true },
    claimedAt: { type: Date, default: Date.now },
    rewardCoins: { type: Number, default: 0 },
    rewardExp: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const RewardHistory: Model<IRewardHistory> = mongoose.models.RewardHistory || mongoose.model<IRewardHistory>('RewardHistory', RewardHistorySchema);
export default RewardHistory;
