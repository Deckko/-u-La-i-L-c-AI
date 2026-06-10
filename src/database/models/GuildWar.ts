import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuildWarMatch extends Document {
  matchId: string;
  seasonId: string;
  guildAId: mongoose.Types.ObjectId;
  guildBId: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'completed';
  winnerId: mongoose.Types.ObjectId | null;
  scheduledAt: Date;
  completedAt: Date | null;
}

const GuildWarMatchSchema: Schema = new Schema(
  {
    matchId: { type: String, required: true, unique: true, index: true },
    seasonId: { type: String, required: true, index: true },
    guildAId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, index: true },
    guildBId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, index: true },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    winnerId: { type: Schema.Types.ObjectId, ref: 'Guild', default: null },
    scheduledAt: { type: Date, required: true },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const GuildWarMatch: Model<IGuildWarMatch> = mongoose.models.GuildWarMatch || mongoose.model<IGuildWarMatch>('GuildWarMatch', GuildWarMatchSchema);
export default GuildWarMatch;
