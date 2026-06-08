import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  discordId: string;
  username: string;
  registered: boolean;
  characterName: string;
  serverName: string;
  combatPower: number;
  exp: number;
  level: number;
  balance: number;
  lastDaily: Date | null;
  dailyStreak: number;
  lastWork: Date | null;
  lastFish: Date | null;
  lastMine: Date | null;
  lastRoll: Date | null;
  lastCoinflip: Date | null;
  lastSlot: Date | null;
  title: string;
  titlesOwned: string[];
  gachaScrolls: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    registered: { type: Boolean, default: false },
    characterName: { type: String, default: '' },
    serverName: { type: String, default: '' },
    combatPower: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    balance: { type: Number, default: 0 },
    lastDaily: { type: Date, default: null },
    dailyStreak: { type: Number, default: 0 },
    lastWork: { type: Date, default: null },
    lastFish: { type: Date, default: null },
    lastMine: { type: Date, default: null },
    lastRoll: { type: Date, default: null },
    lastCoinflip: { type: Date, default: null },
    lastSlot: { type: Date, default: null },
    title: { type: String, default: 'Tân Nhân' },
    titlesOwned: { type: [String], default: [] },
    gachaScrolls: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Mức độ ưu tiên cao về tìm kiếm bảng ngọc xếp hạng tiên bàn
UserSchema.index({ level: -1, exp: -1 });
UserSchema.index({ balance: -1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
