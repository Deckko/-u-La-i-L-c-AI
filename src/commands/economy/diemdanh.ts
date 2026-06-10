import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { retentionService } from '../../services/RetentionService.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('diemdanh')
    .setDescription('Điểm danh hàng ngày để nhận Xu Đế Tông xu và nâng cao tu vi'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId || 'global';

    try {
      const res = await retentionService.processDailyCheckin(userId, guildId, interaction.member);

      if (!res.success) {
        const errEmbed = new EmbedBuilder()
          .setTitle('⏳ CHI PHỦ ĐÃ KHÓA ⏳')
          .setDescription(res.error || 'Thao tác điểm danh thất bại.')
          .setColor('#FF5555')
          .setTimestamp();
        return interaction.reply({ embeds: [errEmbed] });
      }

      let descText = `Vận hành đại chu thiên thành công! Điểm danh ngày hôm nay ghi nhận thành tựu tu vi.`;
      
      const successEmbed = new EmbedBuilder()
        .setTitle('📅 ĐẾ TÔNG - KHAI ẤN ĐIỂM DANH 📅')
        .setDescription(descText)
        .setColor('#D4AF37') // Màu Gold
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🔥 Điểm Danh Chuỗi (Streak)', value: `📅 **${res.streak}** ngày hoạt động`, inline: true },
          { name: '🪙 Thưởng Đấu Xu', value: `+${res.coinsAwarded} Xu Đế Tông`, inline: true },
          { name: '⚡ Thưởng Cảnh Giới', value: `+${res.expAwarded} XP Tu vi`, inline: true }
        )
        .setTimestamp();

      if (res.combatPowerAwarded > 0) {
        successEmbed.addFields({ name: '💥 Thưởng Lực Chiến', value: `+${res.combatPowerAwarded} Linh lực`, inline: true });
      }

      if (res.bonusesClaimed.length > 0) {
        successEmbed.addFields({ name: '🌟 Mốc Thưởng Tích Lũy', value: res.bonusesClaimed.join('\n'), inline: false });
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
