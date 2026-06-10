import { redisClient } from '../index.js';
import User from '../database/models/User.js';
import Guild from '../database/models/Guild.js';
import QuestHistory from '../database/models/QuestHistory.js';
import QuestProgress from '../database/models/QuestProgress.js';
import UserAchievement from '../database/models/UserAchievement.js';
import Achievement from '../database/models/Achievement.js';
import logger from '../core/logger.js';

export class MetricsService {
  // Bộ nhớ đệm fallback khi không có Redis
  private localDau: Set<string> = new Set();
  private localWau: Set<string> = new Set();
  private localMau: Set<string> = new Set();

  private currentDateStr: string = '';
  private currentWeekStr: string = '';
  private currentMonthStr: string = '';

  constructor() {
    const now = new Date();
    this.currentDateStr = now.toISOString().split('T')[0];
    this.currentWeekStr = `${now.getFullYear()}-W${this.getWeekNumber(now)}`;
    this.currentMonthStr = `${now.getFullYear()}-${now.getMonth() + 1}`;
  }

  /**
   * Tính số tuần trong năm
   */
  private getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const sunday = 0;
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Ghi nhận hoạt động của người chơi để tính toán DAU, WAU, MAU
   */
  async trackUserActivity(userId: string): Promise<void> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const thisWeek = `${now.getFullYear()}-W${this.getWeekNumber(now)}`;
      const thisMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

      // Dọn dẹp local sets nếu qua ngày/tuần/tháng mới để tránh đầy RAM
      if (this.currentDateStr !== today) {
        this.localDau.clear();
        this.currentDateStr = today;
      }
      if (this.currentWeekStr !== thisWeek) {
        this.localWau.clear();
        this.currentWeekStr = thisWeek;
      }
      if (this.currentMonthStr !== thisMonth) {
        this.localMau.clear();
        this.currentMonthStr = thisMonth;
      }

      if (redisClient && redisClient.isReady) {
        const dauKey = `metrics:dau:${today}`;
        const wauKey = `metrics:wau:${thisWeek}`;
        const mauKey = `metrics:mau:${thisMonth}`;

        await redisClient.sAdd(dauKey, userId);
        await redisClient.expire(dauKey, 172800); // Hết hạn sau 2 ngày

        await redisClient.sAdd(wauKey, userId);
        await redisClient.expire(wauKey, 1209600); // Hết hạn sau 14 ngày

        await redisClient.sAdd(mauKey, userId);
        await redisClient.expire(mauKey, 5184000); // Hết hạn sau 60 ngày
      } else {
        // Ghi vào local sets
        this.localDau.add(userId);
        this.localWau.add(userId);
        this.localMau.add(userId);
      }
    } catch (error) {
      logger.error(`[MetricsService] Lỗi khi ghi nhận hoạt động cho user ${userId}:`, error);
    }
  }

  /**
   * Tổng hợp các chỉ số vận hành hệ thống
   */
  async getMetrics(): Promise<{
    activeUsers: {
      dau: number;
      wau: number;
      mau: number;
    };
    totals: {
      registeredUsers: number;
      guilds: number;
      questsCompleted: number;
      achievementsUnlocked: number;
    };
    rates: {
      questCompletionRate: string;
      achievementUnlockRate: string;
      guildCreationRate7d: number;
    };
  }> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const thisWeek = `${now.getFullYear()}-W${this.getWeekNumber(now)}`;
      const thisMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;

      let dau = 0;
      let wau = 0;
      let mau = 0;

      if (redisClient && redisClient.isReady) {
        dau = await redisClient.sCard(`metrics:dau:${today}`) || 0;
        wau = await redisClient.sCard(`metrics:wau:${thisWeek}`) || 0;
        mau = await redisClient.sCard(`metrics:mau:${thisMonth}`) || 0;
      } else {
        dau = this.localDau.size;
        wau = this.localWau.size;
        mau = this.localMau.size;
      }

      // Đếm dữ liệu tổng hợp từ MongoDB
      const registeredUsers = await User.countDocuments({ registered: true });
      const guilds = await Guild.countDocuments({});
      const questsCompleted = await QuestHistory.countDocuments({});
      const activeQuestProgress = await QuestProgress.countDocuments({});
      const achievementsUnlocked = await UserAchievement.countDocuments({});
      const totalAchievements = await Achievement.countDocuments({});

      // Tính tỷ lệ hoàn thành nhiệm vụ
      const totalQuestAttempts = questsCompleted + activeQuestProgress;
      const questCompletionRate = totalQuestAttempts > 0 
        ? `${((questsCompleted / totalQuestAttempts) * 100).toFixed(1)}%` 
        : '0%';

      // Tính tỷ lệ mở khóa thành tựu toàn hệ thống
      const totalPossibleUnlocks = registeredUsers * totalAchievements;
      const achievementUnlockRate = totalPossibleUnlocks > 0
        ? `${((achievementsUnlocked / totalPossibleUnlocks) * 100).toFixed(1)}%`
        : '0%';

      // Số lượng guild tạo mới trong 7 ngày qua
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const guildCreationRate7d = await Guild.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

      return {
        activeUsers: { dau, wau, mau },
        totals: {
          registeredUsers,
          guilds,
          questsCompleted,
          achievementsUnlocked
        },
        rates: {
          questCompletionRate,
          achievementUnlockRate,
          guildCreationRate7d
        }
      };
    } catch (error) {
      logger.error('[MetricsService] Lỗi khi tổng hợp metrics:', error);
      throw error;
    }
  }
}

export const metricsService = new MetricsService();
