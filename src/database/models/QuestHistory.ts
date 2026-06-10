import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestHistory extends Document {
  userId: string;
  questId: string;
  type: 'daily' | 'weekly' | 'monthly';
  completedAt: Date;
  rewardCoins: number;
  rewardExp: number;
}

const QuestHistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    questId: { type: String, required: true, index: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    completedAt: { type: Date, default: Date.now },
    rewardCoins: { type: Number, required: true },
    rewardExp: { type: Number, required: true }
  },
  { timestamps: true }
);

const QuestHistory: Model<IQuestHistory> = mongoose.models.QuestHistory || mongoose.model<IQuestHistory>('QuestHistory', QuestHistorySchema);
export default QuestHistory;
