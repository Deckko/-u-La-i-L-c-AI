import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { guildService } from '../../services/GuildService.js';
import logger from '../../core/logger.js';

export default {
  cooldown: 3,
  featureFlag: 'guilds',
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('Hệ thống tông môn bang hội toàn cầu Đế Tông')
    .addSubcommand(sub =>
      sub
        .setName('create')
        .setDescription('Khai sáng lập môn lập phái tông môn mới')
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('Tên tông môn bang hội muốn thành lập')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('info')
        .setDescription('Xem thông tin chi tiết tông môn hiện tại của bản thân')
    )
    .addSubcommand(sub =>
      sub
        .setName('invite')
        .setDescription('Chiêu mộ truyền thư mời đệ tử gia nhập tông môn')
        .addUserOption(opt =>
          opt
            .setName('user')
            .setDescription('Tiên nhân muốn truyền thư mời')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('join')
        .setDescription('Đồng ý gia nhập tông môn sau khi nhận lời mời')
    )
    .addSubcommand(sub =>
      sub
        .setName('leave')
        .setDescription('Rút lui thoái ẩn rời khỏi tông môn hiện tại')
    )
    .addSubcommand(sub =>
      sub
        .setName('kick')
        .setDescription('Trục xuất đệ tử ra khỏi tông môn')
        .addUserOption(opt =>
          opt
            .setName('user')
            .setDescription('Đệ tử muốn trục xuất')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('promote')
        .setDescription('Sắc phong đệ tử lên chức vụ Trưởng Lão')
        .addUserOption(opt =>
          opt
            .setName('user')
            .setDescription('Đệ tử muốn sắc phong')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('demote')
        .setDescription('Bãi miễn chức vị Trưởng Lão xuống Đệ Tử')
        .addUserOption(opt =>
          opt
            .setName('user')
            .setDescription('Trưởng Lão muốn bãi chức')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('bank')
        .setDescription('Xem ngân khố tích lũy của tông môn')
    )
    .addSubcommand(sub =>
      sub
        .setName('donate')
        .setDescription('Quyên đóng Đấu Xu của bản thân vào khố phòng tông môn')
        .addIntegerOption(opt =>
          opt
            .setName('amount')
            .setDescription('Số lượng Đấu Xu muốn quyên góp')
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('logs')
        .setDescription('Xem lịch sử giao dịch thu chi của khố phòng bang hội')
    )
    .addSubcommand(sub =>
      sub
        .setName('tech')
        .setDescription('Nâng cấp mật tịch công nghệ tông môn')
        .addStringOption(opt =>
          opt
            .setName('id')
            .setDescription('Loại mật tịch muốn nâng cấp')
            .setRequired(true)
            .addChoices(
              { name: 'Tăng Sát Sức Công Kích (combat_boost)', value: 'combat_boost' },
              { name: 'Cộng Hưởng XP Tu Luyện (exp_boost)', value: 'exp_boost' },
              { name: 'Gia Tăng Đấu Xu Thu Hoạch (coin_boost)', value: 'coin_boost' }
            )
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'create') {
      const name = interaction.options.getString('name')!.trim();
      if (name.length < 3 || name.length > 20) {
        return interaction.reply({ content: '⚠️ **Thất bại**: Tên tông môn phải từ 3 đến 20 ký tự.', flags: [64] });
      }

      try {
        const res = await guildService.createGuild(name, userId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('💮 KHAI SƠN LẬP PHÁI THÀNH CÔNG 💮')
          .setDescription(`Chúc mừng tiên nhân **${interaction.user.username}** đã khai sơn lập phái thành công tông môn mới:\n\n🏰 **${name}** 🏰`)
          .setColor('#FFD700')
          .setThumbnail(interaction.user.displayAvatarURL())
          .addFields(
            { name: '👑 Bang Chủ', value: `<@${userId}>`, inline: true },
            { name: '🌾 Cấp Bậc Tông Môn', value: 'Level 1', inline: true },
            { name: '👥 Dung Lượng', value: '10 đệ tử', inline: true }
          )
          .setFooter({ text: 'Hãy kêu gọi bằng hữu gia nhập để hưng thịnh tông môn!' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild create] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi thiên cơ lập bang.', flags: [64] });
      }
    }

    if (subcommand === 'info') {
      try {
        const res = await guildService.getGuildInfo(userId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const { guild, members, techList, ranking, memberRole } = res;

        const roleNames = {
          master: '👑 Bang Chủ',
          elder: '🛡️ Trưởng Lão',
          member: '🌾 Đệ Tử'
        };

        const techNames = {
          combat_boost: '⚡ Mật Tịch Công Kích (Lực chiến)',
          exp_boost: '⭐ Mật Tịch Tu Luyện (Cộng XP)',
          coin_boost: '🪙 Mật Tịch Tích Lũy (Cộng Xu)'
        };

        const memberText = members
          ? members.map((m, i) => `${i + 1}. <@${m.userId}> - *${roleNames[m.role as keyof typeof roleNames] || m.role}* (Cống hiến: 🪙 ${m.totalContribution.toLocaleString()})`).join('\n')
          : '*Không tìm thấy đệ tử nào.*';

        const techText = techList && techList.length > 0
          ? techList.map(t => `↳ **${techNames[t.techId as keyof typeof techNames] || t.techId}**: Cấp **${t.level}**`).join('\n')
          : '*Chưa nâng cấp mật tịch nào.*';

        const embed = new EmbedBuilder()
          .setTitle(`🏰 TÔNG MÔN BAO ĐIỂN: ${guild!.guildName.toUpperCase()} 🏰`)
          .setDescription(guild!.description || 'Tông môn tu tiên thanh tao.')
          .setColor('#8B008B')
          .setThumbnail(interaction.guild?.iconURL() || interaction.user.displayAvatarURL())
          .addFields(
            { name: '🌾 Cấp bậc Tông Môn', value: `Lv. **${guild!.level}** (${guild!.xp} XP)`, inline: true },
            { name: '👑 Sáng Lập / Bang Chủ', value: `<@${guild!.masterId}>`, inline: true },
            { name: '🛡️ Chức Vị Bản Thân', value: `*${roleNames[memberRole as keyof typeof roleNames] || memberRole}*`, inline: true },
            { name: '🪙 Ngân Khố Tông Môn', value: `🪙 **${guild!.treasuryCoins.toLocaleString()}** Đấu Xu`, inline: true },
            { name: '🏆 Điểm Danh Vọng Bang', value: `🏆 **${ranking ? ranking.points.toLocaleString() : 0}** điểm`, inline: true },
            { name: '⛰️ Lãnh Thổ Chiếm Giữ', value: `📍 **${guild!.territoryName || 'Chưa chiếm đóng'}**`, inline: true },
            { name: '✨ Mật Tịch Công Nghệ Tông Môn', value: techText, inline: false },
            { name: '👥 Danh Sách Đệ Tử Quy Thuộc', value: memberText, inline: false }
          )
          .setFooter({ text: 'Tông môn đoàn kết tu thành chánh quả!' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild info] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi pháp trận lấy thông tin bang.', flags: [64] });
      }
    }

    if (subcommand === 'invite') {
      const invitee = interaction.options.getUser('user')!;
      if (invitee.id === userId) {
        return interaction.reply({ content: '⚠️ **Thất bại**: Đồng đạo tự mời bản thân làm gì?', flags: [64] });
      }

      try {
        const res = await guildService.inviteUser(userId, invitee.id);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('✉️ CHIÊU MỘ TIÊN NHÂN ✉️')
          .setDescription(`Một phong thư chiêu mộ đệ tử đã được gửi tới <@${invitee.id}>.\n\nĐồng đạo hãy gõ lệnh \`/guild join\` để quy thuận tông môn trong vòng 1 giờ!`)
          .setColor('#1E90FF')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild invite] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi thiên thư chiêu mộ.', flags: [64] });
      }
    }

    if (subcommand === 'join') {
      try {
        const res = await guildService.acceptInvite(userId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('💮 GIA NHẬP TÔNG MÔN THÀNH CÔNG 💮')
          .setDescription(`Chúc mừng tiên nhân đã gia nhập tông môn **${res.guildName}**! \n\nHãy làm rạng danh môn phái tôn kính của bạn.`)
          .setColor('#10B981')
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild join] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi thiên cơ khi đồng ý nhập bang.', flags: [64] });
      }
    }

    if (subcommand === 'leave') {
      try {
        const res = await guildService.leaveGuild(userId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('🍂 RỜI BỎ TÔNG MÔN 🍂')
          .setDescription('Đạo hữu đã hoàn tất thủ tục thoái ẩn, trở thành tiên nhân tự do tiêu dao tự tại.')
          .setColor('#FF9900')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild leave] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi trận pháp khi rời bang.', flags: [64] });
      }
    }

    if (subcommand === 'kick') {
      const target = interaction.options.getUser('user')!;
      try {
        const res = await guildService.kickMember(userId, target.id);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('🛡️ TRỤC XUẤT ĐỆ TỬ 🛡️')
          .setDescription(`Thành viên <@${target.id}> đã bị trục xuất khỏi bang hội thành công do vi phạm tông quy!`)
          .setColor('#FF3333')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild kick] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi trục xuất đệ tử.', flags: [64] });
      }
    }

    if (subcommand === 'promote') {
      const target = interaction.options.getUser('user')!;
      try {
        const res = await guildService.promoteMember(userId, target.id);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('🛡️ SẮC PHONG TRƯỞNG LÃO 🛡️')
          .setDescription(`Chúc mừng <@${target.id}> đã được sắc phong lên chức vị **Trưởng Lão** tông môn!`)
          .setColor('#10B981')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild promote] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi sắc phong.', flags: [64] });
      }
    }

    if (subcommand === 'demote') {
      const target = interaction.options.getUser('user')!;
      try {
        const res = await guildService.demoteMember(userId, target.id);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('🍂 BÃI MIỄN CHỨC VỤ 🍂')
          .setDescription(`Thành viên <@${target.id}> đã bị bãi miễn chức vụ Trưởng Lão xuống đệ tử phổ thông.`)
          .setColor('#FF9900')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild demote] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi bãi chức.', flags: [64] });
      }
    }

    if (subcommand === 'bank') {
      try {
        const res = await guildService.getGuildLogs(userId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('🪙 KHỐ PHÒNG NGÂN QUỸ TÔNG MÔN 🪙')
          .setDescription(`Tổng quỹ ngân sách tích lũy của tông môn:\n\n🪙 **${res.balance!.toLocaleString()} Đấu Xu**`)
          .setColor('#FFD700')
          .setFooter({ text: 'Quyên góp để mở rộng ngân quỹ nâng cấp công nghệ bang!' })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild bank] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi lấy quỹ khố.', flags: [64] });
      }
    }

    if (subcommand === 'donate') {
      const amount = interaction.options.getInteger('amount')!;
      try {
        const res = await guildService.donateCoins(userId, amount);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const embed = new EmbedBuilder()
          .setTitle('💮 QUYÊN GÓP HÀNG TÂM QUỸ 💮')
          .setDescription(`Quyên góp thành công **🪙 ${amount.toLocaleString()} Đấu Xu** vào ngân quỹ tông phái!\n\nSố dư khố phòng cá nhân mới: **🪙 ${res.newBalance!.toLocaleString()}**`)
          .setColor('#10B981')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild donate] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi quyên góp.', flags: [64] });
      }
    }

    if (subcommand === 'logs') {
      try {
        const res = await guildService.getGuildLogs(userId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const logs = res.logs || [];
        const embed = new EmbedBuilder()
          .setTitle('📊 NHẬT KÝ THU CHI TÔNG MÔN 📊')
          .setColor('#FF9900')
          .setTimestamp();

        let logText = '';
        if (logs.length === 0) {
          logText = '*Không có ghi chép giao dịch nào gần đây.*';
        } else {
          logs.slice(0, 15).forEach((log) => {
            const actionText = log.action === 'deposit' ? '🟢 +Nạp xu' : '🔴 -Rút xu';
            logText += `**${actionText}**: 🪙 **${log.amount.toLocaleString()}** | Người làm: <@${log.userId}>\n↳ *Lý do:* *${log.reason}*\n\n`;
          });
        }

        embed.setDescription(logText);
        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild logs] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi lấy nhật ký giao dịch.', flags: [64] });
      }
    }

    if (subcommand === 'tech') {
      const techId = interaction.options.getString('id')! as 'combat_boost' | 'exp_boost' | 'coin_boost';
      try {
        const res = await guildService.upgradeTechnology(userId, techId);
        if (!res.success) {
          return interaction.reply({ content: `⚠️ **Thất bại**: ${res.error}`, flags: [64] });
        }

        const techNames = {
          combat_boost: '⚡ Mật Tịch Công Kích (Lực chiến)',
          exp_boost: '⭐ Mật Tịch Tu Luyện (Cộng XP)',
          coin_boost: '🪙 Mật Tịch Tích Lũy (Cộng Xu)'
        };

        const embed = new EmbedBuilder()
          .setTitle('💮 NÂNG CẤP MẬT TỊCH CÔNG NGHỆ THÀNH CÔNG 💮')
          .setDescription(`Tông môn đã gia cường thành công mật tịch **${techNames[techId]}**!\n\nCấp độ mật tịch mới: **Cấp ${res.newLevel}**`)
          .setColor('#10B981')
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command guild tech] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi nâng cấp mật tịch.', flags: [64] });
      }
    }
  }
};
