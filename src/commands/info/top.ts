import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { leaderboardService, LeaderboardCategory } from '../../services/LeaderboardService.js';
import logger from '../../core/logger.js';

export default {
  cooldown: 5,
  featureFlag: 'achievements', // Gated by achievements/ranking
  data: new SlashCommandBuilder()
    .setName('top')
    .setDescription('Hiển thị bảng xếp hạng tiên nhân và bang hội hàng đầu Đấu La')
    .addSubcommand(sub =>
      sub
        .setName('level')
        .setDescription('Xem Top 10 Tiên Nhân có tu vi Cảnh Giới (Level) cao nhất')
    )
    .addSubcommand(sub =>
      sub
        .setName('power')
        .setDescription('Xem Top 10 Tiên Nhân có Lực Chiến VC mạnh nhất')
    )
    .addSubcommand(sub =>
      sub
        .setName('coins')
        .setDescription('Xem Top 10 Tiên Nhân có Đấu Xu trong khố phòng lớn nhất')
    )
    .addSubcommand(sub =>
      sub
        .setName('guild')
        .setDescription('Xem Top 10 Tông Môn Bang Hội hưng thịnh nhất đại lục')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand() as LeaderboardCategory;
    const guildId = interaction.guildId || 'global';

    try {
      const top10 = await leaderboardService.getTop10(subcommand);

      const titleMap = {
        level: '⭐ BẢNG VÀNG CẢNH GIỚI TU VI (LEVEL) ⭐',
        power: '⚡ BẢNG VÀNG THẦN LỰC CHIẾN CP ⚡',
        coins: '🪙 BẢNG VÀNG KHỐ PHÒNG ĐẤU XU 🪙',
        guild: '⚔️ BẢNG XẾP HẠNG TÔNG MÔN HƯNG THỊNH ⚔️',
        achievements: '🏆 BẢNG VÀNG THÀNH TỰU KHAI ẤN 🏆'
      };

      const valueSuffixMap = {
        level: 'Cảnh giới (Lv)',
        power: 'CP Lực chiến',
        coins: 'Đấu Xu',
        guild: 'Điểm Danh Vọng',
        achievements: 'Thành tựu'
      };

      const embed = new EmbedBuilder()
        .setTitle(titleMap[subcommand])
        .setColor('#D4AF37')
        .setThumbnail(interaction.guild?.iconURL() || interaction.user.displayAvatarURL())
        .setTimestamp();

      const medalEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      let listText = '';
      if (top10.length === 0) {
        listText = 'Chưa có dữ liệu bảng xếp hạng được ghi nhận trong thiên cơ.';
      } else {
        top10.forEach((item, i) => {
          listText += `${medalEmojis[i]} **${item.name}** - \`${item.value.toLocaleString()} ${valueSuffixMap[subcommand]}\`\n`;
        });
      }

      embed.setDescription(listText);
      embed.setFooter({ text: 'Bảng xếp hạng được cập nhật định kỳ!' });

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error(`[Command top ${subcommand}] Lỗi:`, error);
      return interaction.reply({ content: 'Lỗi thiên trận khi mở Bảng Vàng.', flags: [64] });
    }
  }
};
