import mongoose, { Schema, Document, Model } from 'mongoose';

export type EffectSourceType = 'item' | 'title' | 'guild_tech' | 'pet' | 'equipment';

export interface IUserEffect extends Document {
  userId: string;
  effectId: string;
  expiresAt: Date | null;       // null nghĩa là vĩnh viễn (nội tại)
  sourceType: EffectSourceType;
  sourceId: string;             // ID của nguồn phát sinh (ví dụ: titleId, techId, itemId)
  createdAt: Date;
  updatedAt: Date;
}

const UserEffectSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    effectId: { type: String, required: true, index: true },
    expiresAt: { type: Date, default: null },
    sourceType: { 
      type: String, 
      enum: ['item', 'title', 'guild_tech', 'pet', 'equipment'], 
      required: true 
    },
    sourceId: { type: String, required: true }
  },
  { timestamps: true }
);

// Optimize query for active user effects
UserEffectSchema.index({ userId: 1, expiresAt: 1 });
// Ensure a user doesn't duplicate the same passive effect from the same source
UserEffectSchema.index({ userId: 1, effectId: 1, sourceId: 1 }, { unique: true });

const UserEffect: Model<IUserEffect> = mongoose.models.UserEffect || mongoose.model<IUserEffect>('UserEffect', UserEffectSchema);
export default UserEffect;
