import PlayerStats, { IPlayerStats } from '../database/models/PlayerStats.js';
import logger from '../core/logger.js';

export class PlayerStatsRepository {
  /**
   * Lấy chỉ số tích lũy của người chơi, tự tạo mới nếu chưa có
   */
  async getOrCreate(userId: string): Promise<IPlayerStats> {
    try {
      let stats = await PlayerStats.findOne({ userId });
      if (!stats) {
        stats = new PlayerStats({ userId });
        await stats.save();
      }
      return stats;
    } catch (error) {
      logger.error(`[PlayerStatsRepository] Lỗi khi lấy stats cho user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Tăng một chỉ số tích lũy bằng atomic operation
   */
  async incrementStat(userId: string, field: keyof Omit<IPlayerStats, 'userId' | 'createdAt' | 'updatedAt' | 'id' | '_id' | 'save'>, amount: number): Promise<IPlayerStats> {
    try {
      return await PlayerStats.findOneAndUpdate(
        { userId },
        { $inc: { [field]: amount } },
        { upsert: true, new: true }
      ) as IPlayerStats;
    } catch (error) {
      logger.error(`[PlayerStatsRepository] Lỗi khi tăng chỉ số ${field} cho user ${userId}:`, error);
      throw error;
    }
  }
}

export const playerStatsRepository = new PlayerStatsRepository();
