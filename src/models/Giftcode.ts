import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGiftcode extends Document {
  code: string;
  rewardCoins: number;
  rewardExp: number;
  maxUses: number;
  usedCount: number;
  usedBy: string[]; // List of user discordIds who claimed it
  createdAt: Date;
  updatedAt: Date;
}

const GiftcodeSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    rewardCoins: { type: Number, required: true, default: 0 },
    rewardExp: { type: Number, required: true, default: 0 },
    maxUses: { type: Number, required: true, default: 100 },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: String }]
  },
  { timestamps: true }
);

const Giftcode: Model<IGiftcode> = mongoose.models.Giftcode || mongoose.model<IGiftcode>('Giftcode', GiftcodeSchema);
export default Giftcode;
