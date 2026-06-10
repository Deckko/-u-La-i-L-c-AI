import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { achievementService } from '../../services/AchievementService.js';
import logger from '../../core/logger.js';

export default {
  cooldown: 5,
  featureFlag: 'achievements',
  data: new SlashCommandBuilder()
    .setName('achievement')
    .setDescription('Hệ thống thành tựu vinh danh tu tiên')
    .addSubcommand(sub =>
      sub
        .setName('progress')
        .setDescription('Hiển thị tiến trình mở khóa thành tựu của bản thân')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'progress') {
      try {
        const achs = await achievementService.getPlayerAchievementsList(userId);
        
        const embed = new EmbedBuilder()
          .setTitle('🏆 ĐẾ TÔNG CHIẾN TÍCH THÀNH TỰU 🏆')
          .setDescription('Chư vị tiên nhân quy đạo lập chiến công được vinh danh trên Thiên Ấn Tông Môn:')
          .setColor('#FF9900')
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        let listText = '';
        if (achs.length === 0) {
          listText = '*Thiên cơ hiện tại chưa ghi nhận định nghĩa thành tựu nào.*';
        } else {
          achs.forEach((a) => {
            const status = a.completed 
              ? '✅ **[Đã Mở Khóa]**' 
              : `⏳ **[Tiến độ: ${a.currentValue}/${a.targetValue}]**`;
            
            const titleRewardText = a.rewardTitle ? ` | 🏅 Danh hiệu: \`${a.rewardTitle}\`` : '';
            
            listText += `⭐ **${a.name}**\n` +
                         `↳ *Ý nghĩa:* *${a.description}*\n` +
                         `↳ *Phần thưởng:* 🪙 **${a.rewardCoins} Đấu Xu** | ⭐ **${a.rewardExp} XP**${titleRewardText}\n` +
                         `↳ *Trạng thái:* ${status}\n\n`;
          });
        }

        embed.setDescription(listText);
        embed.setFooter({ text: 'Rèn luyện tu vi cảnh giới để gặt hái thêm nhiều phong vị thành tựu!' });
        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command achievement progress] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi thiên cơ khi mở Mật Bảo Thành Tựu.', flags: [64] });
      }
    }
  }
};
