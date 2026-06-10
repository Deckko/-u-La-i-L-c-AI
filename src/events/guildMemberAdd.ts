import { GuildMember } from 'discord.js';
import User from '../database/models/User.js';
import { levelService } from '../services/LevelService.js';
import logger from '../core/logger.js';

/**
 * Tự động đồng bộ và khôi phục vai trò/biệt danh khi đệ tử gia nhập server
 */
export default {
  name: 'guildMemberAdd',
  async execute(member: GuildMember) {
    try {
      const user = await User.findOne({ discordId: member.id });
      if (user && user.registered) {
        logger.info(`[Join Event] Phát hiện đệ tử ${member.user.username} tái gia nhập tông môn. Khôi phục vai trò...`);
        await levelService.updateGuildMemberRole(member, user.level);
      }
    } catch (error) {
      logger.error('[Event guildMemberAdd] Lỗi khôi phục vai trò khi gia nhập:', error);
    }
  }
};
