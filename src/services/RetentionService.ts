import LoginStreak, { ILoginStreak } from '../database/models/LoginStreak.js';
import RewardHistory, { IRewardHistory } from '../database/models/RewardHistory.js';
import { userRepository } from '../repositories/UserRepository.js';
import { gameConfigService } from './GameConfigService.js';
import { checkLevelUp } from '../utils/levelUtils.js';
import { eventBus } from '../core/EventBus.js';
import logger from '../core/logger.js';

interface DailyRewardsConfig {
  base_coins: number;
  base_exp: number;
  streaks: Record<string, {
    coins_multiplier?: number;
    exp_bonus?: number;
    combat_power_bonus?: number;
    desc: string;
  }>;
}

export class RetentionService {
  /**
   * Thực hiện điểm danh hàng ngày và tính toán phần thưởng (Daily, Weekly, Comeback, Loyalty)
   */
  async processDailyCheckin(
    userId: string,
    guildId: string,
    member: any
  ): Promise<{
    success: boolean;
    streak: number;
    coinsAwarded: number;
    expAwarded: number;
    combatPowerAwarded: number;
    bonusesClaimed: string[];
    newBalance: number;
    error?: string;
  }> {
    try {
      const user = await userRepository.getByDiscordId(userId);
      if (!user || !user.registered) {
        return { success: false, streak: 0, coinsAwarded: 0, expAwarded: 0, combatPowerAwarded: 0, bonusesClaimed: [], newBalance: 0, error: 'Đồng đạo chưa đăng ký tài khoản tông môn!' };
      }

      const now = new Date();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const twoDaysMs = 48 * 60 * 60 * 1000;

      // 1. Lấy hoặc tạo hồ sơ LoginStreak
      let streakDoc = await LoginStreak.findOne({ userId });
      if (!streakDoc) {
        streakDoc = new LoginStreak({
          userId,
          currentStreak: 0,
          maxStreak: 0,
          lastLoginDate: null
        });
      }

      // 2. Kiểm tra Cooldown điểm danh (24 giờ)
      if (streakDoc.lastLoginDate) {
        const timeDiff = now.getTime() - streakDoc.lastLoginDate.getTime();
        if (timeDiff < oneDayMs) {
          return { success: false, streak: streakDoc.currentStreak, coinsAwarded: 0, expAwarded: 0, combatPowerAwarded: 0, bonusesClaimed: [], newBalance: user.balance, error: 'Đồng đạo hôm nay đã điểm danh rồi, vui lòng quay lại sau!' };
        }

        // Kiểm tra giữ chuỗi (Đăng nhập cách lần cuối dưới 48 giờ -> tăng chuỗi, ngược lại reset chuỗi)
        if (timeDiff > twoDaysMs) {
          streakDoc.currentStreak = 1;
        } else {
          streakDoc.currentStreak += 1;
        }
      } else {
        // Điểm danh lần đầu tiên
        streakDoc.currentStreak = 1;
      }

      // Cập nhật maxStreak
      if (streakDoc.currentStreak > streakDoc.maxStreak) {
        streakDoc.maxStreak = streakDoc.currentStreak;
      }

      const lastLoginDateBeforeUpdate = streakDoc.lastLoginDate;
      streakDoc.lastLoginDate = now;
      await streakDoc.save();

      // 3. Đọc cấu hình Rewards từ Database (Config Driven Design)
      const dailyConfig = await gameConfigService.getConfig<DailyRewardsConfig>('daily_rewards', {
        base_coins: 100,
        base_exp: 50,
        streaks: {
          '3': { coins_multiplier: 1.5, desc: 'Mốc 3 ngày: Nhân sâm vạn năm' },
          '7': { coins_multiplier: 2.0, exp_bonus: 100, desc: 'Mốc 7 ngày: Đan dược Nhị Phẩm' },
          '15': { coins_multiplier: 3.5, exp_bonus: 250, desc: 'Mốc 15 ngày: Huyết Cực Linh Chi Đạo Nhãn' },
          '30': { coins_multiplier: 6.0, exp_bonus: 550, combat_power_bonus: 1000, desc: 'Mốc Thánh Nhân 30 ngày: Đột phá Thiên Cơ Đế Tông Ấn' }
        }
      });

      let coinReward = dailyConfig.base_coins;
      let expReward = dailyConfig.base_exp;
      let combatPowerReward = 0;
      const bonusesClaimed: string[] = [];

      const currentStreak = streakDoc.currentStreak;
      const streakRule = dailyConfig.streaks[currentStreak.toString()];

      if (streakRule) {
        if (streakRule.coins_multiplier) {
          coinReward = Math.floor(coinReward * streakRule.coins_multiplier);
        }
        if (streakRule.exp_bonus) {
          expReward += streakRule.exp_bonus;
        }
        if (streakRule.combat_power_bonus) {
          combatPowerReward += streakRule.combat_power_bonus;
        }
        bonusesClaimed.push(streakRule.desc);
      }

      // Xử lý ghi nhận Weekly Reward nếu đạt mốc chia hết cho 7
      if (currentStreak % 7 === 0 && currentStreak !== 7) {
        // Thưởng thêm mốc tuần tích lũy
        coinReward += 100;
        expReward += 50;
        bonusesClaimed.push(`Quy luật tuần hoàn 7 ngày: +100 Xu, +50 XP`);
      }

      // 4. Kiểm tra và trao Comeback Reward (Nếu vắng mặt >= 14 ngày)
      let isComeback = false;
      if (lastLoginDateBeforeUpdate) {
        const timeDiff = now.getTime() - lastLoginDateBeforeUpdate.getTime();
        const comebackThreshold = 14 * oneDayMs; // 14 Ngày
        if (timeDiff >= comebackThreshold) {
          isComeback = true;
        }
      }

      if (isComeback) {
        const comebackConfig = await gameConfigService.getConfig<{ coins: number; exp: number }>('comeback_rewards', {
          coins: 500,
          exp: 200
        });
        coinReward += comebackConfig.coins;
        expReward += comebackConfig.exp;
        bonusesClaimed.push(`🎁 Quà Tái Xuất Giang Hồ: +${comebackConfig.coins} Xu, +${comebackConfig.exp} XP`);

        // Ghi lịch sử quà Comeback
        await new RewardHistory({
          userId,
          rewardType: 'comeback',
          rewardCoins: comebackConfig.coins,
          rewardExp: comebackConfig.exp
        }).save();
      }

      // 5. Kiểm tra và trao Loyalty Reward (Nếu tuổi tài khoản >= 30 ngày và chưa nhận)
      const accountAge = now.getTime() - user.createdAt.getTime();
      const loyaltyThreshold = 30 * oneDayMs; // 30 Ngày
      if (accountAge >= loyaltyThreshold) {
        // Kiểm tra xem đã từng nhận quà Loyalty chưa
        const alreadyClaimedLoyalty = await RewardHistory.findOne({ userId, rewardType: 'loyalty' });
        if (!alreadyClaimedLoyalty) {
          const loyaltyConfig = await gameConfigService.getConfig<{ coins: number; exp: number }>('loyalty_rewards', {
            coins: 1000,
            exp: 500
          });
          coinReward += loyaltyConfig.coins;
          expReward += loyaltyConfig.exp;
          bonusesClaimed.push(`🎖️ Quà Tri Ân Tiên Nhân Kỳ Cựu (30 ngày): +${loyaltyConfig.coins} Xu, +${loyaltyConfig.exp} XP`);

          // Ghi lịch sử quà Loyalty
          await new RewardHistory({
            userId,
            rewardType: 'loyalty',
            rewardCoins: loyaltyConfig.coins,
            rewardExp: loyaltyConfig.exp
          }).save();
        }
      }

      // 6. Cập nhật số dư người chơi và thăng cấp
      user.balance += coinReward;
      user.exp += expReward;
      user.combatPower += combatPowerReward;
      
      // Đồng bộ hóa dailyStreak và lastDaily để tương thích với User model cũ
      user.dailyStreak = currentStreak;
      user.lastDaily = now;

      const levelUpResult = await checkLevelUp(user, member);
      await user.save();

      // Lưu lịch sử quà Daily
      await new RewardHistory({
        userId,
        rewardType: 'daily',
        rewardCoins: coinReward,
        rewardExp: expReward
      }).save();

      // Phát sự kiện lên cấp (nếu có)
      if (levelUpResult.leveledUp) {
        // Sự kiện LevelUp được phát ra tự động trong checkLevelUp nhưng chúng ta có EventBus ghi đè
        eventBus.emitEvent('level_up', {
          userId,
          guildId,
          oldLevel: user.level - 1,
          newLevel: user.level
        });
      }

      logger.info(`[RetentionService] Đã điểm danh cho user ${userId}: Chuỗi ${currentStreak} ngày. Nhận 🪙 ${coinReward} Xu, +${expReward} XP`);

      return {
        success: true,
        streak: currentStreak,
        coinsAwarded: coinReward,
        expAwarded: expReward,
        combatPowerAwarded: combatPowerReward,
        bonusesClaimed,
        newBalance: user.balance
      };
    } catch (error) {
      logger.error(`[RetentionService] Lỗi khi xử lý điểm danh cho user ${userId}:`, error);
      return { success: false, streak: 0, coinsAwarded: 0, expAwarded: 0, combatPowerAwarded: 0, bonusesClaimed: [], newBalance: 0, error: 'Lỗi thiên thạch khi tính toán chuỗi điểm danh.' };
    }
  }
}

export const retentionService = new RetentionService();
