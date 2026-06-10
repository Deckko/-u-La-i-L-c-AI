import LeaderboardSnapshot, { ILeaderboardSnapshot } from '../database/models/LeaderboardSnapshot.js';
import logger from '../core/logger.js';

export class LeaderboardRepository {
  /**
   * Lưu trữ một bản snapshot bảng xếp hạng mới
   */
  async saveSnapshot(
    category: string,
    rankings: Array<{ id: string; name: string; value: number; rank: number }>
  ): Promise<ILeaderboardSnapshot> {
    try {
      const snapshotId = `LB_${category.toUpperCase()}_${Date.now()}`;
      const newSnap = new LeaderboardSnapshot({
        snapshotId,
        category,
        rankings
      });
      return await newSnap.save();
    } catch (error) {
      logger.error(`[LeaderboardRepository] Lỗi khi lưu snapshot cho category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Lấy bản snapshot mới nhất của một hạng mục xếp hạng
   */
  async getLatestSnapshot(category: string): Promise<ILeaderboardSnapshot | null> {
    try {
      return await LeaderboardSnapshot.findOne({ category })
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error(`[LeaderboardRepository] Lỗi khi lấy snapshot mới nhất cho ${category}:`, error);
      throw error;
    }
  }
}

export const leaderboardRepository = new LeaderboardRepository();
