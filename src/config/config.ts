import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../core/logger.js';

// Load variables from .env
dotenv.config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN is required'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID is required'),
  DISCORD_GUILD_ID: z.string().min(1, 'DISCORD_GUILD_ID is required'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  DISCORD_EVENT_CHANNEL_ID: z.string().optional(),
  
  // Admin portal
  ADMIN_USER: z.string().default('admin'),
  ADMIN_PASS: z.string().default('Detong@2026'),
  JWT_SECRET: z.string().default('detong-jwt-secret-key-2026'),
  SESSION_SECRET: z.string().default('detong-session-secret-key-2026'),
  PORT: z.preprocess(
    (val) => (val ? parseInt(val as string, 10) : 3000),
    z.number().positive().default(3000)
  ),
  
  // Third-party integrations
  STRIPE_API_KEY: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    logger.error('❌ Environment validation failed! Missing or invalid configuration keys:');
    parsed.error.errors.forEach((err) => {
      logger.error(`   - [${err.path.join('.')}]: ${err.message}`);
    });
    process.exit(1); // Crash startup immediately
  }
  
  logger.info('✅ Environment variables successfully validated.');
  return parsed.data;
};

export const config = parseEnv();
export type Config = typeof config;
