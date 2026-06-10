import Quest, { IQuest } from '../database/models/Quest.js';
import QuestProgress, { IQuestProgress } from '../database/models/QuestProgress.js';
import QuestHistory, { IQuestHistory } from '../database/models/QuestHistory.js';
import logger from '../core/logger.js';

export class QuestRepository {
  /**
   * Lấy định nghĩa nhiệm vụ theo ID
   */
  async getById(questId: string): Promise<IQuest | null> {
    try {
      return await Quest.findOne({ questId });
    } catch (error) {
      logger.error(`[QuestRepository] Lỗi khi lấy nhiệm vụ ${questId}:`, error);
      throw error;
    }
  }

  /**
   * Khởi tạo hoặc cập nhật định nghĩa nhiệm vụ
   */
  async upsertQuest(quest: Partial<IQuest>): Promise<IQuest> {
    try {
      return await Quest.findOneAndUpdate(
        { questId: quest.questId },
        { $set: quest },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error(`[QuestRepository] Lỗi khi upsert nhiệm vụ ${quest.questId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy tất cả định nghĩa nhiệm vụ theo loại (daily, weekly, monthly)
   */
  async getQuestsByType(type: 'daily' | 'weekly' | 'monthly'): Promise<IQuest[]> {
    try {
      return await Quest.find({ type });
    } catch (error) {
      logger.error(`[QuestRepository] Lỗi khi lấy nhiệm vụ loại ${type}:`, error);
      throw error;
    }
  }

  /**
   * Lấy tiến trình nhiệm vụ của người chơi
   */
  async getProgress(userId: string, questId: string): Promise<IQuestProgress | null> {
    try {
      return await QuestProgress.findOne({ userId, questId });
    } catch (error) {
      logger.error(`[QuestRepository] Lỗi khi lấy tiến trình nhiệm vụ ${questId} của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tiến trình nhiệm vụ đang kích hoạt của người chơi
   */
  async getActiveProgresses(userId: string): Promise<IQuestProgress[]> {
    try {
      return await QuestProgress.find({ userId, resetAt: { $gt: new Date() } });
    } catch (error) {
      logger.error(`[QuestRepository] Lỗi khi lấy danh sách tiến trình nhiệm vụ của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Tạo mới hoặc lấy tiến trình nhiệm vụ
   */
  async getOrCreateProgress(userId: string, questId: string, resetAt: Date): Promise<IQuestProgress> {
    try {
      let progress = await QuestProgress.findOne({ userId, questId });
      if (!progress) {
        progress = new QuestProgress({
          userId,
          questId,
          currentCount: 0,
          claimed: false,
          resetAt
        });
        await progress.save();
      } else if (progress.resetAt.getTime() <= Date.now()) {
        // Reset tiến trình nếu đã qua thời gian reset
        progress.currentCount = 0;
        progress.claimed = false;
        progress.resetAt = resetAt;
        await progress.save();
      }
      return progress;
    } catch (error) {
      logger.error(`[QuestRepository] Lỗi getOrCreateProgress cho questId ${questId}:`, error);
      throw error;
    }
  }

  /**
   * Lưu lịch sử hoàn thành nhiệm vụ
   */
  async saveHistory(history: Partial<IQuestHistory>): Promise<IQuestHistory> {
    try {
      const log = new QuestHistory(history);
      return await log.save();
    } catch (error) {
      logger.error('[QuestRepository] Lỗi khi lưu lịch sử nhiệm vụ:', error);
      throw error;
    }
  }
}

export const questRepository = new QuestRepository();
