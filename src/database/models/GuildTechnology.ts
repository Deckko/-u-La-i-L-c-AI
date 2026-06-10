import mongoose, { Schema, Document, Model } from 'mongoose';

export type TechIdType = 'combat_boost' | 'exp_boost' | 'coin_boost';

export interface IGuildTechnology extends Document {
  guildId: mongoose.Types.ObjectId;
  techId: TechIdType;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

const GuildTechnologySchema: Schema = new Schema(
  {
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, index: true },
    techId: { type: String, enum: ['combat_boost', 'exp_boost', 'coin_boost'], required: true },
    level: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per guild/tech
GuildTechnologySchema.index({ guildId: 1, techId: 1 }, { unique: true });

const GuildTechnology: Model<IGuildTechnology> = mongoose.models.GuildTechnology || mongoose.model<IGuildTechnology>('GuildTechnology', GuildTechnologySchema);
export default GuildTechnology;
