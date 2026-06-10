import mongoose from 'mongoose';
import { guildRepository } from '../repositories/GuildRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { gameConfigService } from './GameConfigService.js';
import { redisClient } from '../index.js';
import { eventBus } from '../core/EventBus.js';
import logger from '../core/logger.js';
import Guild, { IGuild } from '../database/models/Guild.js';
import { IGuildTechnology } from '../database/models/GuildTechnology.js';

export class GuildService {
  /**
   * Tạo Bang hội mới
   */
  async createGuild(guildName: string, masterId: string): Promise<{ success: boolean; guild?: IGuild; error?: string }> {
    try {
      // 1. Kiểm tra xem người chơi đã thuộc bang hội nào chưa
      const existingMember = await guildRepository.getMember(masterId);
      if (existingMember) {
        return { success: false, error: 'Đồng đạo đã thuộc một tông môn khác rồi, không thể tự lập môn phái!' };
      }

      // 2. Kiểm tra xem tên bang hội đã tồn tại chưa
      const existingGuild = await guildRepository.getByName(guildName);
      if (existingGuild) {
        return { success: false, error: 'Tên tông môn này đã có người đăng ký khai sáng trước!' };
      }

      // 3. Kiểm tra ngân sách lập bang từ cấu hình game
      const creationCost = await gameConfigService.getConfig<number>('guild_creation_cost', 5000);
      const user = await userRepository.getByDiscordId(masterId);
      if (!user || user.balance < creationCost) {
        return { success: false, error: `Số dư khố phòng không đủ! Thành lập tông môn yêu cầu phí lập bang là: 🪙 ${creationCost} Đấu Xu.` };
      }

      // 4. Khấu trừ xu của người sáng lập
      user.balance -= creationCost;
      await user.save();

      // 5. Tạo bang trong DB
      const guild = await guildRepository.createGuild(guildName, masterId);

      // Phát sự kiện tiêu xu và lập bang qua Event Bus
      eventBus.emitEvent('coins_spent', {
        userId: masterId,
        guildId: 'global',
        amount: creationCost,
        purpose: 'guild_creation'
      });

      eventBus.emitEvent('guild_created', {
        guildId: guild._id.toString(),
        masterId,
        name: guildName
      });

      // Bang Chủ tự động gia nhập sự kiện bang
      eventBus.emitEvent('guild_joined', {
        userId: masterId,
        guildId: guild._id.toString()
      });

      return { success: true, guild };
    } catch (error) {
      logger.error(`[GuildService] Lỗi khi tạo bang hội ${guildName} cho user ${masterId}:`, error);
      return { success: false, error: 'Lỗi pháp trận tông môn khi thành lập bang hội.' };
    }
  }

