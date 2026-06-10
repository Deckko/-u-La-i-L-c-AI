import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../database/models/User.js';
import Giftcode from '../../database/models/Giftcode.js';
import { checkLevelUp } from '../../utils/levelUtils.js';

export default {
  cooldown: 5, // Cooldown chống dập nhầm nút spam mạng lưới nhập code
  data: new SlashCommandBuilder()
    .setName('redeem')
    .setDescription('Nhập mật từ Giftcode nhận linh dược ban lộc từ tông môn Đế Tông')
    .addStringOption(option => 
      option.setName('code')
        .setDescription('Nhập mã Giftcode bạn đang sở hữu')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const codeInput = interaction.options.getString('code')!.trim().toUpperCase();

    try {
      // 1. Kiểm tra tài khoản đệ tử
      const user = await User.findOne({ discordId: userId });
      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ CHƯA GHI DANH TÔNG MÔN ⚠️')
          .setDescription('Đồng đạo chưa thực hiện `/dangky` để mở tài khoản khố phòng! Hãy đăng ký ghi danh trước khi nhận ấn thưởng.')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      // 2. Tìm kiếm Giftcode trong Database
      const gift = await Giftcode.findOne({ code: codeInput });

      if (!gift) {
        const codeNotFound = new EmbedBuilder()
          .setTitle('❌ MẬT CHỈ VÔ HIỆU ❌')
          .setDescription(`Mật hiệu Giftcode **${codeInput}** không tồn tại bách biến trên hệ thống bảo pháp! Vui lòng kiểm tra lại.`)
          .setColor('#EF4444');
        return interaction.reply({ embeds: [codeNotFound] });
      }

      // 3. Kiểm tra số lượt nhập tối đa
      if (gift.usedCount >= gift.maxUses) {
        const expiredEmbed = new EmbedBuilder()
          .setTitle('💸 PHÚC LỘC ĐÃ HẾT CỰC 💸')
          .setDescription(`Mật tự **${codeInput}** đã hoàn toàn cạn kiệt khí khí linh dược! Toàn bộ số lượt nhận tối đa (**${gift.maxUses}**) đã bị đệ tử khác nhanh tay thâu tóm.`)
          .setColor('#F59E0B');
        return interaction.reply({ embeds: [expiredEmbed] });
      }

      // 4. Kiểm tra xem đệ tử này đã nhận mã này trước đó chưa
      if (gift.usedBy.includes(userId)) {
        const alreadyClaimed = new EmbedBuilder()
          .setTitle('⚠️ THAM LAM CẤM ĐỌAT ⚠️')
          .setDescription(`Bạn đã quy đổi mật lộc của **${codeInput}** từ kiếp trước! Mỗi đệ tử tiên môn chỉ được phép thụ lộc mật tự này đúng một lần duy nhất.`)
          .setColor('#EF4444');
        return interaction.reply({ embeds: [alreadyClaimed] });
      }

      // 5. Thực hiện trao lộc ban thưởng
      gift.usedBy.push(userId);
      gift.usedCount += 1;
      await gift.save();

      // Cộng dồn lộc thưởng cho tài khoản User
      user.balance += gift.rewardCoins;
      user.exp += gift.rewardExp;
      
      const levelUpResult = await checkLevelUp(user, interaction.member as any);
      await user.save();

      let descText = `Giải mã thành công phong thư thần quyết mật hiệu **${gift.code}**! Linh lực bổ vây hấp thụ nhanh chóng vào khí hải.`;
      if (levelUpResult.leveledUp) {
        descText += `${levelUpResult.msg}`;
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('🎁 ẤN PHÁT THÀNH ĐỒNG - THỤ NHẬN TIÊN LỘC 🎁')
        .setDescription(descText)
        .setColor('#10B981')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🪙 Tăng Thêm Linh Thạch', value: `+${gift.rewardCoins.toLocaleString()} Xu`, inline: true },
          { name: '⚡ Khôi Phục Tu Vi', value: `+${gift.rewardExp.toLocaleString()} XP Cảnh giới`, inline: true },
          { name: '📊 Sức Chứa Khố Phòng', value: `🪙 **${user.balance.toLocaleString()}** Xu`, inline: false }
        )
        .setFooter({ text: `Lượt nhập của mật ấn này: ${gift.usedCount} / ${gift.maxUses}` })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[Command redeem] Lỗi quy đổi:', error);
      try {
        await interaction.reply({ content: 'Ấn khí bị dồn nghẽn trầm trọng, quy đổi tiên lộc bất thành.', flags: [64] });
      } catch (e) {
        console.error('[Command redeem] Không thể gửi báo lỗi:', e);
      }
    }
  }
};
