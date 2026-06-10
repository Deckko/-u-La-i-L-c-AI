import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { titleService } from '../../services/TitleService.js';
import logger from '../../core/logger.js';

export default {
  cooldown: 3,
  featureFlag: 'quests', // Gated by quests/achievements feature flag
  data: new SlashCommandBuilder()
    .setName('title')
    .setDescription('Hệ thống lệnh quản lý Danh Hiệu Đấu La')
    .addSubcommand(sub =>
      sub
        .setName('list')
        .setDescription('Hiển thị danh sách danh hiệu trong hệ thống và tiến trình sở hữu')
    )
    .addSubcommand(sub =>
      sub
        .setName('equip')
        .setDescription('Trang bị danh hiệu mà tiên nhân đã sở hữu')
        .addStringOption(opt =>
          opt
            .setName('id')
            .setDescription('Mã định danh (ID) của danh hiệu cần trang bị')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'list') {
      try {
        const titles = await titleService.getPlayerTitlesList(userId);
        
        const embed = new EmbedBuilder()
          .setTitle('💮 THIÊN BẢNG DANH HIỆU ĐẤU LA 💮')
          .setDescription('Chư vị tiên nhân rèn luyện tu vi, lập đại chiến tích để mở khóa các danh hiệu hiển hách dưới đây:')
          .setColor('#D4AF37')
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        const rarityEmojis = {
          normal: '⚪',
          rare: '🔵',
          epic: '🟣',
          legendary: '🔴'
        };

        const rarityNames = {
          normal: 'Phổ Thông',
          rare: 'Thượng Phẩm',
          epic: 'Cực Phẩm',
          legendary: 'Chí Tôn'
        };

        let listText = '';
        for (const t of titles) {
          const status = t.equipped 
            ? '🔹 **[ĐANG TRANG BỊ]**' 
            : t.unlocked 
              ? '✅ *[Đã sở hữu]*' 
              : '❌ *[Chưa mở khóa]*';
          
          listText += `${rarityEmojis[t.rarity]} **${t.name}** (\`${t.titleId}\`) - *Phẩm cấp:* **${rarityNames[t.rarity]}**\n📝 *Ý nghĩa:* ${t.description}\nTrạng thái: ${status}\n\n`;
        }

        embed.setDescription(listText || 'Hiện chưa có danh hiệu nào được cấu hình trong thiên cơ.');
        embed.setFooter({ text: 'Gõ /title equip <id> để khoác lên mình thần vị danh hiệu!' });
        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command title list] Lỗi:', error);
        return interaction.reply({ content: 'Không thể mở Thiên Bảng Danh Hiệu lúc này.', flags: [64] });
      }
    }

    if (subcommand === 'equip') {
      const titleId = interaction.options.getString('id')!.trim();
      try {
        const res = await titleService.equipTitle(userId, titleId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const successEmbed = new EmbedBuilder()
          .setTitle('💮 KHAI TRẬN - PHONG THẦN DANH HIỆU 💮')
          .setDescription(`Chúc mừng tôn đạo! Bạn đã trang bị danh hiệu mới thành công trên Thiên Thư:\n\n✨ **${res.titleName}** ✨`)
          .setColor('#10B981')
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: 'Mệnh lệnh tu vi đã được cập nhật!' });

        return interaction.reply({ embeds: [successEmbed] });
      } catch (error) {
        logger.error('[Command title equip] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi thiên trận khi trang bị danh hiệu.', flags: [64] });
      }
    }
  }
};
