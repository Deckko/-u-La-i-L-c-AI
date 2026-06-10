import mongoose from 'mongoose';
import { guildWarRepository } from '../repositories/GuildWarRepository.js';
import { guildRepository } from '../repositories/GuildRepository.js';
import { IGuildWarMatch } from '../database/models/GuildWar.js';
import logger from '../core/logger.js';

export class GuildWarService {
  /**
   * Bắt cặp trận đấu mới giữa 2 bang hội
   */
  async scheduleMatch(
    seasonId: string,
    guildAId: string,
    guildBId: string,
    scheduledAt: Date
  ): Promise<{ success: boolean; match?: IGuildWarMatch; error?: string }> {
    try {
      const gA = new mongoose.Types.ObjectId(guildAId);
      const gB = new mongoose.Types.ObjectId(guildBId);

      const match = await guildWarRepository.createMatch(seasonId, gA, gB, scheduledAt);
      logger.info(`[GuildWarService] Đã xếp lịch đấu bang chiến: ${guildAId} vs ${guildBId} lúc ${scheduledAt.toISOString()}`);
      return { success: true, match };
    } catch (error) {
      logger.error('[GuildWarService] Lỗi khi tạo trận đấu bang:', error);
      return { success: false, error: 'Lỗi trận pháp bài trí bang chiến.' };
    }
  }

  /**
   * Hoàn thành trận đấu bang chiến và cập nhật bảng điểm bang hội
   */
  async endMatch(matchId: string, winnerGuildId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const winner = new mongoose.Types.ObjectId(winnerGuildId);
      const match = await guildWarRepository.updateMatchResult(matchId, winner);
      if (!match) {
        return { success: false, error: 'Không tìm thấy trận đấu bang chiến này.' };
      }

      // Cộng điểm xếp hạng bang hội cho bang chiến thắng (+1000 điểm)
      await guildRepository.incrementRankingPoints(winner, 1000);
      // Ghi nhận thành tích mùa giải
      await guildRepository.updateSeasonStats(winner, match.seasonId, 1, 1000);

      // Trừ điểm bang thất bại? Hoặc chỉ cộng bang thắng
      const loserId = match.guildAId.toString() === winnerGuildId ? match.guildBId : match.guildAId;
      await guildRepository.incrementRankingPoints(loserId, 100); // Thua vẫn được +100 điểm an ủi
      await guildRepository.updateSeasonStats(loserId, match.seasonId, 0, 100);

      logger.info(`[GuildWarService] Trận đấu ${matchId} kết thúc. Bang thắng: ${winnerGuildId}`);
      return { success: true };
    } catch (error) {
      logger.error(`[GuildWarService] Lỗi khi kết thúc trận đấu ${matchId}:`, error);
      return { success: false, error: 'Lỗi thiên thạch khi xử lý kết quả bang chiến.' };
    }
  }
}

export const guildWarService = new GuildWarService();
