import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDungeonSession extends Document {
  sessionId: string;
  userId: string;
  dungeonId: string;
  status: 'active' | 'completed' | 'failed';
  currentFloor: number;
  startedAt: Date;
  completedAt: Date | null;
}

const DungeonSessionSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    dungeonId: { type: String, required: true, index: true },
    status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
    currentFloor: { type: Number, default: 1 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const DungeonSession: Model<IDungeonSession> = mongoose.models.DungeonSession || mongoose.model<IDungeonSession>('DungeonSession', DungeonSessionSchema);
export default DungeonSession;
