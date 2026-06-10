import mongoose from 'mongoose';
import GuildWarMatch, { IGuildWarMatch } from '../database/models/GuildWar.js';
import logger from '../core/logger.js';
import crypto from 'crypto';

export class GuildWarRepository {
  /**
   * Đăng ký/Tạo trận đấu bang hội mới
   */
  async createMatch(
    seasonId: string,
    guildAId: mongoose.Types.ObjectId,
    guildBId: mongoose.Types.ObjectId,
    scheduledAt: Date
  ): Promise<IGuildWarMatch> {
    try {
      const matchId = crypto.randomUUID();
      const match = new GuildWarMatch({
        matchId,
        seasonId,
        guildAId,
        guildBId,
        status: 'pending',
        scheduledAt
      });
      return await match.save();
    } catch (error) {
      logger.error('[GuildWarRepository] Lỗi khi tạo trận đấu bang hội:', error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử trận đấu của một Bang hội trong mùa giải
   */
  async getGuildMatches(guildId: mongoose.Types.ObjectId, seasonId: string): Promise<IGuildWarMatch[]> {
    try {
      return await GuildWarMatch.find({
        seasonId,
        $or: [{ guildAId: guildId }, { guildBId: guildId }]
      }).sort({ scheduledAt: 1 });
    } catch (error) {
      logger.error(`[GuildWarRepository] Lỗi khi lấy danh sách trận của bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật kết quả trận đấu
   */
  async updateMatchResult(
    matchId: string,
    winnerId: mongoose.Types.ObjectId
  ): Promise<IGuildWarMatch | null> {
    try {
      return await GuildWarMatch.findOneAndUpdate(
        { matchId },
        { 
          $set: { 
            status: 'completed', 
            winnerId, 
            completedAt: new Date() 
          } 
        },
        { new: true }
      );
    } catch (error) {
      logger.error(`[GuildWarRepository] Lỗi khi cập nhật kết quả trận đấu ${matchId}:`, error);
      throw error;
    }
  }
}

export const guildWarRepository = new GuildWarRepository();
