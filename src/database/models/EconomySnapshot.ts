import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEconomySnapshot extends Document {
  snapshotId: string;
  totalMinted: number;
  totalBurned: number;
  totalCirculation: number;
  top1PercentShare: number;
  top10PercentShare: number;
  top100Wealth: number;
  inflationRate: number;
  wealthGini: number;
  coinVelocity: number;
  createdAt: Date;
}

const EconomySnapshotSchema: Schema = new Schema(
  {
    snapshotId: { type: String, required: true, unique: true, index: true },
    totalMinted: { type: Number, required: true },
    totalBurned: { type: Number, required: true },
    totalCirculation: { type: Number, required: true },
    top1PercentShare: { type: Number, required: true },
    top10PercentShare: { type: Number, required: true },
    top100Wealth: { type: Number, required: true },
    inflationRate: { type: Number, default: 0 },
    wealthGini: { type: Number, default: 0 },
    coinVelocity: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const EconomySnapshot: Model<IEconomySnapshot> = mongoose.models.EconomySnapshot || mongoose.model<IEconomySnapshot>('EconomySnapshot', EconomySnapshotSchema);
export default EconomySnapshot;
