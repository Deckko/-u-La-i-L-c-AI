import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuildRanking extends Document {
  guildId: mongoose.Types.ObjectId;
  points: number;
  rank: number;
  updatedTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GuildRankingSchema: Schema = new Schema(
  {
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, unique: true, index: true },
    points: { type: Number, default: 0, index: true },
    rank: { type: Number, default: 0 },
    updatedTime: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const GuildRanking: Model<IGuildRanking> = mongoose.models.GuildRanking || mongoose.model<IGuildRanking>('GuildRanking', GuildRankingSchema);
export default GuildRanking;
