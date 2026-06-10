import { Message, EmbedBuilder } from 'discord.js';
import User from '../database/models/User.js';
import { isOnXPCooldown } from '../utils/redisUtils.js';
import { levelService } from '../services/LevelService.js';
import logger from '../core/logger.js';

export default {
  name: 'messageCreate',
  async execute(message: Message) {
    if (message.author.bot || !message.guild || !message.member) return;

    try {
      const user = await User.findOne({ discordId: message.author.id });
      if (!user || !user.registered) return;

      const cooldownActive = await isOnXPCooldown(message.author.id);
      if (cooldownActive) return;

      user.exp += 3;

      const coinReward = Math.floor(Math.random() * 3) + 1; 
      user.balance += coinReward;

      const levelUpResult = await levelService.checkLevelUp(user, message.member);
      await user.save();

      if (levelUpResult.leveledUp) {
        const levelUpEmbed = new EmbedBuilder()
          .setTitle('🎉 ĐẾ TÔNG - TU VI ĐỘT PHÁ 🎉')
          .setDescription(`Chúc mừng đệ tử **${user.characterName || message.author.username}** đã đột phá cảnh giới mới!`)
          .setColor('#FFD700') 
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
      logger.error('[Event messageCreate] Lỗi xử lý Chat XP:', error);
    }
  }
};
