import { achievementRepository } from '../repositories/AchievementRepository.js';
import { playerStatsRepository } from '../repositories/PlayerStatsRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { titleService } from './TitleService.js';
import { seasonRepository } from '../repositories/SeasonRepository.js';
import { eventBus } from '../core/EventBus.js';
import { checkLevelUp } from '../utils/levelUtils.js';
import logger from '../core/logger.js';
import Achievement, { IAchievement } from '../database/models/Achievement.js';

export class AchievementService {
  /**
   * Đăng ký lắng nghe sự kiện từ Event Bus
   */
  init(): void {
    logger.info('[AchievementService] Đang khởi tạo Event Listeners cho Achievement Engine...');

    eventBus.onEvent('player_mined', async (data) => {
      const stats = await playerStatsRepository.incrementStat(data.userId, 'totalMines', 1);
      await this.checkAchievements(data.userId, data.guildId, 'mine_count', stats.totalMines);
    });

    eventBus.onEvent('player_fished', async (data) => {
      const stats = await playerStatsRepository.incrementStat(data.userId, 'totalFish', 1);
      await this.checkAchievements(data.userId, data.guildId, 'fish_count', stats.totalFish);
    });

    eventBus.onEvent('player_worked', async (data) => {
      const stats = await playerStatsRepository.incrementStat(data.userId, 'totalWorks', 1);
      await this.checkAchievements(data.userId, data.guildId, 'work_count', stats.totalWorks);
    });

    eventBus.onEvent('boss_damaged', async (data) => {
      const stats = await playerStatsRepository.incrementStat(data.userId, 'totalBossDamage', data.damage);
      await this.checkAchievements(data.userId, data.guildId, 'boss_damage', stats.totalBossDamage);
    });

    eventBus.onEvent('boss_killed', async (data) => {
      // Đếm số lần giết Boss qua đống EventLog hoặc tăng trực tiếp
      await this.checkAchievements(data.userId, data.guildId, 'boss_kills', 1);
    });

    eventBus.onEvent('coins_spent', async (data) => {
      const stats = await playerStatsRepository.incrementStat(data.userId, 'totalCoinsSpent', data.amount);
      await this.checkAchievements(data.userId, data.guildId, 'coins_spent', stats.totalCoinsSpent);
    });

    eventBus.onEvent('level_up', async (data) => {
      await this.checkAchievements(data.userId, data.guildId, 'level_reached', data.newLevel);
    });

    eventBus.onEvent('quest_completed', async (data) => {
      const stats = await playerStatsRepository.incrementStat(data.userId, 'totalQuestCompletions', 1);
      await this.checkAchievements(data.userId, data.guildId, 'quest_completions', stats.totalQuestCompletions);
    });

    eventBus.onEvent('guild_donation', async (data) => {
      const stats = await playerStatsRepository.incrementStat(data.userId, 'totalDonations', data.amount);
      await this.checkAchievements(data.userId, data.guildId, 'guild_donations', stats.totalDonations);
    });
  }

