import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankLog {
  userId: string;
  action: 'deposit' | 'withdraw';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface IGuildBank extends Document {
  guildId: mongoose.Types.ObjectId;
  balance: number;
  logs: IBankLog[];
  createdAt: Date;
  updatedAt: Date;
}

const BankLogSchema = new Schema({
  userId: { type: String, required: true },
  action: { type: String, enum: ['deposit', 'withdraw'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

const GuildBankSchema: Schema = new Schema(
  {
    guildId: { type: Schema.Types.ObjectId, ref: 'Guild', required: true, unique: true, index: true },
    balance: { type: Number, default: 0 },
    logs: { type: [BankLogSchema], default: [] }
  },
  { timestamps: true }
);

const GuildBank: Model<IGuildBank> = mongoose.models.GuildBank || mongoose.model<IGuildBank>('GuildBank', GuildBankSchema);
export default GuildBank;
