import Achievement, { IAchievement } from '../database/models/Achievement.js';
import UserAchievement, { IUserAchievement } from '../database/models/UserAchievement.js';
import logger from '../core/logger.js';

export class AchievementRepository {
  /**
   * Lấy định nghĩa thành tựu theo ID
   */
  async getById(achievementId: string): Promise<IAchievement | null> {
    try {
      return await Achievement.findOne({ achievementId });
    } catch (error) {
      logger.error(`[AchievementRepository] Lỗi khi lấy thành tựu ${achievementId}:`, error);
      throw error;
    }
  }

  /**
   * Khởi tạo hoặc cập nhật định nghĩa thành tựu
   */
  async upsertAchievement(achievement: Partial<IAchievement>): Promise<IAchievement> {
    try {
      return await Achievement.findOneAndUpdate(
        { achievementId: achievement.achievementId },
        { $set: achievement },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error(`[AchievementRepository] Lỗi khi upsert thành tựu ${achievement.achievementId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy tất cả định nghĩa thành tựu trong game
   */
  async getAllAchievements(): Promise<IAchievement[]> {
    try {
      return await Achievement.find({});
    } catch (error) {
      logger.error('[AchievementRepository] Lỗi khi lấy tất cả thành tựu:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách thành tựu đã mở khóa của người chơi
   */
  async getUnlockedAchievements(userId: string): Promise<IUserAchievement[]> {
    try {
      return await UserAchievement.find({ userId });
    } catch (error) {
      logger.error(`[AchievementRepository] Lỗi khi lấy thành tựu đã mở khóa của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mở khóa thành tựu cho người chơi
   */
  async unlockAchievement(userId: string, achievementId: string, seasonId: string = ''): Promise<IUserAchievement | null> {
    try {
      const existing = await UserAchievement.findOne({ userId, achievementId });
      if (existing) return existing;

      const unlock = new UserAchievement({
        userId,
        achievementId,
        seasonId
      });
      return await unlock.save();
    } catch (error) {
      logger.error(`[AchievementRepository] Lỗi khi mở khóa thành tựu ${achievementId} cho user ${userId}:`, error);
      throw error;
    }
  }
}

export const achievementRepository = new AchievementRepository();
