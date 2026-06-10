import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaderboardSnapshot extends Document {
  snapshotId: string;
  category: string;
  rankings: Array<{ id: string; name: string; value: number; rank: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const LeaderboardSnapshotSchema: Schema = new Schema(
  {
    snapshotId: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    rankings: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        value: { type: Number, required: true },
        rank: { type: Number, required: true }
      }
    ]
  },
  { timestamps: true }
);

const LeaderboardSnapshot: Model<ILeaderboardSnapshot> =
  mongoose.models.LeaderboardSnapshot ||
  mongoose.model<ILeaderboardSnapshot>('LeaderboardSnapshot', LeaderboardSnapshotSchema);

export default LeaderboardSnapshot;
