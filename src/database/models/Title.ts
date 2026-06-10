import mongoose, { Schema, Document, Model } from 'mongoose';

export type TitleRarity = 'normal' | 'rare' | 'epic' | 'legendary';

export interface ITitle extends Document {
  titleId: string;
  name: string;
  description: string;
  rarity: TitleRarity;
  createdAt: Date;
  updatedAt: Date;
}

const TitleSchema: Schema = new Schema(
  {
    titleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    rarity: { type: String, enum: ['normal', 'rare', 'epic', 'legendary'], default: 'normal' }
  },
  { timestamps: true }
);

const Title: Model<ITitle> = mongoose.models.Title || mongoose.model<ITitle>('Title', TitleSchema);
export default Title;
