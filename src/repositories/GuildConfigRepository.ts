import GuildConfig, { IGuildConfig } from '../database/models/GuildConfig.js';
import logger from '../core/logger.js';

export class GuildConfigRepository {
  /**
   * Lấy cấu hình của Guild theo ID
   */
  async getByGuildId(guildId: string): Promise<IGuildConfig | null> {
    try {
      return await GuildConfig.findOne({ guildId });
    } catch (error) {
      logger.error(`[GuildConfigRepository] Lỗi khi lấy cấu hình cho guildId ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy cấu hình của Guild, nếu chưa có thì tự động tạo mới với các giá trị mặc định
   */
  async getOrCreate(guildId: string): Promise<IGuildConfig> {
    try {
      let config = await GuildConfig.findOne({ guildId });
      if (!config) {
        config = new GuildConfig({ guildId });
        await config.save();
        logger.info(`[GuildConfigRepository] Đã khởi tạo cấu hình mặc định mới cho guildId ${guildId}`);
      }
      return config;
    } catch (error) {
      logger.error(`[GuildConfigRepository] Lỗi getOrCreate cho guildId ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật cấu hình của Guild
   */
  async update(guildId: string, updates: Partial<IGuildConfig>): Promise<IGuildConfig | null> {
    try {
      return await GuildConfig.findOneAndUpdate(
        { guildId },
        { $set: updates },
        { new: true }
      );
    } catch (error) {
      logger.error(`[GuildConfigRepository] Lỗi khi cập nhật cấu hình cho guildId ${guildId}:`, error);
      throw error;
    }
  }
}

export const guildConfigRepository = new GuildConfigRepository();
