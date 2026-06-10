import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBossAttack {
  discordId: string;
  username: string;
  damage: number;
}

export interface IBoss extends Document {
  guildId: string; // Multi-guild mapping
  bossId: string; // ID uniquely representing a boss in the guild (e.g. world_boss)
  name: string;
  maxHp: number;
  hp: number;
  active: boolean;
  attacks: IBossAttack[];
  spawnedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BossAttackSchema = new Schema({
  discordId: { type: String, required: true },
  username: { type: String, required: true },
  damage: { type: Number, required: true, default: 0 }
});

const BossSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true, index: true },
    bossId: { type: String, required: true, default: 'world_boss' },
    name: { type: String, required: true },
    maxHp: { type: Number, required: true },
    hp: { type: Number, required: true },
    active: { type: Boolean, default: true },
    attacks: { type: [BossAttackSchema], default: [] },
    spawnedBy: { type: String, required: true }
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of a boss type within a guild
BossSchema.index({ guildId: 1, bossId: 1 }, { unique: true });

const BossModel: Model<IBoss> = mongoose.models.Boss || mongoose.model<IBoss>('Boss', BossSchema);
export default BossModel;
