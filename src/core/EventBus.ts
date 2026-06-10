import { EventEmitter } from 'events';
import { eventLogRepository } from '../repositories/EventLogRepository.js';
import { EventLogType } from '../database/models/EventLog.js';
import logger from './logger.js';

// Định nghĩa các loại Event Payload để đảm bảo Type-Safety
export interface EventPayloads {
  player_mined: { userId: string; guildId: string; coinsEarned: number; expEarned: number; lootTier: string };
  player_fished: { userId: string; guildId: string; coinsEarned: number; expEarned: number; fishWeight: number };
  player_worked: { userId: string; guildId: string; coinsEarned: number; expEarned: number };
  boss_damaged: { userId: string; guildId: string; bossId: string; damage: number };
  boss_killed: { userId: string; guildId: string; bossId: string };
  guild_donation: { userId: string; guildId: string; amount: number };
  coins_spent: { userId: string; guildId: string; amount: number; purpose: string };
  level_up: { userId: string; guildId: string; oldLevel: number; newLevel: number };
  user_registered: { userId: string; username: string };
  guild_created: { guildId: string; masterId: string; name: string };
  guild_joined: { userId: string; guildId: string };
  achievement_unlocked: { userId: string; guildId: string; achievementId: string; name: string };
  quest_completed: { userId: string; guildId: string; questId: string; type: string };
  title_unlocked: { userId: string; guildId: string; titleId: string; titleName: string };
}

// Ánh xạ từ Runtime Event Name sang DB EventLogType
const PERSISTENT_EVENT_MAPPING: Record<keyof EventPayloads, EventLogType | null> = {
  player_mined: null,
  player_fished: null,
  player_worked: null,
  boss_damaged: null,
  boss_killed: 'BossKill',
  guild_donation: 'GuildDonate',
  coins_spent: null,
  level_up: 'LevelUp',
  user_registered: null,
  guild_created: 'GuildCreate',
  guild_joined: 'GuildJoin',
  achievement_unlocked: 'AchievementUnlock',
  quest_completed: 'QuestComplete',
  title_unlocked: 'TitleUnlock',
};

class TypedEventBus extends EventEmitter {
  /**
   * Phát ra một sự kiện trong hệ thống
   */
  emitEvent<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]): boolean {
    logger.debug(`[EventBus] Phát sự kiện: ${event} | Payload: ${JSON.stringify(payload)}`);
    
    // 1. Kích hoạt các callback chạy tại Runtime
    const result = this.emit(event, payload);

    // 2. Tự động ghi nhận xuống MongoDB đối với các sự kiện quan trọng
    const dbEventType = PERSISTENT_EVENT_MAPPING[event];
    if (dbEventType) {
      const { userId, guildId, ...details } = payload as any;
      eventLogRepository.logEvent(dbEventType, userId || 'system', guildId || 'global', details)
        .catch(err => {
          logger.error(`[EventBus] Lỗi tự động lưu EventLog cho sự kiện ${event}:`, err);
        });
    }

    return result;
  }

  /**
   * Đăng ký lắng nghe sự kiện
   */
  onEvent<K extends keyof EventPayloads>(event: K, listener: (payload: EventPayloads[K]) => void): this {
    return this.on(event, listener);
  }
}

export const eventBus = new TypedEventBus();
// Tăng giới hạn Listener để tránh cảnh báo Memory Leak khi có nhiều service lắng nghe
eventBus.setMaxListeners(30);
