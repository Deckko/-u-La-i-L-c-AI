import { battlePassRepository } from '../repositories/BattlePassRepository.js';
import { IBattlePassProgress } from '../database/models/BattlePass.js';
import logger from '../core/logger.js';

export class BattlePassService {
  /**
   * Thêm điểm kinh nghiệm Battle Pass (tự thăng cấp nếu đủ 1000 EXP)
   */
  async addExp(userId: string, seasonId: string, amount: number): Promise<IBattlePassProgress> {
    try {
      const progress = await battlePassRepository.getOrCreate(userId, seasonId);
      progress.exp += amount;

      const expPerTier = 1000;
      let leveledUp = false;
      
      while (progress.exp >= expPerTier) {
        progress.exp -= expPerTier;
        progress.tier += 1;
        leveledUp = true;
      }

      await progress.save();
      if (leveledUp) {
        logger.info(`[BattlePassService] User ${userId} đã tăng cấp Battle Pass lên cấp ${progress.tier} trong mùa giải ${seasonId}`);
      }
      return progress;
    } catch (error) {
      logger.error(`[BattlePassService] Lỗi khi cộng EXP Battle Pass cho user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Nhận phần thưởng Free
   */
  async claimFreeReward(userId: string, seasonId: string, tier: number): Promise<{ success: boolean; error?: string }> {
    try {
      const progress = await battlePassRepository.getOrCreate(userId, seasonId);
      if (progress.tier < tier) {
        return { success: false, error: `Cấp độ Battle Pass của đồng đạo chưa đạt mốc ${tier}!` };
      }

      if (progress.claimedFreeRewards.includes(tier)) {
        return { success: false, error: `Phần thưởng mốc ${tier} này đã được nhận từ trước.` };
      }

      progress.claimedFreeRewards.push(tier);
      await progress.save();
      logger.info(`[BattlePassService] User ${userId} đã nhận quà Free Battle Pass mốc ${tier}`);
      return { success: true };
    } catch (error) {
      logger.error(`[BattlePassService] Lỗi nhận quà Free BP mốc ${tier} cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi nhận thưởng pháp bảo.' };
    }
  }

  /**
   * Nhận phần thưởng Premium (Cần kiểm tra trạng thái Premium nếu cần)
   */
  async claimPremiumReward(userId: string, seasonId: string, tier: number): Promise<{ success: boolean; error?: string }> {
    try {
      const progress = await battlePassRepository.getOrCreate(userId, seasonId);
      if (progress.tier < tier) {
        return { success: false, error: `Cấp độ Battle Pass của đồng đạo chưa đạt mốc ${tier}!` };
      }

      if (progress.claimedPremiumRewards.includes(tier)) {
        return { success: false, error: `Phần thưởng mốc ${tier} này đã được nhận từ trước.` };
      }

      progress.claimedPremiumRewards.push(tier);
      await progress.save();
      logger.info(`[BattlePassService] User ${userId} đã nhận quà Premium Battle Pass mốc ${tier}`);
      return { success: true };
    } catch (error) {
      logger.error(`[BattlePassService] Lỗi nhận quà Premium BP mốc ${tier} cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi nhận thưởng pháp bảo thượng phẩm.' };
    }
  }
}

export const battlePassService = new BattlePassService();
