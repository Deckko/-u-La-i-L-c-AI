import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../database/models/User.js';
import { checkLevelUp } from '../../utils/levelUtils.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('diemdanh')
    .setDescription('Điểm danh hàng ngày để nhận Xu Đế Tông xu và nâng cao tu vi'),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const user = await User.findOne({ discordId: interaction.user.id });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ CHƯA GHI DANH TÔNG MÔN ⚠️')
          .setDescription('Đệ tử chưa đăng ký danh tánh! Vui lòng gõ `/dangky` trước khi tiến hành điểm danh đầu ngày.')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      const now = new Date();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const twoDaysMs = 48 * 60 * 60 * 1000;

      // Kiểm tra xem đã đủ 24 giờ kể từ lần điểm danh cuối chưa
      if (user.lastDaily) {
        const timeDiff = now.getTime() - new Date(user.lastDaily).getTime();
        if (timeDiff < oneDayMs) {
          const nextClaimDate = new Date(new Date(user.lastDaily).getTime() + oneDayMs);
          const timeLeftMs = nextClaimDate.getTime() - now.getTime();
          const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
          const minsLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

          const earlyClaimEmbed = new EmbedBuilder()
            .setTitle('⏳ CHI PHỦ ĐÃ KHÓA ⏳')
            .setDescription(`Thiền định hôm nay đã kết thúc! Hãy quay lại sau **${hoursLeft}h ${minsLeft}m** nữa để tiếp tục khai ấn nhận xu niệm pháp.`)
            .setColor('#FF5555')
            .setTimestamp();
          return interaction.reply({ embeds: [earlyClaimEmbed] });
        }

        // Kiểm tra xem có giữ được chuỗi điểm danh (Streak) không
        // Nếu điểm danh sau 48 tiếng kể từ lần trước -> Bị đứt chuỗi
        if (timeDiff > twoDaysMs) {
          user.dailyStreak = 1;
        } else {
          user.dailyStreak += 1;
        }
      } else {
        // Lần đầu tiên điểm danh
        user.dailyStreak = 1;
      }

      // Phần thưởng cơ bản
      let coinReward = 100;
      let expReward = 50;
      let streakBonusText = '';

      // Tính toán mốc thưởng chuỗi đặc biệt (Streak 3, 7, 15, 30 ngày)
      const streak = user.dailyStreak;
      if (streak === 3) {
        coinReward = 150;
        streakBonusText = '🎁 **Mốc 3 Ngày**: Nhận thêm nhân sâm vạn năm (1.5x Xu)';
      } else if (streak === 7) {
        coinReward = 200;
        expReward = 150;
        streakBonusText = '🎁 **Mốc 7 Ngày**: Nhận thêm đan dược Nhị Phẩm (2.0x Xu + 150 XP)';
      } else if (streak === 15) {
        coinReward = 350;
        expReward = 300;
        streakBonusText = '🎁 **Mốc 15 Ngày**: Nhận Huyết Cực Linh Chi Đạo Nhãn (3.5x Xu + 300 XP)';
      } else if (streak >= 30) {
        coinReward = 600;
        expReward = 600;
        // Phần thưởng cực phẩm sau 30 ngày
        streakBonusText = '🎁 **MỐC THÁNH NHÂN 30 NGÀY**: Đột phá Thiên Cơ Đế Tông Ấn (6.0x Xu + 600 XP)';
        if (streak % 30 === 0) {
          // Thưởng thêm lực chiến
          user.combatPower += 1000;
          streakBonusText += ' \n💥 **TẶNG THÊM +1000 LỰC CHIẾN HOÀNG KIM!**';
        }
      }

      // Cập nhật CSDL
      user.balance += coinReward;
      user.exp += expReward;
      user.lastDaily = now;

      const levelUpResult = await checkLevelUp(user, interaction.member as any);
      await user.save();

      let descText = `Vận hành đại chu thiên thành công! Điểm danh ngày hôm nay ghi nhận thành tựu tu vi.`;
      if (levelUpResult.leveledUp) {
        descText += `${levelUpResult.msg}`;
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('📅 ĐẾ TÔNG - KHAI ẤN ĐIỂM DANH 📅')
        .setDescription(descText)
        .setColor('#D4AF37') // Màu Gold
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🔥 Điểm Danh Chuỗi (Streak)', value: `📅 **${streak}** ngày hoạt động`, inline: true },
          { name: '🪙 Thưởng Đấu Xu', value: `+${coinReward} Xu Đế Tông`, inline: true },
          { name: '⚡ Thưởng Cảnh Giới', value: `+${expReward} XP Tu vi`, inline: true }
        )
        .setTimestamp();

      if (streakBonusText) {
        successEmbed.addFields({ name: '🌟 Mốc Thưởng Tích Lũy', value: streakBonusText, inline: false });
      }

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[Command diemdanh] Lỗi:', error);
      try {
        await interaction.reply({ content: 'Thao tác điểm danh thất bại do gặp chướng ngại vật tâm linh.', flags: [64] });
      } catch (e) {
        console.error('[Command diemdanh] Không thể gửi báo lỗi:', e);
      }
    }
  }
};
