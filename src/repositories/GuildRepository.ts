import mongoose from 'mongoose';
import Guild, { IGuild } from '../database/models/Guild.js';
import GuildMember, { IGuildMember, GuildRole } from '../database/models/GuildMember.js';
import GuildBank, { IGuildBank } from '../database/models/GuildBank.js';
import GuildTechnology, { IGuildTechnology, TechIdType } from '../database/models/GuildTechnology.js';
import GuildTerritory, { IGuildTerritory } from '../database/models/GuildTerritory.js';
import GuildRanking, { IGuildRanking } from '../database/models/GuildRanking.js';
import GuildSeasonStats, { IGuildSeasonStats } from '../database/models/GuildSeasonStats.js';
import logger from '../core/logger.js';

export class GuildRepository {
  /**
   * Tạo Bang hội mới toàn cục
   */
  async createGuild(guildName: string, masterId: string): Promise<IGuild> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // 1. Tạo bản ghi Guild
      const newGuild = new Guild({
        guildName,
        masterId,
        level: 1,
        xp: 0,
        capacity: 10,
        treasuryCoins: 0,
        description: 'Tông môn mới thành lập.',
        territoryName: 'Tân Thủ Thôn'
      });
      const savedGuild = await newGuild.save({ session });

      // 2. Tạo bản ghi GuildMember với quyền Bang Chủ
      const member = new GuildMember({
        guildId: savedGuild._id,
        userId: masterId,
        role: 'master',
        joinedAt: new Date()
      });
      await member.save({ session });

      // 3. Tạo bản ghi GuildBank
      const bank = new GuildBank({
        guildId: savedGuild._id,
        balance: 0,
        logs: [
          {
            userId: masterId,
            action: 'deposit',
            amount: 0,
            reason: 'Khởi tạo ngân khố tông môn.',
            timestamp: new Date()
          }
        ]
      });
      await bank.save({ session });

