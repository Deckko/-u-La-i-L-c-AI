import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEconomyStats extends Document {
  totalMinted: number;
  totalBurned: number;
  createdAt: Date;
  updatedAt: Date;
}

const EconomyStatsSchema: Schema = new Schema(
  {
    totalMinted: { type: Number, default: 0 },
    totalBurned: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const EconomyStats: Model<IEconomyStats> = mongoose.models.EconomyStats || mongoose.model<IEconomyStats>('EconomyStats', EconomyStatsSchema);
export default EconomyStats;