  /**
   * Gửi lời mời gia nhập bang hội (Lưu lời mời vào Redis với thời hạn 1 giờ)
   */
  async inviteUser(inviterId: string, inviteeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Kiểm tra vai trò của người mời
      const inviter = await guildRepository.getMember(inviterId);
      if (!inviter || (inviter.role !== 'master' && inviter.role !== 'elder')) {
        return { success: false, error: 'Chỉ có Bang Chủ hoặc Trưởng Lão mới có tư cách phát thiên thư chiêu mộ đệ tử!' };
      }

      // 2. Kiểm tra xem người được mời đã có bang hội chưa
      const invitee = await guildRepository.getMember(inviteeId);
      if (invitee) {
        return { success: false, error: 'Tiên nhân này đã quy thuộc tông môn khác!' };
      }

      // 3. Lưu lời mời vào Redis (Thời hạn 1 giờ)
      const guildIdStr = inviter.guildId._id.toString();
      if (redisClient && redisClient.isReady) {
        await redisClient.setEx(`guild_invite:${inviteeId}`, 3600, guildIdStr);
      } else {
        // Fallback local memory nếu Redis không hoạt động
        (global as any).localGuildInvites = (global as any).localGuildInvites || new Map();
        (global as any).localGuildInvites.set(inviteeId, { guildIdStr, expiresAt: Date.now() + 3600 * 1000 });
      }

      logger.info(`[GuildService] User ${inviterId} đã mời ${inviteeId} vào Guild ${guildIdStr}`);
      return { success: true };
    } catch (error) {
      logger.error(`[GuildService] Lỗi gửi lời mời từ ${inviterId} đến ${inviteeId}:`, error);
      return { success: false, error: 'Lỗi thiên thư chiêu mộ.' };
    }
  }

  /**
   * Đồng ý gia nhập bang hội
   */
  async acceptInvite(inviteeId: string): Promise<{ success: boolean; guildName?: string; error?: string }> {
    try {
      // 1. Kiểm tra xem người được mời đã có bang chưa
      const existing = await guildRepository.getMember(inviteeId);
      if (existing) {
        return { success: false, error: 'Đồng đạo đã thuộc tông môn khác!' };
      }

      // 2. Lấy thông tin lời mời từ Redis hoặc memory
      let guildIdStr: string | null = null;
      if (redisClient && redisClient.isReady) {
        guildIdStr = (await redisClient.get(`guild_invite:${inviteeId}`)) as string | null;
      } else {
        const localInvites = (global as any).localGuildInvites;
        if (localInvites && localInvites.has(inviteeId)) {
          const invite = localInvites.get(inviteeId);
          if (invite.expiresAt > Date.now()) {
            guildIdStr = invite.guildIdStr;
          }
          localInvites.delete(inviteeId);
        }
      }

      if (!guildIdStr) {
        return { success: false, error: 'Đồng đạo không có lời mời gia nhập nào còn hiệu lực hoặc đã hết hạn.' };
      }

      const guildId = new mongoose.Types.ObjectId(guildIdStr);
      const guild = await guildRepository.getById(guildId);
      if (!guild) {
        return { success: false, error: 'Tông môn mời bạn hiện không còn tồn tại trên nhân thế.' };
      }

      // 3. Kiểm tra số lượng thành viên hiện tại
      const members = await guildRepository.getMembers(guildId);
      if (members.length >= guild.capacity) {
        return { success: false, error: 'Tông môn đã thu nạp đủ đệ tử, không thể tiếp nhận thêm người!' };
      }

      // 4. Gia nhập bang
      await guildRepository.addMember(guildId, inviteeId, 'member');

      // Xóa lời mời khỏi Redis
      if (redisClient && redisClient.isReady) {
        await redisClient.del(`guild_invite:${inviteeId}`);
      }

      // Phát sự kiện qua Event Bus
      eventBus.emitEvent('guild_joined', {
        userId: inviteeId,
        guildId: guildIdStr
      });

      logger.info(`[GuildService] User ${inviteeId} đã gia nhập Guild ${guild.guildName}`);
      return { success: true, guildName: guild.guildName };
    } catch (error) {
      logger.error(`[GuildService] Lỗi đồng ý gia nhập bang của user ${inviteeId}:`, error);
      return { success: false, error: 'Lỗi thiên cơ khi tiếp nhận gia nhập.' };
    }
  }

  /**
   * Quyên góp Đấu Xu vào Ngân quỹ Bang hội
   */
  async donateCoins(userId: string, amount: number): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Số xu quyên góp phải lớn hơn 0.' };
      }

      // 1. Kiểm tra bang hội của người chơi
      const member = await guildRepository.getMember(userId);
      if (!member) {
        return { success: false, error: 'Đồng đạo chưa gia nhập môn phái nào để quyên góp!' };
      }

      // 2. Kiểm tra số dư Đấu Xu của người chơi
      const user = await userRepository.getByDiscordId(userId);
      if (!user || user.balance < amount) {
        return { success: false, error: 'Số dư khố phòng cá nhân của đồng đạo không đủ quyên góp.' };
      }

      const guildId = member.guildId._id as mongoose.Types.ObjectId;

      // 3. Khấu trừ tiền người chơi
      user.balance -= amount;
      await user.save();

      // 4. Nạp tiền vào quỹ bang và lưu log
      await guildRepository.updateBankBalance(
        guildId,
        amount,
        userId,
        'deposit',
        `Quyên góp xu từ đệ tử ${user.characterName || user.username}`
      );

      // 5. Cập nhật đóng góp cá nhân
      member.totalContribution += amount;
      await member.save();

      // 6. Tính toán điểm kinh nghiệm tích lũy cho Bang (Config Driven)
      const xpPerCoin = await gameConfigService.getConfig<number>('guild_xp_per_coin', 0.1);
      const xpGained = Math.floor(amount * xpPerCoin);

      if (xpGained > 0) {
        const guild = await guildRepository.getById(guildId);
        if (guild) {
          guild.xp += xpGained;

          // Xử lý thăng cấp bang hội dựa trên XP Formula (Config Driven)
          const xpFormula = await gameConfigService.getConfig<string>('guild_level_up_xp_formula', 'level * 1000');
          // Giả lập tính toán cấp độ mới đơn giản
          let requiredXp = guild.level * 1000; // Mặc định level * 1000
          if (xpFormula === 'level * 1000') {
            requiredXp = guild.level * 1000;
          }

          let leveledUp = false;
          while (guild.xp >= requiredXp) {
            guild.xp -= requiredXp;
            guild.level += 1;
            guild.capacity += 5; // Tăng dung lượng chứa thêm 5 người mỗi cấp
            requiredXp = guild.level * 1000;
            leveledUp = true;
          }

          await guild.save();
          if (leveledUp) {
            logger.info(`[GuildService] Bang hội ${guild.guildName} đã ĐỘT PHÁ thăng lên cấp ${guild.level}!`);
          }
        }
      }

      // Phát sự kiện tiêu xu và quyên góp
      eventBus.emitEvent('coins_spent', {
        userId,
        guildId: 'global',
        amount,
        purpose: 'guild_donation'
      });

      eventBus.emitEvent('guild_donation', {
        userId,
        guildId: guildId.toString(),
        amount
      });

      logger.info(`[GuildService] User ${userId} đã quyên góp 🪙 ${amount} Xu vào Guild ${guildId}`);
      return { success: true, newBalance: user.balance };
    } catch (error) {
      logger.error(`[GuildService] Lỗi quyên góp của user ${userId}:`, error);
      return { success: false, error: 'Lỗi thiên thạch khi xử lý đóng góp.' };
    }
  }

  /**
   * Nâng cấp công nghệ Bang hội
   */
  async upgradeTechnology(userId: string, techId: 'combat_boost' | 'exp_boost' | 'coin_boost'): Promise<{ success: boolean; newLevel?: number; error?: string }> {
    try {
      // 1. Kiểm tra vai trò của người thực hiện nâng cấp
      const member = await guildRepository.getMember(userId);
      if (!member || (member.role !== 'master' && member.role !== 'elder')) {
        return { success: false, error: 'Chỉ có Bang Chủ hoặc Trưởng Lão mới được phép điều khiển nâng cấp mật tịch!' };
      }

      const guildId = member.guildId._id as mongoose.Types.ObjectId;
      const tech = await guildRepository.getTechnology(guildId, techId);

      // 2. Tính toán chi phí nâng cấp dựa trên cấu hình (Config Driven)
      const nextLevel = tech.level + 1;
      const costMultiplier = await gameConfigService.getConfig<number>('guild_tech_base_cost', 10000);
      const upgradeCost = nextLevel * costMultiplier; // Chi phí = level mới * hệ số

      // 3. Kiểm tra số dư khố phòng bang hội
      const bank = await guildRepository.getBank(guildId);
      if (!bank || bank.balance < upgradeCost) {
        return { success: false, error: `Ngân khố tông môn không đủ! Cần có: 🪙 ${upgradeCost} Đấu Xu để nâng cấp lên cấp ${nextLevel}.` };
      }

      // 4. Khấu trừ khố phòng bang
      await guildRepository.updateBankBalance(
        guildId,
        -upgradeCost,
        userId,
        'withdraw',
        `Nâng cấp công nghệ mật tịch ${techId} lên cấp ${nextLevel}`
      );

      // 5. Tăng cấp công nghệ
      tech.level = nextLevel;
      await tech.save();

      // Nếu nâng cấp thành công công nghệ bang, tăng điểm xếp hạng bang hội
      await guildRepository.incrementRankingPoints(guildId, nextLevel * 100);

      logger.info(`[GuildService] Guild ${guildId} đã nâng cấp công nghệ ${techId} lên level ${tech.level}`);
      return { success: true, newLevel: tech.level };
    } catch (error) {
      logger.error(`[GuildService] Lỗi nâng cấp công nghệ bang cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi trận pháp mật tịch.' };
    }
  }

  /**
   * Rời khỏi Bang hội
   */
  async leaveGuild(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const member = await guildRepository.getMember(userId);
      if (!member) {
        return { success: false, error: 'Đồng đạo chưa gia nhập tông môn nào để rút lui.' };
      }

      // Bang chủ không được rời bang trừ khi chuyển nhượng
      if (member.role === 'master') {
        return { success: false, error: 'Bang Chủ không thể tùy tiện quy ẩn rời tông phái! Hãy giải tán hoặc chuyển nhượng ngôi vị.' };
      }

      await guildRepository.removeMember(userId);
      logger.info(`[GuildService] User ${userId} đã rời Guild ${member.guildId._id}`);
      return { success: true };
    } catch (error) {
      logger.error(`[GuildService] Lỗi rời bang của user ${userId}:`, error);
      return { success: false, error: 'Lỗi khi rút lui khỏi bang.' };
    }
  }

  /**
   * Trục xuất thành viên khỏi Bang hội
   */
  async kickMember(kickerId: string, targetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const kicker = await guildRepository.getMember(kickerId);
      const target = await guildRepository.getMember(targetId);

      if (!kicker || !target || kicker.guildId._id.toString() !== target.guildId._id.toString()) {
        return { success: false, error: 'Độ lệch tông phái! Hai người không ở cùng một bang hội.' };
      }

      // So sánh chức vụ để thực hiện trục xuất
      let allowed = false;
      if (kicker.role === 'master') {
        allowed = target.role !== 'master'; // Master đuổi được tất
      } else if (kicker.role === 'elder') {
        allowed = target.role === 'member'; // Elder chỉ đuổi được Member
      }

      if (!allowed) {
        return { success: false, error: 'Quyền lực không đủ! Chức vị của bạn không thể trục xuất tiên nhân này.' };
      }

      await guildRepository.removeMember(targetId);
      logger.info(`[GuildService] User ${targetId} đã bị trục xuất khỏi Guild ${kicker.guildId._id} bởi ${kickerId}`);
      return { success: true };
    } catch (error) {
      logger.error(`[GuildService] Lỗi trục xuất từ ${kickerId} đến ${targetId}:`, error);
      return { success: false, error: 'Lỗi trục xuất đệ tử.' };
    }
  }

  /**
   * Thăng chức thành viên lên Trưởng Lão (Elder)
   */
  async promoteMember(masterId: string, targetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const master = await guildRepository.getMember(masterId);
      if (!master || master.role !== 'master') {
        return { success: false, error: 'Chỉ có Bang Chủ mới có quyền sắc phong Trưởng Lão!' };
      }

      const target = await guildRepository.getMember(targetId);
      if (!target || target.guildId._id.toString() !== master.guildId._id.toString()) {
        return { success: false, error: 'Đệ tử được sắc phong không cùng tông môn với bạn!' };
      }

      if (target.role !== 'member') {
        return { success: false, error: 'Người này đã là Trưởng Lão hoặc Bang Chủ rồi!' };
      }

      await guildRepository.updateMemberRole(targetId, 'elder');
      logger.info(`[GuildService] User ${targetId} đã được thăng chức thành elder bởi master ${masterId}`);
      return { success: true };
    } catch (error) {
      logger.error(`[GuildService] Lỗi thăng chức ${targetId} bởi ${masterId}:`, error);
      return { success: false, error: 'Lỗi thiên trận sắc phong.' };
    }
  }

  /**
   * Giáng chức Trưởng Lão xuống Đệ Tử (Member)
   */
  async demoteMember(masterId: string, targetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const master = await guildRepository.getMember(masterId);
      if (!master || master.role !== 'master') {
        return { success: false, error: 'Chỉ có Bang Chủ mới có quyền bãi miễn chức vụ!' };
      }

      const target = await guildRepository.getMember(targetId);
      if (!target || target.guildId._id.toString() !== master.guildId._id.toString()) {
        return { success: false, error: 'Người này không ở cùng tông môn!' };
      }

      if (target.role !== 'elder') {
        return { success: false, error: 'Người này không giữ chức vụ Trưởng Lão để giáng chức!' };
      }

      await guildRepository.updateMemberRole(targetId, 'member');
      logger.info(`[GuildService] User ${targetId} đã bị giáng chức thành member bởi master ${masterId}`);
      return { success: true };
    } catch (error) {
      logger.error(`[GuildService] Lỗi giáng chức ${targetId} by ${masterId}:`, error);
      return { success: false, error: 'Lỗi thiên trận bãi chức.' };
    }
  }

  /**
   * Lấy chi tiết thông tin Bang hội của người chơi
   */
  async getGuildInfo(userId: string): Promise<{ success: boolean; guild?: IGuild; members?: any[]; techList?: any[]; ranking?: any; memberRole?: string; error?: string }> {
    try {
      const member = await guildRepository.getMember(userId);
      if (!member) {
        return { success: false, error: 'Đồng đạo chưa gia nhập tông môn nào!' };
      }

      const guildId = member.guildId._id as mongoose.Types.ObjectId;
      const guild = await guildRepository.getById(guildId);
      if (!guild) {
        return { success: false, error: 'Tông môn không tồn tại trên đời!' };
      }

      const members = await guildRepository.getMembers(guildId);
      const techList = await guildRepository.getTechnologies(guildId);
      const ranking = await guildRepository.getRanking(guildId);

      return {
        success: true,
        guild,
        members,
        techList,
        ranking,
        memberRole: member.role
      };
    } catch (error) {
      logger.error(`[GuildService] Lỗi lấy thông tin bang cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi pháp trận lấy thông tin bang.' };
    }
  }

  /**
   * Lấy nhật ký tài chính khố phòng tông môn
   */
  async getGuildLogs(userId: string): Promise<{ success: boolean; logs?: any[]; balance?: number; error?: string }> {
    try {
      const member = await guildRepository.getMember(userId);
      if (!member) {
        return { success: false, error: 'Đồng đạo chưa gia nhập tông môn nào!' };
      }

      const guildId = member.guildId._id as mongoose.Types.ObjectId;
      const bank = await guildRepository.getBank(guildId);
      if (!bank) {
        return { success: false, error: 'Khố phòng tông môn không tồn tại!' };
      }

      return {
        success: true,
        logs: bank.logs.slice().reverse(), // Đảo thứ tự để hiển thị log mới trước
        balance: bank.balance
      };
    } catch (error) {
      logger.error(`[GuildService] Lỗi lấy logs khố phòng cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi pháp trận khố phòng.' };
    }
  }
}

export const guildService = new GuildService();
