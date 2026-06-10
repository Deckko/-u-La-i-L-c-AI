import BattlePassProgress, { IBattlePassProgress } from '../database/models/BattlePass.js';
import logger from '../core/logger.js';

export class BattlePassRepository {
  /**
   * Lấy tiến trình Battle Pass của người chơi trong mùa giải, tự tạo mới nếu chưa có
   */
  async getOrCreate(userId: string, seasonId: string): Promise<IBattlePassProgress> {
    try {
      let progress = await BattlePassProgress.findOne({ userId, seasonId });
      if (!progress) {
        progress = new BattlePassProgress({
          userId,
          seasonId,
          tier: 1,
          exp: 0,
          claimedFreeRewards: [],
          claimedPremiumRewards: []
        });
        await progress.save();
      }
      return progress;
    } catch (error) {
      logger.error(`[BattlePassRepository] Lỗi khi lấy Battle Pass của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật tiến trình Battle Pass
   */
  async updateProgress(userId: string, seasonId: string, updates: Partial<IBattlePassProgress>): Promise<IBattlePassProgress | null> {
    try {
      return await BattlePassProgress.findOneAndUpdate(
        { userId, seasonId },
        { $set: updates },
        { new: true }
      );
    } catch (error) {
      logger.error(`[BattlePassRepository] Lỗi khi cập nhật Battle Pass cho user ${userId}:`, error);
      throw error;
    }
  }
}

export const battlePassRepository = new BattlePassRepository();
