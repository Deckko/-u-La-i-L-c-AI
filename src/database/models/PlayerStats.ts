import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlayerStats extends Document {
  userId: string;
  totalMines: number;
  totalFish: number;
  totalWorks: number;
  totalBossDamage: number;
  totalCoinsSpent: number;
  totalDonations: number;
  totalQuestCompletions: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerStatsSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    totalMines: { type: Number, default: 0 },
    totalFish: { type: Number, default: 0 },
    totalWorks: { type: Number, default: 0 },
    totalBossDamage: { type: Number, default: 0 },
    totalCoinsSpent: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    totalQuestCompletions: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const PlayerStats: Model<IPlayerStats> = mongoose.models.PlayerStats || mongoose.model<IPlayerStats>('PlayerStats', PlayerStatsSchema);
export default PlayerStats;
