import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuild extends Document {
  guildName: string; // Tên bang hội (unique)
  masterId: string; // Discord ID of the Guild Master
  level: number;
  xp: number;
  capacity: number;
  treasuryCoins: number;
  description: string;
  territoryName: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuildSchema: Schema = new Schema(
  {
    guildName: { type: String, required: true, unique: true, index: true },
    masterId: { type: String, required: true, index: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    capacity: { type: Number, default: 10 }, // Mặc định chứa tối đa 10 đệ tử
    treasuryCoins: { type: Number, default: 0 },
    description: { type: String, default: 'Bang hội Đế Tông Đấu La Đại Lục.' },
    territoryName: { type: String, default: 'Tân Thủ Thôn' }
  },
  { timestamps: true }
);

const Guild: Model<IGuild> = mongoose.models.Guild || mongoose.model<IGuild>('Guild', GuildSchema);
export default Guild;
