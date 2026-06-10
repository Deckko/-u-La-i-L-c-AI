import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGameConfig extends Document {
  key: string;
  value: any;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const GameConfigSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

const GameConfig: Model<IGameConfig> = mongoose.models.GameConfig || mongoose.model<IGameConfig>('GameConfig', GameConfigSchema);
export default GameConfig;
