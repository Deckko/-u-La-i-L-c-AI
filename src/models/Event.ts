import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventParticipant {
  userId: string;
  username: string;
  points: number;
  joinedAt: Date;
}

export interface IEvent extends Document {
  eventId: string;
  title: string;
  description: string;
  duration: string;
  criteria: string;
  bannerUrl: string;
  status: 'active' | 'completed';
  participants: IEventParticipant[];
  createdBy: string;
  announcementChannelId?: string;
  announcementMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventParticipantSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  points: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now }
});

const EventSchema: Schema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    criteria: { type: String, required: true },
    bannerUrl: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    participants: { type: [EventParticipantSchema], default: [] },
    createdBy: { type: String, required: true },
    announcementChannelId: { type: String, default: '' },
    announcementMessageId: { type: String, default: '' }
  },
  { timestamps: true }
);

const EventModel: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default EventModel;
