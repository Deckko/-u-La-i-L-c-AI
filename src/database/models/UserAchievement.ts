import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserAchievement extends Document {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  seasonId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserAchievementSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    achievementId: { type: String, required: true, index: true },
    unlockedAt: { type: Date, default: Date.now },
    seasonId: { type: String, default: '' }
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of user achievement unlocks
UserAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const UserAchievement: Model<IUserAchievement> = mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', UserAchievementSchema);
export default UserAchievement;
