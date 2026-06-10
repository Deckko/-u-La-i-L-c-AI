import Season, { ISeason } from '../database/models/Season.js';
import logger from '../core/logger.js';

export class SeasonRepository {
  /**
   * Lấy mùa giải hiện đang hoạt động (active)
   */
  async getActiveSeason(): Promise<ISeason | null> {
    try {
      return await Season.findOne({ status: 'active' });
    } catch (error) {
      logger.error('[SeasonRepository] Lỗi khi lấy mùa giải đang hoạt động:', error);
      throw error;
    }
  }

  /**
   * Lấy mùa giải theo ID
   */
  async getBySeasonId(seasonId: string): Promise<ISeason | null> {
    try {
      return await Season.findOne({ seasonId });
    } catch (error) {
      logger.error(`[SeasonRepository] Lỗi khi lấy mùa giải ${seasonId}:`, error);
      throw error;
    }
  }

  /**
   * Khởi tạo hoặc cập nhật mùa giải
   */
  async upsertSeason(seasonId: string, data: Partial<ISeason>): Promise<ISeason> {
    try {
      const updated = await Season.findOneAndUpdate(
        { seasonId },
        { $set: data },
        { upsert: true, new: true }
      );
      logger.info(`[SeasonRepository] Đã cập nhật/tạo mùa giải ${seasonId} (${data.name})`);
      return updated;
    } catch (error) {
      logger.error(`[SeasonRepository] Lỗi khi upsert mùa giải ${seasonId}:`, error);
      throw error;
    }
  }
}

export const seasonRepository = new SeasonRepository();
