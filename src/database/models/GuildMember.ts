import mongoose, { Schema, Document, Model } from 'mongoose';

export type GuildRole = 'master' | 'elder' | 'member';

export interface IGuildMember extends Document {
  guildId: mongoose.Types.ObjectId;
  userId: string; // Discord ID người chơi
  role: GuildRole;
  joinedAt: Date;
  totalContribution: number; // Tổng số Đấu Xu quyên góp
  createdAt: Date;
  updatedAt: Date;
}

const GuildMemberSchema: Schema = new Schema(
  {
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, index: true },
    userId: { type: String, required: true, unique: true, index: true }, // Duy nhất trên toàn hệ thống bot
    role: { type: String, enum: ['master', 'elder', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    totalContribution: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const GuildMember: Model<IGuildMember> = mongoose.models.GuildMember || mongoose.model<IGuildMember>('GuildMember', GuildMemberSchema);
export default GuildMember;
