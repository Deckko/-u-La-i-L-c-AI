import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { questService } from '../../services/QuestService.js';
import logger from '../../core/logger.js';

export default {
  cooldown: 3,
  featureFlag: 'quests',
  data: new SlashCommandBuilder()
    .setName('quest')
    .setDescription('Hệ thống nhiệm vụ tu tiên hàng ngày, hàng tuần, hàng tháng')
    .addSubcommand(sub =>
      sub
        .setName('daily')
        .setDescription('Xem danh sách nhiệm vụ hàng ngày (Daily)')
    )
    .addSubcommand(sub =>
      sub
        .setName('weekly')
        .setDescription('Xem danh sách nhiệm vụ hàng tuần (Weekly)')
    )
    .addSubcommand(sub =>
      sub
        .setName('monthly')
        .setDescription('Xem danh sách nhiệm vụ hàng tháng (Monthly)')
    )
    .addSubcommand(sub =>
      sub
        .setName('claim')
        .setDescription('Nhận phần thưởng cho nhiệm vụ đã hoàn thành')
        .addStringOption(opt =>
          opt
            .setName('id')
            .setDescription('Mã định danh (ID) của nhiệm vụ cần nhận thưởng')
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const guildId = interaction.guildId || 'global';

    if (subcommand === 'daily' || subcommand === 'weekly' || subcommand === 'monthly') {
      try {
        const questList = await questService.getPlayerQuests(userId, subcommand);
        
        const typeNames = {
          daily: 'HÀNG NGÀY (DAILY)',
          weekly: 'HÀNG TUẦN (WEEKLY)',
          monthly: 'HÀNG THÁNG (MONTHLY)'
        };

        const embed = new EmbedBuilder()
          .setTitle(`📜 MẬT DIỂN NHIỆM VỤ ${typeNames[subcommand]} 📜`)
          .setDescription('Chư vị tiên nhân hãy tích cực hoàn thành nhiệm vụ để thu thập tài nguyên tu luyện:')
          .setColor('#0099FF')
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        let questText = '';
        if (questList.length === 0) {
          questText = '*Hiện tại không có nhiệm vụ nào thuộc loại này trong thiên cơ.*';
        } else {
          questList.forEach((q) => {
            const status = q.claimed 
              ? '🎁 **[Đã nhận thưởng]**' 
              : q.completed 
                ? '✅ **[Đã hoàn thành - Sẵn sàng nhận /quest claim]**' 
                : `⏳ **[Đang thực hiện: ${q.progress}/${q.quest.targetCount}]**`;
            
            questText += `🔹 **${q.quest.description}** (\`${q.quest.questId}\`)\n` +
                         `↳ *Phần thưởng:* 🪙 **${q.quest.rewardCoins} Đấu Xu** | ⭐ **${q.quest.rewardExp} XP**\n` +
                         `↳ *Trạng thái:* ${status}\n\n`;
          });
        }

        embed.setDescription(questText);
        embed.setFooter({ text: 'Gõ /quest claim <id> để quy đổi phần thưởng linh thạch!' });
        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error(`[Command quest ${subcommand}] Lỗi:`, error);
        return interaction.reply({ content: 'Lỗi thiên trận khi mở Mật Điển Nhiệm Vụ.', flags: [64] });
      }
    }

    if (subcommand === 'claim') {
      const questId = interaction.options.getString('id')!.trim();
      try {
        const res = await questService.claimReward(userId, guildId, questId, interaction.member);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const successEmbed = new EmbedBuilder()
          .setTitle('💮 PHÁT THƯỞNG PHÁP BẢO NHIỆM VỤ 💮')
          .setDescription(`Chúc mừng đệ tử đã hoàn thành xuất sắc nhiệm vụ và nhận đãi ngộ tông môn:\n\n✨ **${questId}** ✨`)
          .setColor('#10B981')
          .setThumbnail(interaction.user.displayAvatarURL())
          .addFields(
            { name: '🪙 Đấu Xu Thu Hoạch', value: `+🪙 **${res.coins}**`, inline: true },
            { name: '⭐ XP Tu Vi', value: `+⭐ **${res.exp}**`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Tu vi đệ tử đã được củng cố thăng tiến!' });

        return interaction.reply({ embeds: [successEmbed] });
      } catch (error) {
        logger.error('[Command quest claim] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi pháp trận tông môn khi nhận thưởng nhiệm vụ.', flags: [64] });
      }
    }
  }
};
