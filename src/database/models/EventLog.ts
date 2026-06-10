import mongoose, { Schema, Document, Model } from 'mongoose';

export type EventLogType =
  | 'LevelUp'
  | 'BossKill'
  | 'GuildCreate'
  | 'GuildJoin'
  | 'GuildDonate'
  | 'AchievementUnlock'
  | 'QuestComplete'
  | 'TitleUnlock';

export interface IEventLog extends Document {
  eventId: string;
  eventType: EventLogType;
  userId: string;
  guildId: string;
  payload: Record<string, any>;
  createdAt: Date;
}

const EventLogSchema: Schema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    guildId: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Optimize indexes for dashboard queries and season statistics
EventLogSchema.index({ eventType: 1, createdAt: -1 });
EventLogSchema.index({ userId: 1, eventType: 1 });

const EventLog: Model<IEventLog> = mongoose.models.EventLog || mongoose.model<IEventLog>('EventLog', EventLogSchema);
export default EventLog;
