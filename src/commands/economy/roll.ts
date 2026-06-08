import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../models/User.js';

export default {
  cooldown: 4,
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Quay số khải huyền Đấu La cược xu thắng lớn rực rỡ')
    .addIntegerOption(option => 
      option.setName('cuoc')
        .setDescription('Số Xu Đế Tông bạn muốn đặt cược (Tối thiểu 10 xu)')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('cuoc')!;

    // Kiểm tra cược có hợp lệ
    if (bet < 10) {
      const errEmbed = new EmbedBuilder()
        .setTitle('❌ ĐẶT CƯỢC QUÁ THẤP ❌')
        .setDescription('Số xu cược tối thiểu là **10 Xu Đế Tông**.')
        .setColor('#FF5555');
      return interaction.reply({ embeds: [errEmbed] });
    }

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Gõ `/dangky` để ghi tên nhập đạo trước khi xuống sòng xúc xắc!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      if (user.balance < bet) {
        const errEmbed = new EmbedBuilder()
          .setTitle('❌ THUỐC NHUỘM KHÔNG ĐỦ ❌')
          .setDescription(`Linh thạch trong khố phòng của bạn không đủ! Hiện tại chỉ có **${user.balance} Xu** nhưng muốn cược **${bet} Xu**.`)
          .setColor('#FF5555');
        return interaction.reply({ embeds: [errEmbed] });
      }

      // Vận hành hỏa linh xúc xắc 1 -> 100
      const rollNum = Math.floor(Math.random() * 100) + 1;
      let winRatio = 0;
      let resultText = '';
      let winColor = '#EF4444'; // Red for loss

      if (rollNum <= 50) {
        winRatio = 0;
        resultText = `💸 **CHUNG CUỘC THẤT BẠI**: Số quay ra là **${rollNum}** (Yêu cầu > 50). Linh tinh của bạn bị mây mù cuốn phăng!`;
        user.balance -= bet;
      } else if (rollNum <= 84) {
        winRatio = 1.5;
        resultText = `🎉 **THẮNG NHỎ (Tiểu Thắng)**: Số quay ra là **${rollNum}**. Bạn nhận về **1.5 lần** cược!`;
        winColor = '#3B82F6'; // Blue
        user.balance += Math.floor(bet * (winRatio - 1));
      } else if (rollNum <= 97) {
        winRatio = 2.0;
        resultText = `🔥 **ĐẠI THẮNG (Cực Phú)**: Số quay ra là **${rollNum}** cực kỳ đẹp mắt. Nhận về gấp **2.0 lần** tiền cược!`;
        winColor = '#D4AF37'; // Gold
        user.balance += bet; // + 100%
      } else {
        winRatio = 4.0;
        resultText = `👑 **CHÍ TÔN ĐỐP TRÚNG 100 (BÁ TỰ)**: Con số vương giả đỉnh cấp **${rollNum}** xuất hiện! Hưởng **4.0 lần** cược hồi tông môn!`;
        winColor = '#A855F7'; // Purple
        user.balance += bet * 3; // + 300%
      }

      await user.save();

      const rollEmbed = new EmbedBuilder()
        .setTitle('🎲 LINH HUYỀN XOAY TOÀN - THIÊN BẢNG SỐ 🎲')
        .setDescription(`Vừa quay ra thần số càn khôn phong vân đọ vận khí của Thượng Giới!`)
        .setColor(winColor as any)
        .addFields(
          { name: 'Xoay Thần Số', value: `✨ **${rollNum}**`, inline: true },
          { name: 'Tiền Tiên Cược', value: `🪙 ${bet.toLocaleString()} Xu`, inline: true },
          { name: 'Tỷ Lệ Nhận', value: `x${winRatio}`, inline: true },
          { name: 'Kế Quả Thần Thông', value: resultText, inline: false },
          { name: 'Khố Phòng Còn Lại', value: `🪙 **${user.balance.toLocaleString()}** Xu`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [rollEmbed] });
    } catch (error) {
      console.error('[Command roll] Lỗi:', error);
      await interaction.reply('Khay số bị nghẽn đĩa xoay pháp, cược thất bại.');
    }
  }
};
