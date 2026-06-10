import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { config } from '../config/config.js';
import logger from '../core/logger.js';
import GuildConfig from '../database/models/GuildConfig.js';
import EventModel from '../database/models/Event.js';
import BossModel from '../database/models/Boss.js';

dotenv.config();

async function runMigration() {
  logger.info('🚀 Khởi động tập lệnh di trú dữ liệu (Database Migration)...');
  
  if (!config.MONGO_URI) {
    logger.error('❌ Thiếu MONGO_URI, dừng di trú dữ liệu.');
    process.exit(1);
  }

  try {
    // Kết nối database
    await mongoose.connect(config.MONGO_URI);
    logger.info('✅ Kết nối database thành công.');

    const defaultGuildId = config.DISCORD_GUILD_ID;

    // 1. Tạo cấu hình mặc định cho Guild chính nếu chưa tồn tại
    logger.info(`[Step 1] Kiểm tra GuildConfig cho guildId: ${defaultGuildId}`);
    let guildCfg = await GuildConfig.findOne({ guildId: defaultGuildId });
    if (!guildCfg) {
      guildCfg = new GuildConfig({
        guildId: defaultGuildId,
        eventChannelId: config.DISCORD_EVENT_CHANNEL_ID || ''
      });
      await guildCfg.save();
      logger.info(`👉 Khởi tạo thành công GuildConfig cho Guild chính: ${defaultGuildId}`);
    } else {
      logger.info(`👉 GuildConfig cho Guild chính ${defaultGuildId} đã tồn tại.`);
    }

    // 2. Di chuyển các Sự kiện cũ chưa có guildId
    logger.info('[Step 2] Kiểm tra & Di trú các sự kiện cũ chưa có guildId...');
    // Tìm các sự kiện không chứa trường guildId hoặc guildId trống
    const legacyEvents = await EventModel.find({ $or: [{ guildId: { $exists: false } }, { guildId: '' }] });
    if (legacyEvents.length > 0) {
      logger.info(`👉 Tìm thấy ${legacyEvents.length} sự kiện cũ chưa có guildId.`);
      const result = await EventModel.updateMany(
        { $or: [{ guildId: { $exists: false } }, { guildId: '' }] },
        { $set: { guildId: defaultGuildId } }
      );
      logger.info(`✅ Di trú thành công ${result.modifiedCount} sự kiện cũ sang Guild chính: ${defaultGuildId}`);
    } else {
      logger.info('👉 Không có sự kiện cũ nào cần di trú.');
    }

    // 3. Di chuyển các Boss cũ chưa có guildId
    logger.info('[Step 3] Kiểm tra & Di trú các Boss cũ chưa có guildId...');
    const legacyBosses = await BossModel.find({ $or: [{ guildId: { $exists: false } }, { guildId: '' }] });
    if (legacyBosses.length > 0) {
      logger.info(`👉 Tìm thấy ${legacyBosses.length} Boss cũ chưa có guildId.`);
      const result = await BossModel.updateMany(
        { $or: [{ guildId: { $exists: false } }, { guildId: '' }] },
        { $set: { guildId: defaultGuildId } }
      );
      logger.info(`✅ Di trú thành công ${result.modifiedCount} Boss cũ sang Guild chính: ${defaultGuildId}`);
    } else {
      logger.info('👉 Không có Boss cũ nào cần di trú.');
    }

    logger.info('🎉 HOÀN THÀNH DI TRÚ DỮ LIỆU THÀNH CÔNG!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Lỗi xảy ra trong quá trình di trú dữ liệu:', error);
    process.exit(1);
  }
}

// Chạy di trú
runMigration();
