import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBossAttack {
  discordId: string;
  username: string;
  damage: number;
}

export interface IBoss extends Document {
  bossId: string;
  name: string;
  maxHp: number;
  hp: number;
  active: boolean;
  attacks: IBossAttack[];
  spawnedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BossSchema: Schema = new Schema(
  {
    bossId: { type: String, required: true, unique: true, default: 'world_boss' },
    name: { type: String, required: true },
    maxHp: { type: Number, required: true },
    hp: { type: Number, required: true },
    active: { type: Boolean, default: false },
    attacks: [
      {
        discordId: { type: String, required: true },
        username: { type: String, required: true },
        damage: { type: Number, required: true, default: 0 }
      }
    ],
    spawnedBy: { type: String, required: true }
  },
  { timestamps: true }
);

const Boss: Model<IBoss> = mongoose.models.Boss || mongoose.model<IBoss>('Boss', BossSchema);
export default Boss;
