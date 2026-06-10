import { GuildMember } from 'discord.js';
import { IUser } from '../database/models/User.js';
import { guildConfigRepository } from '../repositories/GuildConfigRepository.js';
import logger from '../core/logger.js';

export const RPG_RANKS = [
  { minLevel: 999, name: 'Chí Cao Vạn Cổ Thần 👑', color: '#FFD700' }, 
  { minLevel: 50, name: 'Trưởng Lão ⚜️', color: '#9B59B6' },          
  { minLevel: 35, name: 'Thánh Tử 🔮', color: '#E91E63' },           
  { minLevel: 20, name: 'Tinh Anh ⚡', color: '#3498DB' },           
  { minLevel: 10, name: 'Nội Môn ⚔️', color: '#E67E22' },            
  { minLevel: 5, name: 'Ngoại Môn 🛡️', color: '#1ABC9C' },           
  { minLevel: 1, name: 'Tân Đệ Tử 🌾', color: '#2ECC71' }            
];

export interface ILevelUpResult {
  leveledUp: boolean;
  oldLevel?: number;
  newLevel?: number;
  powerGained?: number;
  oldRank?: string;
  newRank?: string;
  msg?: string;
}

export class LevelService {
  /**
   * Tính toán XP cần thiết để lên cấp độ tiếp theo
   */
  xpToNextLevel(level: number): number {
    return level * level * 400 + 1000;
  }

  /**
   * Lấy danh hiệu tu tiên dựa trên level
   */
  getRankName(level: number): string {
    for (const rank of RPG_RANKS) {
      if (level >= rank.minLevel) {
        return rank.name;
      }
    }
    return 'Vô Danh';
  }

  /**
   * Lấy danh hiệu tu tiên sạch (không có Emojis) phục vụ đổi Biệt danh tránh tràn ký tự
   */
  getCleanRankName(level: number): string {
    if (level >= 999) return 'Cổ Thần';
    if (level >= 50) return 'Trưởng Lão';
    if (level >= 35) return 'Thánh Tử';
    if (level >= 20) return 'Tinh Anh';
    if (level >= 10) return 'Nội Môn';
    if (level >= 5) return 'Ngoại Môn';
    return 'Tân Đệ Tử';
  }

  /**
   * Kiểm tra xem một danh hiệu có phải danh hiệu đặc biệt không
   */
  isCustomRpgTitle(title: string): boolean {
    if (!title) return false;
    return (
      title === '🏵️ Đệ Nhất Ma Tôn Hoàng Kim 🏵️' ||
      title === '🏅 Anh Hùng Hóa Hồn' ||
      title === '👑 Thần Vương Đấu La' ||
      title === '⚡ Chí Cao Vạn Cổ Thần ✨' ||
      title.startsWith('👑 VIP •') ||
      title.startsWith('🥇 Tiên Sát Thần Ma •')
    );
  }

