import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuildTerritory extends Document {
  guildId: mongoose.Types.ObjectId;
  territoryName: string;
  controlStartedAt: Date;
  resourceMultiplier: number; // Hệ số nhân phần thưởng thu hoạch
  createdAt: Date;
  updatedAt: Date;
}

const GuildTerritorySchema: Schema = new Schema(
  {
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, index: true },
    territoryName: { type: String, required: true, unique: true, index: true },
    controlStartedAt: { type: Date, default: Date.now },
    resourceMultiplier: { type: Number, default: 1.0 }
  },
  { timestamps: true }
);

const GuildTerritory: Model<IGuildTerritory> = mongoose.models.GuildTerritory || mongoose.model<IGuildTerritory>('GuildTerritory', GuildTerritorySchema);
export default GuildTerritory;