  /**
   * Kiểm tra điều kiện mở khóa thành tựu của người chơi
   */
  async checkAchievements(
    userId: string,
    guildId: string,
    criteriaType: string,
    currentValue: number
  ): Promise<void> {
    try {
      // 1. Lấy tất cả thành tựu khớp với tiêu chí này
      const achievements = await Achievement.find({ criteriaType });
      if (achievements.length === 0) return;

      // 2. Lấy các thành tựu người chơi đã mở khóa
      const unlockedDocs = await achievementRepository.getUnlockedAchievements(userId);
      const unlockedSet = new Set(unlockedDocs.map(d => d.achievementId));

      // Lấy mùa giải đang hoạt động
      const activeSeason = await seasonRepository.getActiveSeason();
      const seasonId = activeSeason ? activeSeason.seasonId : '';

      for (const ach of achievements) {
        // Bỏ qua nếu đã mở khóa
        if (unlockedSet.has(ach.achievementId)) continue;

        // Kiểm tra xem đã đạt giá trị mục tiêu chưa
        if (currentValue >= ach.targetValue) {
          // Lưu trạng thái mở khóa thành tựu
          await achievementRepository.unlockAchievement(userId, ach.achievementId, seasonId);
          logger.info(`[AchievementService] Người chơi ${userId} đã mở khóa thành tựu: ${ach.name}`);

          // Trao thưởng
          const user = await userRepository.getByDiscordId(userId);
          if (user) {
            user.balance += ach.rewardCoins;
            user.exp += ach.rewardExp;
            
            // Xử lý lên cấp nếu đủ XP
            const levelUpResult = await checkLevelUp(user, null);
            await user.save();
          }

          // Trao danh hiệu nếu có
          if (ach.rewardTitle) {
            await titleService.unlockTitle(userId, guildId, ach.rewardTitle);
          }

          // Phát sự kiện mở khóa thành tựu trên Event Bus
          eventBus.emitEvent('achievement_unlocked', {
            userId,
            guildId,
            achievementId: ach.achievementId,
            name: ach.name
          });
        }
      }
    } catch (error) {
      logger.error(`[AchievementService] Lỗi khi kiểm tra thành tựu ${criteriaType} cho user ${userId}:`, error);
    }
  }

  /**
   * Lấy danh sách thành tựu hiển thị của người chơi
   */
  async getPlayerAchievementsList(userId: string): Promise<Array<{
    achievementId: string;
    name: string;
    description: string;
    category: string;
    targetValue: number;
    currentValue: number;
    completed: boolean;
    rewardCoins: number;
    rewardExp: number;
    rewardTitle?: string;
    isHidden: boolean;
  }>> {
    try {
      const allAchievements = await achievementRepository.getAllAchievements();
      const unlockedDocs = await achievementRepository.getUnlockedAchievements(userId);
      const unlockedSet = new Set(unlockedDocs.map(d => d.achievementId));

      const stats = await playerStatsRepository.getOrCreate(userId);
      const user = await userRepository.getByDiscordId(userId);
      const userLevel = user ? user.level : 1;

      // Hàm ánh xạ từ criteriaType sang chỉ số thực tế
      const getStatValue = (criteriaType: string): number => {
        switch (criteriaType) {
          case 'mine_count': return stats.totalMines;
          case 'fish_count': return stats.totalFish;
          case 'work_count': return stats.totalWorks;
          case 'boss_damage': return stats.totalBossDamage;
          case 'coins_spent': return stats.totalCoinsSpent;
          case 'quest_completions': return stats.totalQuestCompletions;
          case 'guild_donations': return stats.totalDonations;
          case 'level_reached': return userLevel;
          default: return 0;
        }
      };

      return allAchievements.map(ach => {
        const completed = unlockedSet.has(ach.achievementId);
        const currentValue = getStatValue(ach.criteriaType);

        // Ẩn nội dung nếu là thành tựu ẩn và chưa được mở khóa
        const displayDescription = ach.isHidden && !completed
          ? '❔ Thành tựu ẩn (Vận hành thiên cơ mới hiển lộ)'
          : ach.description;

        const displayName = ach.isHidden && !completed
          ? '❔❔❔'
          : ach.name;

        return {
          achievementId: ach.achievementId,
          name: displayName,
          description: displayDescription,
          category: ach.category,
          targetValue: ach.targetValue,
          currentValue: completed ? ach.targetValue : currentValue,
          completed,
          rewardCoins: ach.rewardCoins,
          rewardExp: ach.rewardExp,
          rewardTitle: ach.rewardTitle,
          isHidden: ach.isHidden
        };
      });
    } catch (error) {
      logger.error(`[AchievementService] Lỗi khi lấy danh sách thành tựu hiển thị cho user ${userId}:`, error);
      throw error;
    }
  }
}

export const achievementService = new AchievementService();
