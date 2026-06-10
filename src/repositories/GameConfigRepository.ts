import GameConfig, { IGameConfig } from '../database/models/GameConfig.js';
import logger from '../core/logger.js';

export class GameConfigRepository {
  /**
   * Lấy cấu hình theo khóa key
   */
  async getByKey(key: string): Promise<IGameConfig | null> {
    try {
      return await GameConfig.findOne({ key });
    } catch (error) {
      logger.error(`[GameConfigRepository] Lỗi khi lấy cấu hình cho key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật hoặc chèn mới cấu hình
   */
  async upsertConfig(key: string, value: any, description: string = ''): Promise<IGameConfig> {
    try {
      const updated = await GameConfig.findOneAndUpdate(
        { key },
        { $set: { value, description } },
        { upsert: true, new: true }
      );
      logger.info(`[GameConfigRepository] Đã cập nhật cấu hình cho key: ${key}`);
      return updated;
    } catch (error) {
      logger.error(`[GameConfigRepository] Lỗi khi lưu cấu hình key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Lấy tất cả cấu hình
   */
  async getAllConfigs(): Promise<IGameConfig[]> {
    try {
      return await GameConfig.find({});
    } catch (error) {
      logger.error('[GameConfigRepository] Lỗi khi lấy tất cả cấu hình:', error);
      throw error;
    }
  }
}

export const gameConfigRepository = new GameConfigRepository();
