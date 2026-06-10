import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuildConfig extends Document {
  guildId: string;
  prefix: string;
  eventChannelId: string;
  adminRoles: string[];
  premiumStatus: 'free' | 'premium';
  featureFlags: Map<string, 'enabled' | 'disabled' | 'beta' | 'premium'>;
  economySettings: {
    fishCooldownMinutes: number;
    mineCooldownMinutes: number;
    workCooldownMinutes: number;
    minBetCoins: number;
  };
  bossSettings: {
    maxHpMultiplier: number;
    spawnChannelId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GuildConfigSchema: Schema = new Schema(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    prefix: { type: String, default: '/' },
    eventChannelId: { type: String, default: '' },
    adminRoles: { type: [String], default: [] },
    premiumStatus: { type: String, enum: ['free', 'premium'], default: 'free' },
    featureFlags: { 
      type: Map, 
      of: String,
      default: new Map([
        ['guild_wars', 'disabled'],
        ['dungeons', 'disabled'],
        ['battle_pass', 'disabled'],
        ['ai_features', 'free']
      ])
    },
    economySettings: {
      fishCooldownMinutes: { type: Number, default: 5 },
      mineCooldownMinutes: { type: Number, default: 10 },
      workCooldownMinutes: { type: Number, default: 60 },
      minBetCoins: { type: Number, default: 10 }
    },
    bossSettings: {
      maxHpMultiplier: { type: Number, default: 1.0 },
      spawnChannelId: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

const GuildConfig: Model<IGuildConfig> = mongoose.models.GuildConfig || mongoose.model<IGuildConfig>('GuildConfig', GuildConfigSchema);
export default GuildConfig;
