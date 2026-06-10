import mongoose from 'mongoose';
import Season from '../database/models/Season.js';
import Quest from '../database/models/Quest.js';
import Achievement from '../database/models/Achievement.js';
import Title from '../database/models/Title.js';
import GameConfig from '../database/models/GameConfig.js';
import ItemEffect from '../database/models/ItemEffect.js';
import FeatureFlag from '../database/models/FeatureFlag.js';
import logger from '../core/logger.js';

export async function seedGameplayData() {
  try {
    logger.info('[Migration] Bắt đầu gieo mầm dữ liệu game (Seeding gameplay data)...');

    // 1. Seed Mùa Giải (Season)
    const activeSeason = await Season.findOne({ seasonId: 'season_1' });
    if (!activeSeason) {
      await new Season({
        seasonId: 'season_1',
        name: 'Tân Sinh Đại Hội',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 ngày
        status: 'active',
        rewardPool: {
          top1: { coins: 10000, title: 'Thiên Mệnh Chi Tử' },
          top10: { coins: 5000 },
          top100: { coins: 1000 }
        }
      }).save();
      logger.info('[Migration] Đã gieo mầm mùa giải mặc định (Season 1)');
    }

    // 2. Seed Danh Hiệu (Titles)
    const defaultTitles = [
      { titleId: 'tan_nhan', name: 'Tân Nhân', description: 'Đệ tử mới gia nhập tông môn.', rarity: 'normal' },
      { titleId: 'tho_mo_chuyen_nghiep', name: 'Thọ Mỏ Chuyên Nghiệp', description: 'Mở khóa nhờ thành tựu khai thác 100 quặng.', rarity: 'rare' },
      { titleId: 'sat_than', name: 'Sát Thần', description: 'Trảm sát thủ lãnh World Boss Đấu La.', rarity: 'legendary' },
      { titleId: 'dai_gia', name: 'Đại Gia Đấu La', description: 'Tiên nhân sở hữu số lượng Đấu Xu khổng lồ.', rarity: 'rare' },
      { titleId: 'thien_menh_chi_tu', name: 'Thiên Mệnh Chi Tử', description: 'Vô địch thiên hạ bảng xếp hạng mùa giải.', rarity: 'legendary' }
    ];

    for (const title of defaultTitles) {
      await Title.findOneAndUpdate(
        { titleId: title.titleId },
        { $set: title },
        { upsert: true }
      );
    }
    logger.info('[Migration] Đã gieo mầm định nghĩa Danh hiệu');

    // 3. Seed Nhiệm Vụ (Quests)
    const defaultQuests = [
      // Dailies
      { questId: 'daily_mine', type: 'daily', category: 'activity', targetAction: 'mine', targetCount: 10, rewardExp: 30, rewardCoins: 100, description: 'Luyện cuốc chim khai sơn 10 lần' },
      { questId: 'daily_fish', type: 'daily', category: 'activity', targetAction: 'fish', targetCount: 10, rewardExp: 30, rewardCoins: 100, description: 'Độc câu hàn giang 10 lần' },
      { questId: 'daily_work', type: 'daily', category: 'activity', targetAction: 'work', targetCount: 5, rewardExp: 40, rewardCoins: 120, description: 'Chăm chỉ làm việc tông môn 5 lần' },
      
      // Weeklies
      { questId: 'weekly_boss', type: 'weekly', category: 'combat', targetAction: 'boss_attack', targetCount: 5, rewardExp: 150, rewardCoins: 500, description: 'Tham gia vây quét World Boss 5 lần' },
      { questId: 'weekly_donate', type: 'weekly', category: 'economy', targetAction: 'donate_guild', targetCount: 200, rewardExp: 100, rewardCoins: 300, description: 'Quyên góp 200 Đấu Xu vào khố phòng bang' },
      { questId: 'weekly_spend', type: 'weekly', category: 'economy', targetAction: 'spend_coins', targetCount: 500, rewardExp: 100, rewardCoins: 300, description: 'Chi tiêu 500 Đấu Xu trong shop hoặc cá cược' },

      // Monthlies
      { questId: 'monthly_boss_damage', type: 'monthly', category: 'combat', targetAction: 'boss_damage', targetCount: 10000, rewardExp: 500, rewardCoins: 2000, description: 'Gây 10,000 sát thương tích lũy lên World Boss' },
      { questId: 'monthly_level_up', type: 'monthly', category: 'combat', targetAction: 'level_up', targetCount: 5, rewardExp: 400, rewardCoins: 1500, description: 'Đột phá tăng tiến 5 Cảnh Giới (Level)' }
    ];

    for (const q of defaultQuests) {
      await Quest.findOneAndUpdate(
        { questId: q.questId },
        { $set: q },
        { upsert: true }
      );
    }
    logger.info('[Migration] Đã gieo mầm định nghĩa Nhiệm Vụ');

    // 4. Seed Thành Tựu (Achievements)
    const defaultAchievements = [
      { achievementId: 'first_boss_kill', name: 'Đệ Nhất Kiêu Hùng', description: 'Trực tiếp tung chiêu thức kết liễu World Boss.', category: 'combat', criteriaType: 'boss_kills', targetValue: 1, rewardCoins: 1000, rewardExp: 500, rewardTitle: 'sat_than', isHidden: true, isSeasonal: false },
      { achievementId: 'mine_expert', name: 'Đại Địa Tiên Nhân', description: 'Vung cuốc rèn luyện khai thác quặng mỏ 100 lần.', category: 'activity', criteriaType: 'mine_count', targetValue: 100, rewardCoins: 500, rewardExp: 250, rewardTitle: 'tho_mo_chuyen_nghiep', isHidden: false, isSeasonal: false },
      { achievementId: 'wealthy_millionaire', name: 'Khố Phòng Đầy Ắp', description: 'Tích lũy chi tiêu 50,000 Đấu Xu.', category: 'economy', criteriaType: 'coins_spent', targetValue: 50000, rewardCoins: 1000, rewardExp: 500, rewardTitle: 'dai_gia', isHidden: false, isSeasonal: false },
      { achievementId: 'level_20', name: 'Trúc Cơ Kỳ', description: 'Tu vi đột phá thăng lên Level 20.', category: 'combat', criteriaType: 'level_reached', targetValue: 20, rewardCoins: 300, rewardExp: 150, isHidden: false, isSeasonal: false },
      { achievementId: 'level_50', name: 'Hồn Vương Cảnh', description: 'Tu vi đột phá thăng lên Level 50.', category: 'combat', criteriaType: 'level_reached', targetValue: 50, rewardCoins: 1000, rewardExp: 500, isHidden: false, isSeasonal: false }
    ];

    for (const ach of defaultAchievements) {
      await Achievement.findOneAndUpdate(
        { achievementId: ach.achievementId },
        { $set: ach },
        { upsert: true }
      );
    }
    logger.info('[Migration] Đã gieo mầm định nghĩa Thành Tựu');

    // 5. Seed Cấu hình game (GameConfig)
    const defaultConfigs = [
      {
        key: 'daily_rewards',
        value: {
          base_coins: 100,
          base_exp: 50,
          streaks: {
            '3': { coins_multiplier: 1.5, desc: 'Mốc 3 ngày: Nhân sâm vạn năm (1.5x Xu)' },
            '7': { coins_multiplier: 2.0, exp_bonus: 100, desc: 'Mốc 7 ngày: Đan dược Nhị Phẩm (2.0x Xu + 100 XP)' },
            '15': { coins_multiplier: 3.5, exp_bonus: 250, desc: 'Mốc 15 ngày: Huyết Cực Linh Chi Đạo Nhãn (3.5x Xu + 250 XP)' },
            '30': { coins_multiplier: 6.0, exp_bonus: 550, combat_power_bonus: 1000, desc: 'Mốc Thánh Nhân 30 ngày: Đột phá Thiên Cơ Đế Tông Ấn (6.0x Xu + 550 XP + 1000 Power)' }
          }
        },
        description: 'Phần thưởng điểm danh hàng ngày và theo chuỗi ngày'
      },
      {
        key: 'comeback_rewards',
        value: { coins: 500, exp: 200 },
        description: 'Quà đền bù cho đệ tử quy ẩn quay lại sau 14 ngày'
      },
      {
        key: 'loyalty_rewards',
        value: { coins: 1000, exp: 500 },
        description: 'Quà tri ân tài khoản lão làng tham gia bot trên 30 ngày'
      },
      {
        key: 'guild_creation_cost',
        value: 5000,
        description: 'Chi phí Đấu Xu để thành lập tông môn bang hội mới'
      },
      {
        key: 'guild_xp_per_coin',
        value: 0.1,
        description: 'Tỷ lệ tăng XP Bang hội trên mỗi Đấu Xu quyên góp'
      },
      {
        key: 'suspicious_growth_threshold',
        value: 100000,
        description: 'Ngưỡng Đấu Xu tăng đột biến trong 1 giờ để kích hoạt cảnh báo gian lận'
      }
    ];

    for (const cfg of defaultConfigs) {
      await GameConfig.findOneAndUpdate(
        { key: cfg.key },
        { $set: cfg },
        { upsert: true }
      );
    }
    logger.info('[Migration] Đã gieo mầm các tham số Cấu Hình Game');

    // 6. Seed Hiệu Ứng Vật Phẩm (ItemEffects)
    const defaultEffects = [
      { effectId: 'vip_pickaxe_xp', name: 'Mật Pháp Cuốc Chim VIP', effectType: 'xp_boost', effectValue: 0.1, duration: 0, stackable: false },
      { effectId: 'lucky_charm_coin', name: 'Thiên Hộ Linh Phù', effectType: 'coin_boost', effectValue: 0.05, duration: 0, stackable: true }
    ];

    for (const eff of defaultEffects) {
      await ItemEffect.findOneAndUpdate(
        { effectId: eff.effectId },
        { $set: eff },
        { upsert: true }
      );
    }
    logger.info('[Migration] Đã gieo mầm hiệu ứng Vật Phẩm');

    // 7. Seed Feature Flags động
    const defaultFlags = [
      { flagName: 'quests', status: 'enabled', description: 'Hệ thống nhiệm vụ Daily/Weekly/Monthly' },
      { flagName: 'achievements', status: 'enabled', description: 'Hệ thống thành tựu trọn đời và seasonal' },
      { flagName: 'guilds', status: 'enabled', description: 'Mô hình Bang hội toàn cầu Đế Tông' },
      { flagName: 'dungeons', status: 'disabled', description: 'Phó bản leo tháp Đấu La (Chuẩn bị cho Phase 3)' },
      { flagName: 'guild_wars', status: 'disabled', description: 'Đại chiến Bang hội liên server (Chuẩn bị cho Phase 3)' },
      { flagName: 'battle_pass', status: 'disabled', description: 'Sổ tay Đấu La Battle Pass (Chuẩn bị cho Phase 3)' },
      { flagName: 'ai_features', status: 'enabled', description: 'Tính năng AI tạo Banner Pollinations' }
    ];

    for (const flag of defaultFlags) {
      await FeatureFlag.findOneAndUpdate(
        { flagName: flag.flagName },
        { $set: flag },
        { upsert: true }
      );
    }
    logger.info('[Migration] Đã gieo mầm trạng thái Feature Flags động');

    logger.info('[Migration] Đã hoàn thành gieo mầm dữ liệu game thành công!');
  } catch (error) {
    logger.error('[Migration] Lỗi khi gieo mầm dữ liệu game:', error);
  }
}
export default seedGameplayData;
