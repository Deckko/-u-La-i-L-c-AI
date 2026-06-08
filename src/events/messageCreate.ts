import { Message, EmbedBuilder } from 'discord.js';
import User from '../models/User.js';
import { isOnXPCooldown, addXPToCache } from '../utils/redisUtils.js';
import { xpToNextLevel, getRankName, updateGuildMemberRole, checkLevelUp } from '../utils/levelUtils.js';

export default {
  name: 'messageCreate',
  async execute(message: Message) {
    // 1. Chỉ tính XP cho tin nhắn hợp lệ (Không phải bot, trong Guild Server)
    if (message.author.bot || !message.guild || !message.member) return;

    try {
      // 2. Tìm kiếm thông tin đệ tử trong Database
      const user = await User.findOne({ discordId: message.author.id });
      
      // Nếu chưa đăng ký thì bỏ qua hoặc nhắc nhẹ (không spam, chỉ ghi nhận nếu đăng ký rồi)
      if (!user || !user.registered) return;

      // 3. Kiểm tra Cooldown Chat XP (60 giây mỗi lần đàm thoại)
      const cooldownActive = await isOnXPCooldown(message.author.id);
      if (cooldownActive) return;

      // 4. Cộng 3 XP vào DB
      user.exp += 3;

      // Thưởng ngẫu nhiên một ít linh thạch/Xu Đế Tông khi chat (Để kích thích chat hoạt động)
      const coinReward = Math.floor(Math.random() * 3) + 1; // 1 -> 3 xu
      user.balance += coinReward;

      // 5. Kiểm tra nâng cấp (Tính toán thời gian thực dựa trên XP tích lũy)
      const levelUpResult = await checkLevelUp(user, message.member);

      await user.save();

      if (levelUpResult.leveledUp) {
        // Tạo Embed thông báo thăng cấp vô cùng tinh xảo chuẩn võ hiệp tông môn
        const levelUpEmbed = new EmbedBuilder()
          .setTitle('🎉 ĐẾ TÔNG - TU VI ĐỘT PHÁ 🎉')
          .setDescription(`Chúc mừng đệ tử **${user.characterName || message.author.username}** đã đột phá cảnh giới mới!`)
          .setColor('#FFD700') // Màu Vàng Hoàng Kim đặc trưng Đế Tông
          .setThumbnail(message.author.displayAvatarURL({ forceStatic: false }))
          .addFields(
            { name: 'Cấp Cũ', value: `✨ Cấp ${levelUpResult.oldLevel} (${levelUpResult.oldRank})`, inline: true },
            { name: 'Cấp Mới', value: `⚡ Cấp ${levelUpResult.newLevel} (${levelUpResult.newRank})`, inline: true },
            { name: 'Lực Chiến Tăng', value: `💥 +${levelUpResult.powerGained?.toLocaleString()} Lực chiến`, inline: false }
          )
          .setFooter({ text: 'Thần giới Đấu La vạn năm vĩnh hằng', iconURL: message.guild.iconURL() || undefined })
          .setTimestamp();

        await message.reply({ embeds: [levelUpEmbed] });
      }
    } catch (error) {
      console.error('[Event messageCreate] Lỗi xử lý Chat XP:', error);
    }
  }
};
