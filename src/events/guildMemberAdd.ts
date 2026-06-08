import { GuildMember } from 'discord.js';
import User from '../models/User.js';
import { updateGuildMemberRole } from '../utils/levelUtils.js';

/**
 * Tự động đồng bộ và khôi phục vai trò/biệt danh khi đệ tử gia nhập server
 */
export default {
  name: 'guildMemberAdd',
  async execute(member: GuildMember) {
    try {
      // Tìm xem đệ tử đã từng đăng ký trong Thiên Thư chưa
      const user = await User.findOne({ discordId: member.id });
      if (user && user.registered) {
        console.log(`[Join Event] Phát hiện đệ tử ${member.user.username} tái gia nhập tông môn. Khôi phục vai trò...`);
        await updateGuildMemberRole(member, user.level);
      }
    } catch (error) {
      console.error('[Event guildMemberAdd] Lỗi khôi phục vai trò khi gia nhập:', error);
    }
  }
};
