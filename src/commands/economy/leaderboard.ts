import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType 
} from 'discord.js';
import User from '../../database/models/User.js';

const USERS_PER_PAGE = 7;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('bxh')
    .setDescription('Xem bảng xếp hạng tiên nhân tu vi thâm hậu nhất Đế Tông (Đấu Bảng Đấu La)'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    let currentPage = 1;

    // 1. Hàm tìm kiếm dữ liệu và render màn hình BXH
    async function generateLeaderboardEmbed(page: number) {
      const totalUsers = await User.countDocuments({ registered: true });
      const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE) || 1;
      
      // Đảm bảo trang nằm trong biên giới hợp lệ
      const targetPage = Math.max(1, Math.min(page, totalPages));
      const skip = (targetPage - 1) * USERS_PER_PAGE;

      // Tìm top các đệ tử đã đăng ký sắp xếp theo Level (giảm dần) và EXP (giảm dần)
      const topUsers = await User.find({ registered: true })
        .sort({ level: -1, exp: -1 })
        .skip(skip)
        .limit(USERS_PER_PAGE);

      const embed = new EmbedBuilder()
        .setTitle('🏆 ĐẾ TÔNG THIÊN BẢNG - ĐẤU LA ĐẠI LỤC 🏆')
        .setDescription('Nơi tôn sùng danh tánh của chư vị đạo hữu có tu vi sâu dày, linh lực áp chế trời đất.')
        .setColor('#8B008B') // Tím vương huyền huyền bí
        .setThumbnail('https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=250&auto=format&fit=crop') // Tranh cổ kiếm hiệp minh họa
        .setFooter({ text: `Thiên Bảng Trang ${targetPage}/${totalPages} • Tổng ${totalUsers} Đệ Tử` })
        .setTimestamp();

      if (topUsers.length === 0) {
        embed.addFields({ name: '🧩 Trống Không', value: 'Chưa có tân đệ tử nào lập pháp ghi danh danh sách phong vân.', inline: false });
        return { embeds: [embed], components: [] };
      }

      let leaderboardText = '';
      topUsers.forEach((user, idx) => {
        const absoluteRank = skip + idx + 1;
        let medal = `[#${absoluteRank}]`;
        if (absoluteRank === 1) medal = '🥇';
        if (absoluteRank === 2) medal = '🥈';
        if (absoluteRank === 3) medal = '🥉';

        // Tên nhân vật + danh vị
        leaderboardText += `${medal} **${user.characterName || user.username}**\n↳ 🛡️ **Cảnh Giới**: Cấp ${user.level} (${user.title})\n↳ 💥 **Lực Chiến**: ${user.combatPower.toLocaleString()} VC | 🪙 **Xu**: ${user.balance.toLocaleString()}\n\n`;
      });

      embed.addFields({ name: '💮 Chư Vị Tôn Giả Đầu Bảng Võ Lâm', value: leaderboardText, inline: false });

      // Lấy vị trí xếp hạng của riêng người gọi lệnh này
      const allRegistered = await User.find({ registered: true }).sort({ level: -1, exp: -1 });
      const selfIndex = allRegistered.findIndex(u => u.discordId === userId);
      
      if (selfIndex > -1) {
        const selfUser = allRegistered[selfIndex];
        embed.addFields({
          name: '🎖️ Thành Tích Bản Thân',
          value: `Tôn giả đang đứng thứ **#${selfIndex + 1}** trên Thiên Bảng • Cấp độ **Level ${selfUser.level}**`,
          inline: false
        });
      }

      // Nút chuyển trang rực rỡ
      const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`leaderboard:prev:${targetPage}`)
          .setLabel('Trang Trước ⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(targetPage === 1),
        new ButtonBuilder()
          .setCustomId(`leaderboard:next:${targetPage}`)
          .setLabel('➡️ Trang Kế')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(targetPage === totalPages)
      );

      return { embeds: [embed], components: [btnRow] };
    }

    // Gửi phản hồi khởi đầu
    const initialPayload = await generateLeaderboardEmbed(currentPage);
    const message = await interaction.reply(initialPayload);

    // Kích hoạt Listener để bắt sự kiện lật trang bất kỳ liên tục
    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === userId,
      time: 60 * 1000 // Hạn lật trang 1 phút thiền đạo
    });

    collector.on('collect', async (i) => {
      await i.deferUpdate();

      if (i.isButton()) {
        const parts = i.customId.split(':'); // ["leaderboard", "prev/next", "pagenum"]
        const action = parts[1];
        let targetPage = parseInt(parts[2], 10);

        if (action === 'prev') targetPage--;
        if (action === 'next') targetPage++;

        const totalUsers = await User.countDocuments({ registered: true });
        const maxPages = Math.ceil(totalUsers / USERS_PER_PAGE) || 1;

        if (targetPage >= 1 && targetPage <= maxPages) {
          currentPage = targetPage;
          const updatedPayload = await generateLeaderboardEmbed(currentPage);
          await i.editReply(updatedPayload);
        }
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch (err) {
        // Silent
      }
    });
  }
};
