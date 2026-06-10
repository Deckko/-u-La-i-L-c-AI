import mongoose, { Schema, Document, Model } from 'mongoose';

export type EffectType =
  | 'xp_boost'                  // Tăng % XP nhận được
  | 'coin_boost'                // Tăng % Đấu Xu nhận được
  | 'boss_damage_boost'         // Tăng % sát thương lên Boss
  | 'guild_contribution_boost'  // Tăng % đóng góp bang hội nhận được
  | 'cooldown_reduction'        // Giảm % thời gian cooldown lệnh cày cuốc
  | 'lucky_drop_rate';          // Tăng % tỷ lệ rơi vật phẩm quý

export interface IItemEffect extends Document {
  effectId: string;
  name: string;
  effectType: EffectType;
  effectValue: number;          // Ví dụ: 0.1 đại diện cho +10%
  duration: number;             // Thời gian hiệu lực tính bằng giây (0 đại diện cho vĩnh viễn/nội tại)
  stackable: boolean;           // Có cho phép cộng dồn với hiệu ứng cùng loại hay không
  createdAt: Date;
  updatedAt: Date;
}

const ItemEffectSchema: Schema = new Schema(
  {
    effectId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    effectType: { 
      type: String, 
      enum: ['xp_boost', 'coin_boost', 'boss_damage_boost', 'guild_contribution_boost', 'cooldown_reduction', 'lucky_drop_rate'], 
      required: true 
    },
    effectValue: { type: Number, required: true, default: 0 },
    duration: { type: Number, required: true, default: 0 },
    stackable: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const ItemEffect: Model<IItemEffect> = mongoose.models.ItemEffect || mongoose.model<IItemEffect>('ItemEffect', ItemEffectSchema);
export default ItemEffect;
