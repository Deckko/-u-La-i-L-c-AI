import mongoose, { Schema, Document, Model } from 'mongoose';

export type AchievementCategory = 'combat' | 'economy' | 'activity';

export interface IAchievement extends Document {
  achievementId: string;
  name: string;
  description: string;
  category: AchievementCategory;
  criteriaType: string; // level_reached, coins_spent, boss_kills, boss_damage, work_count, fish_count, mine_count, slot_wins, coinflip_wins
  targetValue: number;
  rewardCoins: number;
  rewardExp: number;
  rewardTitle?: string;
  isHidden: boolean;
  isSeasonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema: Schema = new Schema(
  {
    achievementId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['combat', 'economy', 'activity'], required: true },
    criteriaType: { type: String, required: true },
    targetValue: { type: Number, required: true },
    rewardCoins: { type: Number, required: true, default: 0 },
    rewardExp: { type: Number, required: true, default: 0 },
    rewardTitle: { type: String, default: '' },
    isHidden: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
export default Achievement;
