import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuildSeasonStats extends Document {
  guildId: mongoose.Types.ObjectId;
  seasonId: string;
  matchesWon: number;
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const GuildSeasonStatsSchema: Schema = new Schema(
  {
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, index: true },
    seasonId: { type: String, required: true, index: true },
    matchesWon: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per guild/season
GuildSeasonStatsSchema.index({ guildId: 1, seasonId: 1 }, { unique: true });

const GuildSeasonStats: Model<IGuildSeasonStats> = mongoose.models.GuildSeasonStats || mongoose.model<IGuildSeasonStats>('GuildSeasonStats', GuildSeasonStatsSchema);
export default GuildSeasonStats;
