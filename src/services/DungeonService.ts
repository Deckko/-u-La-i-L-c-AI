import { dungeonRepository } from '../repositories/DungeonRepository.js';
import { IDungeonSession } from '../database/models/Dungeon.js';
import logger from '../core/logger.js';

export class DungeonService {
  /**
   * Khởi chạy phiên đi phó bản mới
   */
  async startDungeon(userId: string, dungeonId: string): Promise<{ success: boolean; session?: IDungeonSession; error?: string }> {
    try {
      const active = await dungeonRepository.getActiveSession(userId);
      if (active) {
        return { success: false, error: 'Đồng đạo hiện đang mắc kẹt trong một phó bản khác, hãy thối lui hoặc hoàn thành trước!' };
      }

      const session = await dungeonRepository.createSession(userId, dungeonId);
      logger.info(`[DungeonService] Người chơi ${userId} đã bước vào phó bản ${dungeonId}`);
      return { success: true, session };
    } catch (error) {
      logger.error(`[DungeonService] Lỗi khi bắt đầu phó bản cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi pháp trận phó bản.' };
    }
  }

  /**
   * Tiến lên tầng tiếp theo trong phó bản
   */
  async advanceFloor(userId: string): Promise<{ success: boolean; session?: IDungeonSession; error?: string }> {
    try {
      const session = await dungeonRepository.getActiveSession(userId);
      if (!session) {
        return { success: false, error: 'Đồng đạo hiện không ở trong phó bản nào.' };
      }

      session.currentFloor += 1;
      
      // Giới hạn tối đa phó bản là 10 tầng
      if (session.currentFloor > 10) {
        session.status = 'completed';
        session.completedAt = new Date();
      }

      await session.save();
      logger.info(`[DungeonService] User ${userId} đã tiến lên tầng ${session.currentFloor} trong phó bản ${session.dungeonId}`);
      return { success: true, session };
    } catch (error) {
      logger.error(`[DungeonService] Lỗi khi leo tầng phó bản cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi trận pháp dịch chuyển tầng.' };
    }
  }
}

export const dungeonService = new DungeonService();
