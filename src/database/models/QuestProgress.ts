import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestProgress extends Document {
  userId: string;
  questId: string;
  currentCount: number;
  claimed: boolean;
  resetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestProgressSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    questId: { type: String, required: true, index: true },
    currentCount: { type: Number, required: true, default: 0 },
    claimed: { type: Boolean, default: false },
    resetAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Compound index to quickly fetch user active quests
QuestProgressSchema.index({ userId: 1, questId: 1 }, { unique: true });

const QuestProgress: Model<IQuestProgress> = mongoose.models.QuestProgress || mongoose.model<IQuestProgress>('QuestProgress', QuestProgressSchema);
export default QuestProgress;
