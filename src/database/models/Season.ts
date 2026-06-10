import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeason extends Document {
  seasonId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended';
  rewardPool: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SeasonSchema: Schema = new Schema(
  {
    seasonId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'active', 'ended'], default: 'upcoming', index: true },
    rewardPool: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

const Season: Model<ISeason> = mongoose.models.Season || mongoose.model<ISeason>('Season', SeasonSchema);
export default Season;
