import { leaderboardRepository } from '../repositories/LeaderboardRepository.js';
import User from '../database/models/User.js';
import Guild from '../database/models/Guild.js';
import GuildRanking from '../database/models/GuildRanking.js';
import PlayerStats from '../database/models/PlayerStats.js';
import UserAchievement from '../database/models/UserAchievement.js';
import { seasonRepository } from '../repositories/SeasonRepository.js';
import logger from '../core/logger.js';

export type LeaderboardCategory = 'level' | 'power' | 'coins' | 'guild' | 'achievements';

export class LeaderboardService {
  /**
   * Tạo bản snapshot xếp hạng cho một hạng mục cụ thể
   */
  async takeSnapshot(category: LeaderboardCategory): Promise<void> {
    try {
      const rankings: Array<{ id: string; name: string; value: number; rank: number }> = [];

      if (category === 'level') {
        const users = await User.find({ registered: true })
          .sort({ level: -1, exp: -1 })
          .limit(100);
        
        users.forEach((u, i) => {
          rankings.push({
            id: u.discordId,
            name: u.characterName || u.username,
            value: u.level,
            rank: i + 1
          });
        });
      } else if (category === 'power') {
        const users = await User.find({ registered: true })
          .sort({ combatPower: -1 })
          .limit(100);

        users.forEach((u, i) => {
          rankings.push({
            id: u.discordId,
            name: u.characterName || u.username,
            value: u.combatPower,
            rank: i + 1
          });
        });
      } else if (category === 'coins') {
        const users = await User.find({ registered: true })
          .sort({ balance: -1 })
          .limit(100);

        users.forEach((u, i) => {
          rankings.push({
            id: u.discordId,
            name: u.characterName || u.username,
            value: u.balance,
            rank: i + 1
          });
        });
      } else if (category === 'guild') {
        const topGuilds = await GuildRanking.find({})
          .sort({ points: -1 })
          .limit(100)
          .populate({ path: 'guildId', model: 'Guild' });

        topGuilds.forEach((gr, i) => {
          const g = gr.guildId as any;
          if (g) {
            rankings.push({
              id: g._id.toString(),
              name: g.guildName,
              value: gr.points,
              rank: i + 1
            });
          }
        });
      } else if (category === 'achievements') {
        // Gom nhóm và đếm số thành tựu đã mở khóa của người chơi
        const agg = await UserAchievement.aggregate([
          { $group: { _id: '$userId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 100 }
        ]);

        for (let i = 0; i < agg.length; i++) {
          const item = agg[i];
          const u = await User.findOne({ discordId: item._id });
          rankings.push({
            id: item._id,
            name: u ? (u.characterName || u.username) : 'Tiên Nhân Ẩn Danh',
            value: item.count,
            rank: i + 1
          });
        }
      }

      if (rankings.length > 0) {
        await leaderboardRepository.saveSnapshot(category, rankings);
        logger.info(`[LeaderboardService] Đã lưu bản snapshot mới cho bảng xếp hạng: ${category}`);
      }
    } catch (error) {
      logger.error(`[LeaderboardService] Lỗi khi tạo snapshot bảng xếp hạng ${category}:`, error);
    }
  }

  /**
   * Lấy Top 10 tiên nhân/bang hội của một hạng mục (lấy từ snapshot, nếu chưa có thì chạy realtime)
   */
  async getTop10(category: LeaderboardCategory): Promise<Array<{ name: string; value: number; rank: number }>> {
    try {
      const snap = await leaderboardRepository.getLatestSnapshot(category);
      if (snap && snap.rankings.length > 0) {
        return snap.rankings.slice(0, 10).map(r => ({
          name: r.name,
          value: r.value,
          rank: r.rank
        }));
      }

      // Fallback tính toán thời gian thực nếu chưa có bản snapshot nào
      logger.warn(`[LeaderboardService] Không tìm thấy snapshot cho ${category}, đang tính toán thời gian thực...`);
      await this.takeSnapshot(category);
      const newSnap = await leaderboardRepository.getLatestSnapshot(category);
      if (newSnap) {
        return newSnap.rankings.slice(0, 10).map(r => ({
          name: r.name,
          value: r.value,
          rank: r.rank
        }));
      }

      return [];
    } catch (error) {
      logger.error(`[LeaderboardService] Lỗi khi lấy Top 10 của ${category}:`, error);
      return [];
    }
  }

  /**
   * Lấy vị trí thứ hạng thời gian thực của một người chơi cụ thể
   */
  async getPlayerRank(userId: string, category: 'level' | 'power' | 'coins'): Promise<number> {
    try {
      const user = await User.findOne({ discordId: userId });
      if (!user || !user.registered) return 0;

      let count = 0;
      if (category === 'level') {
        // Đếm số người có level cao hơn, hoặc level bằng nhau nhưng exp nhiều hơn
        count = await User.countDocuments({
          registered: true,
          $or: [
            { level: { $gt: user.level } },
            { level: user.level, exp: { $gt: user.exp } }
          ]
        });
      } else if (category === 'power') {
        count = await User.countDocuments({
          registered: true,
          combatPower: { $gt: user.combatPower }
        });
      } else if (category === 'coins') {
        count = await User.countDocuments({
          registered: true,
          balance: { $gt: user.balance }
        });
      }

      return count + 1; // Hạng = số người vượt mặt + 1
    } catch (error) {
      logger.error(`[LeaderboardService] Lỗi lấy thứ hạng ${category} cho user ${userId}:`, error);
      return 0;
    }
  }
}

export const leaderboardService = new LeaderboardService();
