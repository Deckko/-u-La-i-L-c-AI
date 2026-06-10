import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../database/models/User.js';

const SLOT_ICONS = ['☘️', '⚒️', '👁️', '🔮', '👑'];

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('Chơi ma pháp máy xèng Đế Tông tầm bảo linh thạch nhân 8 tài sản')
    .addIntegerOption(option => 
      option.setName('cuoc')
        .setDescription('Số xu cược tiên thạch (Tối thiểu 10 xu)')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('cuoc')!;

    if (bet < 10) {
      const errEmbed = new EmbedBuilder()
        .setTitle('❌ ĐẶT CƯỢC QUÁ THẤP ❌')
        .setDescription('Tối thiểu cược tại pháp trận Slot phải là **10 Xu**.')
        .setColor('#FF5555');
      return interaction.reply({ embeds: [errEmbed] });
    }

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Gõ `/dangky` ghi danh bách vạn gia tộc Đế Tông mới được dùng máy xèng Tông Môn!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      if (user.balance < bet) {
        const errEmbed = new EmbedBuilder()
          .setTitle('❌ KHÔNG ĐỦ TIỀN ❌')
          .setDescription(`Ngân sách chỉ còn **${user.balance} Xu**, không đủ để cược **${bet} Xu**!`)
          .setColor('#FF5555');
        return interaction.reply({ embeds: [errEmbed] });
      }

      // Xoay 3 ô ngẫu nhiên
      const r1 = SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)];
      const r2 = SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)];
      const r3 = SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)];

      let multiplier = 0;
      let winText = '';
      let winColor = '#EF4444'; // Đỏ (Thất bại)

      // Kiểm tra các mốc thắng
      if (r1 === r2 && r2 === r3) {
        // Trùng cả 3 khay xèng
        if (r1 === '👑') {
          multiplier = 10;
          winText = '👑 **HUYỀN THOẠI THẦN VƯƠNG ANH THƯ**: Thắng x10 lần cược!';
        } else if (r1 === '🔮') {
          multiplier = 6;
          winText = '🔮 **CHÍ CỰC THỂ KHÁM TRÚNG**: Thắng x6 lần cược!';
        } else {
          multiplier = 4;
          winText = '✨ **TAM ĐẠO LIÊN HOÀN (3 Trùng)**: Thắng x4 lần cược!';
        }
        winColor = '#D4AF37'; // Gold
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // Trùng 2 khay xèng kề nhau
        multiplier = 1.6;
        winText = '⭐ **SONG LONG CHU CHUYỂN (2 Trùng)**: Thắng x1.6 lần cược!';
        winColor = '#3B82F6'; // Blue
      } else {
        // Không trùng gì
        multiplier = 0;
        winText = '💸 **VÔ GIANG ĐẠO THẤT**: Pháp khí lệch quỹ đạo. Bạn mất sạch số xu cược !';
        winColor = '#EF4444'; // Red
      }

      // Thanh toán
      if (multiplier > 0) {
        // Thắng cược
        const rewardCoins = Math.floor(bet * multiplier);
        user.balance += (rewardCoins - bet); // Cộng thêm số tiền chênh lệch dương
      } else {
        // Thua cược
        user.balance -= bet;
      }

      await user.save();

      const slotEmbed = new EmbedBuilder()
        .setTitle('🎰 ĐẾ TÔNG MA PHÁP SLOT MACHINE 🎰')
        .setDescription('Kéo cần xèng phong vân bùng nổ tài lộc càn khôn vũ trụ!')
        .setColor(winColor as any)
        .addFields(
          { name: 'Khay Xèng Xoay', value: `\n ━━━━━━━━━━━ \n  [  **${r1}**  |  **${r2}**  |  **${r3}**  ]  \n ━━━━━━━━━━━ \n`, inline: false },
          { name: 'Cước Phí Cược', value: `🪙 ${bet.toLocaleString()} Xu`, inline: true },
          { name: 'Vận Cát Kết Quả', value: winText, inline: false },
          { name: 'Hiện trạng Khố phòng', value: `🪙 **${user.balance.toLocaleString()}** Xu`, inline: true }
        )
        .setFooter({ text: '☘️ Tà Áo Băng Hỏa • Vận Khí Thăng Trầm' })
        .setTimestamp();

      await interaction.reply({ embeds: [slotEmbed] });
    } catch (error) {
      console.error('[Command slot] Lỗi:', error);
      await interaction.reply('Tay gạt bị kẹt linh khí môn hạ, máy slot đóng băng tạm thời.');
    }
  }
};
