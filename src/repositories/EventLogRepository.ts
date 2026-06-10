import EventLog, { IEventLog, EventLogType } from '../database/models/EventLog.js';
import logger from '../core/logger.js';
import crypto from 'crypto';

export class EventLogRepository {
  /**
   * Lưu trữ một sự kiện nghiệp vụ mới
   */
  async logEvent(
    eventType: EventLogType,
    userId: string,
    guildId: string,
    payload: Record<string, any>
  ): Promise<IEventLog> {
    try {
      const eventId = crypto.randomUUID();
      const newLog = new EventLog({
        eventId,
        eventType,
        userId,
        guildId,
        payload
      });
      const saved = await newLog.save();
      logger.debug(`[EventLogRepository] Đã lưu sự kiện ${eventType} (ID: ${eventId}) cho user ${userId}`);
      return saved;
    } catch (error) {
      logger.error(`[EventLogRepository] Lỗi khi lưu sự kiện ${eventType} của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Truy vấn lịch sử sự kiện theo bộ lọc
   */
  async getEvents(
    filter: { userId?: string; guildId?: string; eventType?: EventLogType },
    limit: number = 50
  ): Promise<IEventLog[]> {
    try {
      return await EventLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('[EventLogRepository] Lỗi khi truy vấn danh sách sự kiện:', error);
      throw error;
    }
  }
}

export const eventLogRepository = new EventLogRepository();
