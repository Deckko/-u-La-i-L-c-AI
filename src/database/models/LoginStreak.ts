import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoginStreak extends Document {
  userId: string;
  currentStreak: number;
  maxStreak: number;
  lastLoginDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LoginStreakSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null }
  },
  { timestamps: true }
);

const LoginStreak: Model<ILoginStreak> = mongoose.models.LoginStreak || mongoose.model<ILoginStreak>('LoginStreak', LoginStreakSchema);
export default LoginStreak;
