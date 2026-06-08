import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../models/User.js';

export default {
  cooldown: 4,
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Tung linh ấn Đấu La cổ chí (Băng hay Hỏa) cược nhân đôi số xu')
    .addStringOption(option => 
      option.setName('mat')
        .setDescription('Chọn một trong hai mặt linh huyền')
        .setRequired(true)
        .addChoices(
          { name: '❄️ Băng Hồn Mặt (Băng)', value: 'bang' },
          { name: '🔥 Hỏa Thần Mặt (Hỏa)', value: 'hoa' }
        )
    )
    .addIntegerOption(option => 
      option.setName('cuoc')
        .setDescription('Số xu cược tiên thạch (Tối thiểu 10 xu)')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const chosenFace = interaction.options.getString('mat')!;
    const bet = interaction.options.getInteger('cuoc')!;

    if (bet < 10) {
      const errEmbed = new EmbedBuilder()
        .setTitle('❌ ĐẶT CƯỢC QUÁ THẤP ❌')
        .setDescription('Tối thiểu cược phải rải ra **10 Xu**.')
        .setColor('#FF5555');
      return interaction.reply({ embeds: [errEmbed] });
    }

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Gõ `/dangky` để đăng ký gia tộc Đế Tông rồi mới thâm gia đọ tài!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      if (user.balance < bet) {
        const errEmbed = new EmbedBuilder()
          .setTitle('❌ THIẾU LINH ĐỒNG ❌')
          .setDescription(`Tổng quỹ của bạn chỉ có **${user.balance} Xu**, không đủ cược **${bet} Xu**!`)
          .setColor('#FF5555');
        return interaction.reply({ embeds: [errEmbed] });
      }

      // Tung mặt đồng xu (50% cơ hội thắng)
      const isFire = Math.random() < 0.50;
      const winningFace = isFire ? 'hoa' : 'bang';
      const labelUser = chosenFace === 'hoa' ? '🔮 Hỏa Thần' : '❄️ Băng Hồn';
      const labelWinning = winningFace === 'hoa' ? '🔮 Hỏa Thần Mặt' : '❄️ Băng Hồn Mặt';

      let win = (chosenFace === winningFace);
      let newBalance = user.balance;

      if (win) {
        newBalance += bet;
        user.balance = newBalance;
      } else {
        newBalance -= bet;
        user.balance = newBalance;
      }

      await user.save();

      const resultColor = win ? '#10B981' : '#EF4444';
      const resultTitle = win ? '🎉 LINH ẤN TRÙNG KHỚP - PHÁT ĐẠI TÀI 🎉' : '💸 LINH ẤN LỆCH HƯỚNG - MẤT XU LỆ LỘC 💸';
      const resultText = win 
        ? `Chúc mừng đồng đạo đã đoán trúng! Khai triển thành công linh lực thu hoạch thâm **+${bet} Xu**.` 
        : `Linh khí không phù trợ hướng này! Bạn đoán **${labelUser}** nhưng linh ấn rơi trúng mặt **${labelWinning}** (Mất **-${bet} Xu**).`;

      const cfEmbed = new EmbedBuilder()
        .setTitle(resultTitle)
        .setDescription(resultText)
        .setColor(resultColor)
        .addFields(
          { name: 'Đoán Linh Ấn', value: labelUser, inline: true },
          { name: 'Kết quả tung', value: labelWinning, inline: true },
          { name: 'Cước phí cược', value: `🪙 ${bet.toLocaleString()} Xu`, inline: true },
          { name: 'Khố Phòng hiện tại', value: `🪙 **${user.balance.toLocaleString()}** Xu`, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [cfEmbed] });
    } catch (error) {
      console.error('[Command coinflip] Lỗi:', error);
      try {
        await interaction.reply({ content: 'Lân ấn rớt vào kẽ đá, giao dịch cược bị đóng băng.', flags: [64] });
      } catch (e) {
        console.error('[Command coinflip] Không thể gửi báo lỗi:', e);
      }
    }
  }
};
