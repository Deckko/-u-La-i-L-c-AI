import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserTitle extends Document {
  userId: string;
  titleId: string;
  unlockedAt: Date;
  isEquipped: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserTitleSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    titleId: { type: String, required: true, index: true },
    unlockedAt: { type: Date, default: Date.now },
    isEquipped: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound indexes
UserTitleSchema.index({ userId: 1, titleId: 1 }, { unique: true });
UserTitleSchema.index({ userId: 1, isEquipped: 1 });

const UserTitle: Model<IUserTitle> = mongoose.models.UserTitle || mongoose.model<IUserTitle>('UserTitle', UserTitleSchema);
export default UserTitle;
