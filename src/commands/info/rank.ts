import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { leaderboardService } from '../../services/LeaderboardService.js';
import { achievementService } from '../../services/AchievementService.js';
import { guildRepository } from '../../repositories/GuildRepository.js';
import User from '../../database/models/User.js';
import logger from '../../core/logger.js';

export default {
  cooldown: 3,
  featureFlag: 'achievements', // Gated by achievements feature flag
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Xem thứ hạng tôn phẩm, tu vi, lực chiến, và tài sản của bản thân'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({ discordId: userId });
      if (!user || !user.registered) {
        const notRegEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Đồng đạo chưa ghi danh nhập môn! Vui lòng gõ `/dangky` để được khắc tên trên Thiên Bảng.')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegEmbed] });
      }

      // Đếm thứ hạng thời gian thực
      const levelRank = await leaderboardService.getPlayerRank(userId, 'level');
      const powerRank = await leaderboardService.getPlayerRank(userId, 'power');
      const coinsRank = await leaderboardService.getPlayerRank(userId, 'coins');

      // Lấy số thành tựu mở khóa
      const achs = await achievementService.getPlayerAchievementsList(userId);
      const totalAchs = achs.length;
      const completedAchs = achs.filter(a => a.completed).length;

      // Lấy thông tin Bang
      const guildMember = await guildRepository.getMember(userId);
      const guildName = guildMember ? (guildMember.guildId as any).guildName : 'Chưa Gia Nhập Bang';
      const guildContribution = guildMember ? guildMember.totalContribution : 0;

      const embed = new EmbedBuilder()
        .setTitle(`💮 THIÊN BẢNG TIÊN HỒ SƠ - THỨ HẠNG 💮`)
        .setDescription(`Hồ sơ cảnh giới và thứ hạng tu hành của tiên nhân **${user.characterName || user.username}** trên Đấu La Đại Lục:`)
        .setColor('#D4AF37')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🌾 Danh Hiệu Hiện Tại', value: `✨ **${user.title}**`, inline: false },
          { name: '🏰 Tông Môn Quy Thuộc', value: `⚔️ **${guildName}** (Đóng góp: 🪙 ${guildContribution.toLocaleString()} Xu)`, inline: false },
          { name: '🎖️ Cảnh Giới Tu Vi', value: `⭐ Level **${user.level}** (Hạng **#${levelRank}** toàn thế giới)`, inline: true },
          { name: '💥 Lực Chiến Bản Tôn', value: `⚡ **${user.combatPower.toLocaleString()}** CP (Hạng **#${powerRank}** toàn thế giới)`, inline: true },
          { name: '🪙 Ngân Sách Khố Phòng', value: `🪙 **${user.balance.toLocaleString()}** Đấu Xu (Hạng **#${coinsRank}** toàn thế giới)`, inline: true },
          { name: '🏆 Thành Tựu Mở Khóa', value: `🎯 **${completedAchs} / ${totalAchs}** thành tựu đã khai mở`, inline: false }
        )
        .setFooter({ text: 'Tích cực cày cuốc khai sơn và quét Boss để thăng hạng!' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('[Command rank] Lỗi:', error);
      return interaction.reply({ content: 'Lỗi pháp trận khi lấy thông tin thứ hạng tiên nhân.', flags: [64] });
    }
  }
};
