import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGiftcode extends Document {
  code: string;
  rewardCoins: number;
  rewardExp: number;
  maxUses: number;
  usedCount: number;
  usedBy: string[]; // List of Discord User IDs
  createdAt: Date;
  updatedAt: Date;
}

const GiftcodeSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    rewardCoins: { type: Number, required: true },
    rewardExp: { type: Number, required: true },
    maxUses: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    usedBy: { type: [String], default: [] }
  },
  { timestamps: true }
);

const GiftcodeModel: Model<IGiftcode> = mongoose.models.Giftcode || mongoose.model<IGiftcode>('Giftcode', GiftcodeSchema);
export default GiftcodeModel;
