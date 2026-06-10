import { redisClient } from '../index.js';
import User from '../database/models/User.js';
import logger from '../core/logger.js';

// Local memory storage as absolute fallback if Redis server is down
const localXPCache: Map<string, number> = new Map();
const localCooldownCache: Map<string, number> = new Map();

/**
 * Thêm Cooldown cho User (Mặc định 60 giây chống Spam XP)
 */
export async function isOnXPCooldown(userId: string): Promise<boolean> {
  const key = `cooldown:xp:${userId}`;
  try {
    const isRedisOpen = redisClient && redisClient.isReady;
    if (isRedisOpen) {
      const exists = await redisClient.get(key);
      if (exists) return true;
      await redisClient.set(key, '1', { EX: 60 });
      return false;
    } else {
      const now = Date.now();
      const lastTime = localCooldownCache.get(userId);
      if (lastTime && now - lastTime < 60000) {
        return true;
      }
      localCooldownCache.set(userId, now);
      return false;
    }
  } catch (err) {
    logger.error('[Redis Cache] Check Cooldown Error:', err);
    return false;
  }
}

/**
 * Tích lũy XP tạm thời vào bộ nhớ đệm (Redis / Memory)
 */
export async function addXPToCache(userId: string, amount: number) {
  const key = `xp:accumulate:${userId}`;
  try {
    const isRedisOpen = redisClient && redisClient.isReady;
    if (isRedisOpen) {
      await redisClient.incrBy(key, amount);
    } else {
      const current = localXPCache.get(userId) || 0;
      localXPCache.set(userId, current + amount);
    }
  } catch (err) {
    logger.error('[Redis Cache] Accumulate XP Error:', err);
    const current = localXPCache.get(userId) || 0;
    localXPCache.set(userId, current + amount);
  }
}

/**
 * Đồng bộ hóa toàn bộ XP từ Cache xuống MongoDB một cách tối ưu bằng Batch Update
 */
export async function flushXPCacheToDB() {
  logger.info('[System Cache] Đang thực hiện ghi Bulk-Update XP từ Cache xuống DB...');
  const bulkOps: any[] = [];
  const matchedUsers: { userId: string; amount: number }[] = [];

  try {
    const isRedisOpen = redisClient && redisClient.isReady;
    if (isRedisOpen) {
      const keys = await redisClient.keys('xp:accumulate:*');
      for (const key of keys as any[]) {
        const keyStr = key as string;
        const userId = keyStr.replace('xp:accumulate:', '');
        const valStr = await redisClient.get(keyStr);
        if (valStr) {
          const amount = parseInt(valStr as any, 10);
          if (amount > 0) {
            matchedUsers.push({ userId, amount });
          }
          await redisClient.del(keyStr);
        }
      }
    } else {
      for (const [userId, amount] of localXPCache.entries()) {
        if (amount > 0) {
          matchedUsers.push({ userId, amount });
        }
      }
      localXPCache.clear();
    }

    if (matchedUsers.length === 0) {
      logger.info('[System Cache] Không có dữ liệu XP mới để đồng bộ.');
      return;
    }

    for (const item of matchedUsers) {
      bulkOps.push({
        updateOne: {
          filter: { discordId: item.userId },
          update: { $inc: { exp: item.amount } }
        }
      });
    }

    const result = await (User as any).bulkWrite(bulkOps);
    logger.info(`[System Cache] Đồng bộ thành công! Đã ghi nhận XP cho ${result.modifiedCount} tăng sĩ.`);
  } catch (error) {
    logger.error('[System Cache] Lỗi khi thực hiện Flush XP Cache:', error);
  }
}

/**
 * Cơ chế Khóa Phân Tán (Distributed Lock) dùng trong các phiên hoạt động Concurrency cao
 */
export async function acquireLock(lockName: string, ttlSeconds: number = 3): Promise<boolean> {
  const isRedisOpen = redisClient && redisClient.isReady;
  if (!isRedisOpen) {
    return true; 
  }
  try {
    const lockKey = `lock:${lockName}`;
    const result = await redisClient.set(lockKey, 'locked', {
      NX: true, 
      EX: ttlSeconds
    });
    return result === 'OK';
  } catch (err) {
    logger.error('[Redis Core] Acquire Lock Error:', err);
    return true; 
  }
}

/**
 * Giải phóng khóa
 */
export async function releaseLock(lockName: string) {
  const isRedisOpen = redisClient && redisClient.isReady;
  if (!isRedisOpen) return;
  try {
    const lockKey = `lock:${lockName}`;
    await redisClient.del(lockKey);
  } catch (err) {
    logger.error('[Redis Core] Release Lock Error:', err);
  }
}

// Local anti-spam storage as absolute fallback if Redis is down
const localSpamCounter: Map<string, { count: number; resetTime: number }> = new Map();
const localBlockedUsers: Map<string, number> = new Map();

/**
 * Kiểm tra chống Spam lệnh toàn cục sử dụng Redis (hoặc Fallback Local Memory)
 * Giới hạn: Tối đa 3 lệnh trong vòng 10 giây. Vượt quá sẽ bị khóa 30 giây.
 */
export async function checkUserSpamLimit(userId: string, guildId: string): Promise<{ isSpamming: boolean; timeLeft: number }> {
  const blockKey = `spam:blocked:${guildId}:${userId}`;
  const counterKey = `spam:counter:${guildId}:${userId}`;
  
  try {
    const isRedisOpen = redisClient && redisClient.isReady;
    
    if (isRedisOpen) {
      const blocked = await redisClient.get(blockKey);
      if (blocked) {
        const ttl = await redisClient.ttl(blockKey);
        return { isSpamming: true, timeLeft: ttl > 0 ? ttl : 30 };
      }
      
      const currentCountStr = await redisClient.get(counterKey);
      let count = (typeof currentCountStr === 'string') ? parseInt(currentCountStr, 10) : 0;
      
      if (count >= 3) {
        await redisClient.set(blockKey, '1', { EX: 30 });
        await redisClient.del(counterKey);
        return { isSpamming: true, timeLeft: 30 };
      }
      
      if (count === 0) {
        await redisClient.set(counterKey, '1', { EX: 10 });
      } else {
        await redisClient.incr(counterKey);
      }
      return { isSpamming: false, timeLeft: 0 };
    } else {
      const now = Date.now();
      const userSpamKey = `${guildId}:${userId}`;
      
      const blockedUntil = localBlockedUsers.get(userSpamKey);
      if (blockedUntil && now < blockedUntil) {
        return { isSpamming: true, timeLeft: Math.ceil((blockedUntil - now) / 1000) };
      } else if (blockedUntil && now >= blockedUntil) {
        localBlockedUsers.delete(userSpamKey);
      }
      
      let data = localSpamCounter.get(userSpamKey);
      if (!data || now > data.resetTime) {
        localSpamCounter.set(userSpamKey, { count: 1, resetTime: now + 10000 });
        return { isSpamming: false, timeLeft: 0 };
      }
      
      data.count += 1;
      if (data.count > 3) {
        localBlockedUsers.set(userSpamKey, now + 30000);
        localSpamCounter.delete(userSpamKey);
        return { isSpamming: true, timeLeft: 30 };
      }
      
      return { isSpamming: false, timeLeft: 0 };
    }
  } catch (err) {
    logger.error('[Anti-Spam Check] Error:', err);
    return { isSpamming: false, timeLeft: 0 };
  }
}
