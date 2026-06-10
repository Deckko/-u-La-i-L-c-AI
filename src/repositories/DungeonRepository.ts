import DungeonSession, { IDungeonSession } from '../database/models/Dungeon.js';
import logger from '../core/logger.js';
import crypto from 'crypto';

export class DungeonRepository {
  /**
   * Tạo phiên vượt ải mới
   */
  async createSession(userId: string, dungeonId: string): Promise<IDungeonSession> {
    try {
      const sessionId = crypto.randomUUID();
      const session = new DungeonSession({
        sessionId,
        userId,
        dungeonId,
        status: 'active',
        currentFloor: 1
      });
      return await session.save();
    } catch (error) {
      logger.error(`[DungeonRepository] Lỗi khi tạo DungeonSession cho user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy phiên hoạt động của người chơi
   */
  async getActiveSession(userId: string): Promise<IDungeonSession | null> {
    try {
      return await DungeonSession.findOne({ userId, status: 'active' });
    } catch (error) {
      logger.error(`[DungeonRepository] Lỗi khi lấy DungeonSession của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin phiên vượt ải
   */
  async updateSession(sessionId: string, updates: Partial<IDungeonSession>): Promise<IDungeonSession | null> {
    try {
      return await DungeonSession.findOneAndUpdate(
        { sessionId },
        { $set: updates },
        { new: true }
      );
    } catch (error) {
      logger.error(`[DungeonRepository] Lỗi khi cập nhật DungeonSession ${sessionId}:`, error);
      throw error;
    }
  }
}

export const dungeonRepository = new DungeonRepository();
