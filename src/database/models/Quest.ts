import mongoose, { Schema, Document, Model } from 'mongoose';

export type QuestType = 'daily' | 'weekly' | 'monthly';
export type QuestCategory = 'activity' | 'economy' | 'combat' | 'social';

export interface IQuest extends Document {
  questId: string;
  type: QuestType;
  category: QuestCategory;
  targetAction: string; // mine, fish, work, boss_attack, spend_coins, donate_guild, level_up, join_guild
  targetCount: number;
  rewardExp: number;
  rewardCoins: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestSchema: Schema = new Schema(
  {
    questId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
    category: { type: String, enum: ['activity', 'economy', 'combat', 'social'], required: true },
    targetAction: { type: String, required: true },
    targetCount: { type: Number, required: true },
    rewardExp: { type: Number, required: true, default: 0 },
    rewardCoins: { type: Number, required: true, default: 0 },
    description: { type: String, required: true }
  },
  { timestamps: true }
);

const Quest: Model<IQuest> = mongoose.models.Quest || mongoose.model<IQuest>('Quest', QuestSchema);
export default Quest;
