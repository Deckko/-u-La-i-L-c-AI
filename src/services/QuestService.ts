import { questRepository } from '../repositories/QuestRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { eventBus } from '../core/EventBus.js';
import { checkLevelUp } from '../utils/levelUtils.js';
import logger from '../core/logger.js';
import Quest, { IQuest } from '../database/models/Quest.js';

export class QuestService {
  /**
   * Khởi động và đăng ký các Event Listeners trên Event Bus
   */
  init(): void {
    logger.info('[QuestService] Đang khởi tạo Event Listeners cho Quest Engine...');

    eventBus.onEvent('player_mined', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'mine', 1);
    });

    eventBus.onEvent('player_fished', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'fish', 1);
    });

    eventBus.onEvent('player_worked', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'work', 1);
    });

    eventBus.onEvent('boss_damaged', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'boss_damage', data.damage);
      await this.trackActivity(data.userId, data.guildId, 'boss_attack', 1);
    });

    eventBus.onEvent('boss_killed', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'boss_kill', 1);
    });

    eventBus.onEvent('guild_donation', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'donate_guild', data.amount);
    });

    eventBus.onEvent('coins_spent', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'spend_coins', data.amount);
      if (data.purpose === 'buy_shop') {
        await this.trackActivity(data.userId, data.guildId, 'buy_item', 1);
      }
    });

    eventBus.onEvent('level_up', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'level_up', data.newLevel - data.oldLevel);
    });

    eventBus.onEvent('guild_joined', async (data) => {
      await this.trackActivity(data.userId, data.guildId, 'join_guild', 1);
    });
  }

  /**
   * Tính toán thời gian Reset cho Daily, Weekly, Monthly Quests
   */
  calculateResetTime(type: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    if (type === 'daily') {
      const reset = new Date(now);
      reset.setHours(24, 0, 0, 0); // 12h đêm nay
      return reset;
    } else if (type === 'weekly') {
      const reset = new Date(now);
      const day = reset.getDay();
      const diff = reset.getDate() + (day === 0 ? 1 : 8 - day); // Thứ hai tới
      reset.setDate(diff);
      reset.setHours(0, 0, 0, 0);
      return reset;
    } else {
      const reset = new Date(now);
      reset.setMonth(reset.getMonth() + 1);
      reset.setDate(1); // Mùng 1 tháng tới
      reset.setHours(0, 0, 0, 0);
      return reset;
    }
  }

  /**
   * Theo dõi và cập nhật tiến trình nhiệm vụ của người chơi
   */
  async trackActivity(userId: string, guildId: string, action: string, amount: number): Promise<void> {
    try {
      // Tìm tất cả định nghĩa nhiệm vụ có tiêu chí hành động này
      const quests = await Quest.find({ targetAction: action });
      if (quests.length === 0) return;

      for (const quest of quests) {
        const resetAt = this.calculateResetTime(quest.type);
        const progress = await questRepository.getOrCreateProgress(userId, quest.questId, resetAt);

        // Bỏ qua nếu đã nhận thưởng rồi
        if (progress.claimed) continue;

        const isAlreadyCompleted = progress.currentCount >= quest.targetCount;
        if (isAlreadyCompleted) continue;

        // Tăng tiến trình và lưu lại
        progress.currentCount = Math.min(progress.currentCount + amount, quest.targetCount);
        await progress.save();

        logger.debug(`[QuestService] Đã cập nhật Quest ${quest.questId} cho user ${userId}: ${progress.currentCount}/${quest.targetCount}`);

        // Phát sự kiện hoàn thành nhiệm vụ nếu đạt đích lần đầu tiên
        if (progress.currentCount >= quest.targetCount) {
          logger.info(`[QuestService] Người chơi ${userId} đã HOÀN THÀNH nhiệm vụ ${quest.questId} (${quest.description})`);
          eventBus.emitEvent('quest_completed', {
            userId,
            guildId,
            questId: quest.questId,
            type: quest.type
          });
        }
      }
    } catch (error) {
      logger.error(`[QuestService] Lỗi khi theo dõi hoạt động ${action} cho user ${userId}:`, error);
    }
  }

  /**
   * Lấy danh sách nhiệm vụ của người chơi kèm trạng thái tiến trình
   */
  async getPlayerQuests(userId: string, type: 'daily' | 'weekly' | 'monthly'): Promise<Array<{ quest: IQuest; progress: number; completed: boolean; claimed: boolean }>> {
    try {
      const activeQuests = await questRepository.getQuestsByType(type);
      const progresses = await questRepository.getActiveProgresses(userId);
      const progressMap = new Map(progresses.map(p => [p.questId, p]));

      return activeQuests.map(quest => {
        const prog = progressMap.get(quest.questId);
        const currentCount = prog ? prog.currentCount : 0;
        const claimed = prog ? prog.claimed : false;

        return {
          quest,
          progress: currentCount,
          completed: currentCount >= quest.targetCount,
          claimed
        };
      });
    } catch (error) {
      logger.error(`[QuestService] Lỗi khi lấy danh sách nhiệm vụ của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Nhận phần thưởng khi hoàn thành nhiệm vụ
   */
  async claimReward(userId: string, guildId: string, questId: string, member: any): Promise<{ success: boolean; coins?: number; exp?: number; error?: string }> {
    try {
      const quest = await questRepository.getById(questId);
      if (!quest) {
        return { success: false, error: 'Không tìm thấy nhiệm vụ này trong hệ thống.' };
      }

      const progress = await questRepository.getProgress(userId, questId);
      if (!progress) {
        return { success: false, error: 'Đồng đạo chưa khởi chạy nhiệm vụ này.' };
      }

      if (progress.claimed) {
        return { success: false, error: 'Đồng đạo đã nhận thưởng nhiệm vụ này rồi!' };
      }

      if (progress.currentCount < quest.targetCount) {
        return { success: false, error: `Nhiệm vụ chưa hoàn thành! Tiến độ hiện tại: ${progress.currentCount}/${quest.targetCount}` };
      }

      // Đánh dấu đã nhận thưởng
      progress.claimed = true;
      await progress.save();

      // Cộng tiền và kinh nghiệm cho người chơi
      const user = await userRepository.getByDiscordId(userId);
      if (!user) {
        return { success: false, error: 'Không tìm thấy hồ sơ người chơi.' };
      }

      user.balance += quest.rewardCoins;
      user.exp += quest.rewardExp;
      
      const levelUpResult = await checkLevelUp(user, member);
      await user.save();

      // Lưu lịch sử nhận thưởng nhiệm vụ
      await questRepository.saveHistory({
        userId,
        questId,
        type: quest.type,
        completedAt: new Date(),
        rewardCoins: quest.rewardCoins,
        rewardExp: quest.rewardExp
      });

      logger.info(`[QuestService] User ${userId} đã nhận thưởng Quest ${questId}: +${quest.rewardCoins} Xu, +${quest.rewardExp} XP`);

      return {
        success: true,
        coins: quest.rewardCoins,
        exp: quest.rewardExp
      };
    } catch (error) {
      logger.error(`[QuestService] Lỗi khi nhận thưởng Quest ${questId} cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi thiên thạch khi nhận thưởng nhiệm vụ.' };
    }
  }
}

export const questService = new QuestService();
