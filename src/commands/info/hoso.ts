import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../models/User.js';
import { xpToNextLevel, getRankName } from '../../utils/levelUtils.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('hoso')
    .setDescription('Xem thông tin tu tiên, cấp độ, lực chiến, tiền tệ và danh hiệu')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Chọn thành viên muốn xem hồ sơ')
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    console.log(`[Command hoso] Khởi động /hoso không defer...`);

    // 1. Xác định target user (Mặc định là chính người dùng)
    const targetUser = interaction.options.getUser('user') || interaction.user;
    console.log(`[Command hoso] Target user: ${targetUser.tag} (${targetUser.id})`);
    
    try {
      // 2. Tìm kiếm trong CSDL
      console.log(`[Command hoso] Bắt đầu tìm kiếm CSDL cho discordId: ${targetUser.id}`);
      const user = await User.findOne({ discordId: targetUser.id });
      console.log(`[Command hoso] Tìm kiếm xong. User found: ${!!user}`);

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THIÊN THƯ CHƯA GHI DANH ⚠️')
          .setDescription(`${targetUser.id === interaction.user.id ? 'Bạn' : `Đệ tử **${targetUser.username}**`} chưa tham gia quy y ghi danh vào bách danh sách của Đế Tông.\nHãy sử dụng lệnh \`/dangky\` để đăng ký danh tánh bản thân!`)
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      // 3. Tính toán tiến trình XP
      const neededExp = xpToNextLevel(user.level);
      const currentExp = user.exp;
      
      // Tạo thanh tiến trình Bar visual tinh xảo
      const barLength = 10;
      const progressRatio = Math.min(Math.max(currentExp / neededExp, 0), 1);
      const filledBlocks = Math.round(progressRatio * barLength);
      const emptyBlocks = barLength - filledBlocks;
      const progressEmojiBar = '💎'.repeat(filledBlocks) + '⚫'.repeat(emptyBlocks);
      const percent = Math.round(progressRatio * 100);

      // 4. Tạo Embed hồ sơ tu tiên tuyệt đỉnh
      console.log(`[Command hoso] Đang tạo Embed hồ sơ...`);
      const hosoEmbed = new EmbedBuilder()
        .setTitle(`☯️ ĐẾ TÔNG PHIẾU - TIÊN TÍCH HỒ SƠ ☯️`)
        .setDescription(`Hồ sơ ghi nhận quá trình rèn luyện đàm luận linh pháp của tôn giả tại Đấu La Đại Lục`)
        .setColor('#8B008B') // Tím Huyền Bí sang trọng
        .setThumbnail(targetUser.displayAvatarURL({ forceStatic: false }))
        .addFields(
          { name: '👤 Đạo Danh', value: `**${user.characterName}**`, inline: true },
          { name: '🌐 Bản Địa Tông Môn', value: `${user.serverName}`, inline: true },
          { name: '🎖️ Danh Hiệu Cảnh Giới', value: `${user.title || getRankName(user.level)}`, inline: true },
          
          { name: '⚡ Tu Vi Cảnh Giới', value: `**Cấp ${user.level}**`, inline: true },
          { name: '⚜️ Đấu Xu Đế Tông', value: `🪙 **${user.balance.toLocaleString()}** Xu`, inline: true },
          { name: '💥 Lực Chiến Hậu Thiên', value: `⚔️ **${user.combatPower.toLocaleString()}**`, inline: true },
          
          { name: '📚 Linh Lực Tiến Duyệt', value: `${progressEmojiBar} \n**${user.exp.toLocaleString()} / ${neededExp.toLocaleString()} XP** (${percent}%)`, inline: false },
          { name: '🔥 Điểm Danh Streak', value: `📅 Khai ấn liên tiếp: **${user.dailyStreak}** Ngày`, inline: true }
        )
        .setFooter({ text: `Yêu cầu xem từ ${interaction.user.username} • Thần Thông Nhãn`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      console.log(`[Command hoso] Chuẩn bị gửi reply trực tiếp...`);
      await interaction.reply({ embeds: [hosoEmbed] });
      console.log(`[Command hoso] Gửi reply trực tiếp thành công!`);
    } catch (error) {
      console.error('[Command hoso] Lỗi:', error);
      try {
        await interaction.reply({ content: 'Lỗi bất ngờ xảy ra khi trích xuất thiên thư.', flags: [64] });
      } catch (e) {
        console.error('[Command hoso] Không thể gửi báo lỗi reply:', e);
      }
    }
  }
};