  /**
   * Tạo một tiền tố danh hiệu sạch (rút gọn, không chứa Emojis thừa) để đưa vào Nickname Discord
   */
  getCleanNicknamePrefix(title: string, level: number): string {
    const emojiRegex = /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g;
    
    if (!title) return this.getCleanRankName(level);
    
    if (title.startsWith('👑 VIP •')) {
      const rankPart = title.replace('👑 VIP •', '').trim();
      const cleanRank = rankPart.replace(emojiRegex, '').trim()
                                .replace(/^[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+|[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+$/g, '').trim();
      return `VIP • ${cleanRank}`;
    }

    if (title.includes('Đệ Nhất Ma Tôn Hoàng Kim')) return 'Ma Tôn';
    if (title.includes('Tiên Sát Thần Ma')) return 'Sát Thần';
    if (title.includes('Thần Vương Đấu La')) return 'Thần Vương';
    if (title.includes('Chí Cao Vạn Cổ Thần')) return 'Cổ Thần';
    if (title.includes('Anh Hùng Hóa Hồn')) return 'Anh Hùng';

    let clean = title.replace(emojiRegex, '').trim();
    clean = clean.replace(/^[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+|[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+$/g, '').trim();

    const standardRankNames = ['Tân Nhân', 'Vô Danh', ...RPG_RANKS.map(r => r.name)];
    if (!clean || standardRankNames.includes(title)) {
      return this.getCleanRankName(level);
    }

    return clean.substring(0, 12);
  }

  /**
   * Tự động cập nhật chức nghiệp (Auto-Role) trên Guild Discord
   */
  async updateGuildMemberRole(member: GuildMember, level: number): Promise<void> {
    try {
      const guild = member.guild;
      const currentRank = this.getRankName(level);
      const allRanksNames = RPG_RANKS.map(r => r.name);

      // Tìm config của Guild
      const guildConfig = await guildConfigRepository.getOrCreate(guild.id);
      
      // Lấy thông tin tiêu đề hiện tại của user từ DB
      // @ts-ignore
      const User = mongoose.model('User');
      const userDoc = await User.findOne({ discordId: member.id });
      const currentTitle = userDoc?.title || currentRank;

      let roleColor = '#99AAB5';
      for (const rank of RPG_RANKS) {
        if (currentTitle.includes(rank.name) || currentTitle.includes(this.getCleanRankName(level))) {
          roleColor = rank.color;
          break;
        }
      }
      
      if (currentTitle.includes('Ma Tôn')) {
        roleColor = '#FF4500'; 
      } else if (currentTitle.includes('Tiên Sát Thần Ma')) {
        roleColor = '#FF0000'; 
      } else if (currentTitle.includes('Chí Cao Vạn Cổ Thần')) {
        roleColor = '#FFD700'; 
      } else if (currentTitle.includes('VIP')) {
        roleColor = '#FFD700'; 
      }

      let targetRole = guild.roles.cache.find(r => r.name === currentTitle);
      if (!targetRole) {
        try {
          targetRole = await guild.roles.create({
            name: currentTitle,
            color: roleColor as any,
            reason: 'Hệ thống RPG Tự Động Tạo Danh Hiệu Đấu La',
            permissions: []
          });
          logger.info(`[LevelService] Tự tạo thành công role: ${currentTitle} với màu ${roleColor} trên Guild ${guild.id}`);
        } catch (err: any) {
          logger.warn(`[LevelService] Không thể tự tạo role: ${currentTitle} trên Guild ${guild.id}. Lỗi: ${err.message}`);
          return;
        }
      } else {
        try {
          if (targetRole.hexColor !== roleColor.toLowerCase()) {
            await targetRole.setColor(roleColor as any, 'Đồng bộ màu sắc vai trò theo danh hiệu');
            logger.info(`[LevelService] Đã cập nhật màu sắc vai trò ${currentTitle} thành ${roleColor} trên Guild ${guild.id}`);
          }
        } catch (colorErr: any) {
          logger.warn(`[LevelService] Không thể cập nhật màu sắc vai trò cho role: ${currentTitle} - ${colorErr.message}`);
        }
      }

      if (!targetRole) return;

      const isJoined = member.roles.cache.has(targetRole.id);

      const rolesToRemove = member.roles.cache.filter(role => {
        const isDifferentStandardRank = allRanksNames.includes(role.name) && role.name !== currentTitle;
        const isDifferentCustomTitle = this.isCustomRpgTitle(role.name) && role.name !== currentTitle;
        return (isDifferentStandardRank || isDifferentCustomTitle) && role.id !== targetRole?.id;
      });

      if (rolesToRemove.size > 0) {
        await member.roles.remove(rolesToRemove, 'Cập nhật danh hiệu Đấu La - Gỡ danh vị cũ');
      }

      if (!isJoined) {
        await member.roles.add(targetRole, 'Cập nhật danh hiệu Đấu La - Nhậm danh vị mới');
        logger.info(`[LevelService] Đã gán vai trò ${currentTitle} cho member: ${member.displayName} trên Guild ${guild.id}`);
      }

      // Nickname sync
      try {
        const charName = userDoc?.characterName || member.user.username;
        const cleanPrefix = this.getCleanNicknamePrefix(currentTitle, level);
        const rawNickname = `[${cleanPrefix}] ${charName}`;
        const cleanNickname = rawNickname.substring(0, 32);

        if (member.nickname !== cleanNickname) {
          await member.setNickname(cleanNickname, 'Đồng bộ chức vị và danh hiệu Đấu La');
          logger.info(`[LevelService] Cập nhật biệt danh cho ${member.user.username} -> ${cleanNickname} trên Guild ${guild.id}`);
        }
      } catch (nickError: any) {
        logger.warn(`[LevelService] Không thể cập nhật biệt danh cho ${member.user.username} trên Guild ${guild.id}: ${nickError.message}`);
      }
    } catch (error) {
      logger.error(`[LevelService] Lỗi nghiêm trọng khi đồng bộ Role cho Member ${member.id}:`, error);
    }
  }

  /**
   * Kiểm tra xem người chơi có đủ điều kiện nâng cấp cảnh giới hay không
   */
  async checkLevelUp(userDoc: IUser, member: GuildMember | null = null): Promise<ILevelUpResult> {
    let leveledUp = false;
    const oldLevel = userDoc.level;

    while (userDoc.exp >= this.xpToNextLevel(userDoc.level)) {
      userDoc.level += 1;
      leveledUp = true;
    }

    if (leveledUp) {
      const levelsGained = userDoc.level - oldLevel;
      let totalPowerGained = 0;
      for (let i = 0; i < levelsGained; i++) {
        totalPowerGained += Math.floor(Math.random() * 201) + 100; // 100 -> 300 lực chiến mỗi cấp
      }
      userDoc.combatPower += totalPowerGained;

      const oldTitle = userDoc.title || '';
      if (oldTitle.startsWith('👑 VIP •')) {
        const newRank = this.getRankName(userDoc.level);
        userDoc.title = `👑 VIP • ${newRank}`;
      } else if (this.isCustomRpgTitle(oldTitle)) {
        // Keep custom titles
      } else {
        userDoc.title = this.getRankName(userDoc.level);
      }

      if (member) {
        await this.updateGuildMemberRole(member, userDoc.level);
      }

      const newRank = userDoc.title;
      const oldRank = this.getRankName(oldLevel);

      return {
        leveledUp: true,
        oldLevel,
        newLevel: userDoc.level,
        powerGained: totalPowerGained,
        oldRank,
        newRank,
        msg: `\n🎉 **TU VI ĐỘT PHÁ**: Chúc mừng đệ tử đã đột phá cảnh giới từ **${oldRank}** lên **${newRank}**! Nhận thêm **+${totalPowerGained.toLocaleString()} Lực chiến**.`
      };
    }

    return { leveledUp: false };
  }
}

export const levelService = new LevelService();