      // 4. Tạo bản ghi GuildRanking ban đầu
      const ranking = new GuildRanking({
        guildId: savedGuild._id,
        points: 0,
        rank: 0
      });
      await ranking.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[GuildRepository] Đã thành lập Bang hội mới thành công: ${guildName} bởi Bang Chủ: ${masterId}`);
      return savedGuild;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error(`[GuildRepository] Lỗi khi tạo bang hội ${guildName}:`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin Bang hội theo ID
   */
  async getById(guildId: string | mongoose.Types.ObjectId): Promise<IGuild | null> {
    try {
      return await Guild.findById(guildId);
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi tìm bang hội theo ID ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin Bang hội theo tên
   */
  async getByName(guildName: string): Promise<IGuild | null> {
    try {
      return await Guild.findOne({ guildName: { $regex: new RegExp(`^${guildName}$`, 'i') } });
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi tìm bang hội theo tên ${guildName}:`, error);
      throw error;
    }
  }

  /**
   * Lấy bản ghi thành viên bang của người chơi (dành cho Global Guild Model)
   */
  async getMember(userId: string): Promise<IGuildMember | null> {
    try {
      return await GuildMember.findOne({ userId }).populate('guildId');
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy tư cách thành viên của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh sách toàn bộ thành viên của một Bang hội
   */
  async getMembers(guildId: mongoose.Types.ObjectId): Promise<IGuildMember[]> {
    try {
      return await GuildMember.find({ guildId }).sort({ role: 1, joinedAt: 1 });
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy danh sách thành viên cho bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Thêm thành viên vào Bang hội
   */
  async addMember(guildId: mongoose.Types.ObjectId, userId: string, role: GuildRole = 'member'): Promise<IGuildMember> {
    try {
      const member = new GuildMember({
        guildId,
        userId,
        role,
        joinedAt: new Date()
      });
      return await member.save();
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi thêm thành viên ${userId} vào bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Xóa thành viên khỏi Bang hội (Trục xuất / Rời bang)
   */
  async removeMember(userId: string): Promise<boolean> {
    try {
      const res = await GuildMember.deleteOne({ userId });
      return res.deletedCount > 0;
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi xóa thành viên ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật chức vụ thành viên
   */
  async updateMemberRole(userId: string, role: GuildRole): Promise<IGuildMember | null> {
    try {
      return await GuildMember.findOneAndUpdate({ userId }, { $set: { role } }, { new: true });
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi cập nhật chức vụ thành viên ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy tài khoản ngân quỹ bang
   */
  async getBank(guildId: mongoose.Types.ObjectId): Promise<IGuildBank | null> {
    try {
      return await GuildBank.findOne({ guildId });
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy ngân quỹ cho bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật số dư ngân quỹ bang kèm ghi nhật ký tài chính
   */
  async updateBankBalance(
    guildId: mongoose.Types.ObjectId,
    amount: number,
    userId: string,
    action: 'deposit' | 'withdraw',
    reason: string
  ): Promise<IGuildBank | null> {
    try {
      const bank = await GuildBank.findOne({ guildId });
      if (!bank) return null;

      bank.balance += amount;
      bank.logs.push({
        userId,
        action,
        amount: Math.abs(amount),
        reason,
        timestamp: new Date()
      });

      // Giới hạn độ dài log ngân quỹ (giữ lại 100 log gần nhất)
      if (bank.logs.length > 100) {
        bank.logs.shift();
      }

      await bank.save();

      // Đồng bộ hóa trường treasuryCoins trên tài liệu Guild
      await Guild.findByIdAndUpdate(guildId, { $set: { treasuryCoins: bank.balance } });

      return bank;
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi cập nhật ngân quỹ bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy cấu hình công nghệ của Bang hội
   */
  async getTechnology(guildId: mongoose.Types.ObjectId, techId: TechIdType): Promise<IGuildTechnology> {
    try {
      let tech = await GuildTechnology.findOne({ guildId, techId });
      if (!tech) {
        tech = new GuildTechnology({ guildId, techId, level: 0 });
        await tech.save();
      }
      return tech;
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy công nghệ ${techId} cho bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy tất cả công nghệ đang có của Bang hội
   */
  async getTechnologies(guildId: mongoose.Types.ObjectId): Promise<IGuildTechnology[]> {
    try {
      const techs = await GuildTechnology.find({ guildId });
      return techs;
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy các công nghệ của bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy lãnh thổ hiện tại của Bang hội
   */
  async getTerritory(guildId: mongoose.Types.ObjectId): Promise<IGuildTerritory | null> {
    try {
      return await GuildTerritory.findOne({ guildId });
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy lãnh thổ bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Thiết lập lãnh thổ chiếm giữ cho Bang hội
   */
  async setTerritory(guildId: mongoose.Types.ObjectId, territoryName: string, resourceMultiplier: number): Promise<IGuildTerritory> {
    try {
      const territory = await GuildTerritory.findOneAndUpdate(
        { guildId },
        { $set: { territoryName, controlStartedAt: new Date(), resourceMultiplier } },
        { upsert: true, new: true }
      );

      // Đồng bộ hóa trường territoryName trên tài liệu Guild
      await Guild.findByIdAndUpdate(guildId, { $set: { territoryName } });

      return territory;
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi set lãnh thổ cho bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy xếp hạng bang hội
   */
  async getRanking(guildId: mongoose.Types.ObjectId): Promise<IGuildRanking | null> {
    try {
      return await GuildRanking.findOne({ guildId });
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy xếp hạng bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Tăng điểm xếp hạng Bang hội
   */
  async incrementRankingPoints(guildId: mongoose.Types.ObjectId, points: number): Promise<IGuildRanking | null> {
    try {
      return await GuildRanking.findOneAndUpdate(
        { guildId },
        { $inc: { points }, $set: { updatedTime: new Date() } },
        { new: true }
      );
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi tăng điểm xếp hạng bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy số liệu hoạt động mùa giải của bang
   */
  async getSeasonStats(guildId: mongoose.Types.ObjectId, seasonId: string): Promise<IGuildSeasonStats> {
    try {
      let stats = await GuildSeasonStats.findOne({ guildId, seasonId });
      if (!stats) {
        stats = new GuildSeasonStats({ guildId, seasonId, matchesWon: 0, totalScore: 0 });
        await stats.save();
      }
      return stats;
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi lấy stats mùa giải bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật số liệu hoạt động mùa giải của bang
   */
  async updateSeasonStats(guildId: mongoose.Types.ObjectId, seasonId: string, matchesWon: number, score: number): Promise<IGuildSeasonStats> {
    try {
      return await GuildSeasonStats.findOneAndUpdate(
        { guildId, seasonId },
        { $inc: { matchesWon, totalScore: score } },
        { new: true }
      ) as IGuildSeasonStats;
    } catch (error) {
      logger.error(`[GuildRepository] Lỗi khi cập nhật stats mùa giải cho bang ${guildId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bảng xếp hạng các bang hội (sắp xếp theo điểm giảm dần)
   */
  async getTopGuilds(limit: number = 10): Promise<IGuildRanking[]> {
    try {
      return await GuildRanking.find({})
        .sort({ points: -1 })
        .limit(limit)
        .populate({ path: 'guildId', model: 'Guild' });
    } catch (error) {
      logger.error('[GuildRepository] Lỗi khi lấy top bang hội:', error);
      throw error;
    }
  }
}

export const guildRepository = new GuildRepository();
