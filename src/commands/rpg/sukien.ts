import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  PermissionFlagsBits, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import EventModel from '../../models/Event.js';
import User from '../../models/User.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('sukien')
    .setDescription('Hệ thống quản lý và tham gia sự kiện tông môn Đế Tông')
    .addSubcommand(subcmd => 
      subcmd.setName('tao')
        .setDescription('Tạo sự kiện mới (Chỉ dành cho Admin)')
    )
    .addSubcommand(subcmd => 
      subcmd.setName('list')
        .setDescription('Xem danh sách tất cả các sự kiện hiện có')
    )
    .addSubcommand(subcmd => 
      subcmd.setName('chitiet')
        .setDescription('Xem thông tin chi tiết của một sự kiện')
        .addStringOption(opt => opt.setName('id').setDescription('Mã ID sự kiện (VD: SK1234)').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('thamgia')
        .setDescription('Ghi danh tham gia sự kiện đang diễn ra')
        .addStringOption(opt => opt.setName('id').setDescription('Mã ID sự kiện').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('bxh')
        .setDescription('Xem bảng xếp hạng điểm của sự kiện')
        .addStringOption(opt => opt.setName('id').setDescription('Mã ID sự kiện').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('capnhatdiem')
        .setDescription('Cập nhật điểm sự kiện cho đệ tử (Chỉ dành cho Admin)')
        .addStringOption(opt => opt.setName('id').setDescription('Mã ID sự kiện').setRequired(true))
        .addUserOption(opt => opt.setName('user').setDescription('Đệ tử muốn cập nhật').setRequired(true))
        .addIntegerOption(opt => opt.setName('diem').setDescription('Số điểm muốn cộng/trừ (Số âm để trừ)').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('dong')
        .setDescription('Kết thúc sự kiện và vinh danh đệ tử (Chỉ dành cho Admin)')
        .addStringOption(opt => opt.setName('id').setDescription('Mã ID sự kiện').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('xoa')
        .setDescription('Xoá sự kiện khỏi hệ thống (Chỉ dành cho Admin)')
        .addStringOption(opt => opt.setName('id').setDescription('Mã ID sự kiện').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('update')
        .setDescription('Chỉnh sửa thông tin sự kiện đang diễn ra (Chỉ dành cho Admin)')
        .addStringOption(opt => opt.setName('id').setDescription('Mã ID sự kiện (VD: SK1234)').setRequired(true))
        .addStringOption(opt => opt.setName('tieude').setDescription('Tên sự kiện mới').setRequired(false))
        .addStringOption(opt => opt.setName('thoigian').setDescription('Thời gian diễn ra mới').setRequired(false))
        .addStringOption(opt => opt.setName('tieuchi').setDescription('Tiêu chí tính điểm & phần thưởng mới').setRequired(false))
        .addStringOption(opt => opt.setName('mota').setDescription('Mô tả chi tiết sự kiện mới').setRequired(false))
        .addStringOption(opt => opt.setName('phongcach').setDescription('Phong cách Banner AI mới').setRequired(false))
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    // Kiểm tra đăng ký người dùng (Áp dụng chung trừ lệnh tạo/xóa/đóng của admin không bắt buộc)
    if (sub === 'thamgia') {
      const user = await User.findOne({ discordId: userId });
      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ CHƯA ĐĂNG KÝ ⚠️')
          .setDescription('Gõ `/dangky` gia nhập thiên quân Đế Tông mới ghi danh tham gia sự kiện được!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed], flags: [64] });
      }
    }

    // =======================================================
    // 1. TẠO SỰ KIỆN (tao) -> HIỂN THỊ MODAL FORM
    // =======================================================
    if (sub === 'tao') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        const errEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Bạn không có đủ quyền Administrator để khởi chạy sự kiện tông môn!')
          .setColor('#FF5555');
        return interaction.reply({ embeds: [errEmbed], flags: [64] });
      }

      // Tạo Modal
      const modal = new ModalBuilder()
        .setCustomId('sukien_tao_modal')
        .setTitle('Khởi Tạo Sự Kiện Đế Tông');

      // Các trường nhập liệu
      const titleInput = new TextInputBuilder()
        .setCustomId('sukien_title_input')
        .setLabel('Tên sự kiện')
        .setPlaceholder('Ví dụ: Đại Chiến Hồn Thú Vương')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const durationInput = new TextInputBuilder()
        .setCustomId('sukien_duration_input')
        .setLabel('Thời gian diễn ra')
        .setPlaceholder('Ví dụ: Từ 06/06 đến 13/06')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const criteriaInput = new TextInputBuilder()
        .setCustomId('sukien_criteria_input')
        .setLabel('Tiêu chí tính điểm & Phần thưởng')
        .setPlaceholder('Ví dụ: Chat +1đ, Diệt Boss +10đ. Quán quân nhận 1000 Xu.')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const descInput = new TextInputBuilder()
        .setCustomId('sukien_description_input')
        .setLabel('Mô tả chi tiết sự kiện')
        .setPlaceholder('Điền mô tả bối cảnh sự kiện và hướng dẫn chơi tại đây...')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const styleInput = new TextInputBuilder()
        .setCustomId('sukien_style_input')
        .setLabel('Phong cách Banner AI (Tuỳ chọn)')
        .setPlaceholder('Ví dụ: Tiên hiệp cổ trang, Anime, Huyền ảo Đấu La...')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

      // Thêm vào hàng ActionRow
      const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
      const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(durationInput);
      const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(criteriaInput);
      const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descInput);
      const fifthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(styleInput);

      modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

      // Show Modal
      return interaction.showModal(modal);
    }

    // =======================================================
    // 2. LIỆT KÊ SỰ KIỆN (list)
    // =======================================================
    if (sub === 'list') {
      try {
        const events = await EventModel.find({}).sort({ createdAt: -1 }).limit(10);

        if (events.length === 0) {
          const noEventsEmbed = new EmbedBuilder()
            .setTitle('📋 DANH SÁCH SỰ KIỆN ĐẾ TÔNG 📋')
            .setDescription('Hiện tại chưa có sự kiện nào được tổ chức trong bản đồ Đế Tông.')
            .setColor('#6B7280');
          return interaction.reply({ embeds: [noEventsEmbed] });
        }

        const listEmbed = new EmbedBuilder()
          .setTitle('📋 HỆ THỐNG SỰ KIỆN TÔNG MÔN 📋')
          .setDescription('Tổng hợp các sự kiện đang diễn ra và đã kết thúc. Gõ `/sukien chitiet id:<Mã ID>` để xem chi tiết hoặc `/sukien thamgia id:<Mã ID>` để ghi danh.')
          .setColor('#0099FF')
          .setTimestamp();

        events.forEach(e => {
          const participantCount = e.participants.length;
          listEmbed.addFields({
            name: `${e.status === 'active' ? '🟢' : '🔴'} **${e.title}** (Mã: \`${e.eventId}\`)`,
            value: `⏱️ Thời gian: **${e.duration}**\n👥 Đệ tử tham gia: **${participantCount} người**\n⚡ Trạng thái: **${e.status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'}**`,
            inline: false
          });
        });

        return interaction.reply({ embeds: [listEmbed] });
      } catch (error) {
        console.error('[Event List] Lỗi:', error);
        return interaction.reply('Lỗi thần pháp, không thể đọc danh sách sự kiện.');
      }
    }

    // =======================================================
    // 3. CHI TIẾT SỰ KIỆN (chitiet)
    // =======================================================
    if (sub === 'chitiet') {
      const eventIdInput = interaction.options.getString('id')!.trim().toUpperCase();

      try {
        const event = await EventModel.findOne({ eventId: eventIdInput });
        if (!event) {
          const errEmbed = new EmbedBuilder()
            .setTitle('❌ KHÔNG TÌM THẤY ❌')
            .setDescription(`Không tìm thấy sự kiện nào có mã ID \`${eventIdInput}\` trên thiên thạch ghi chép.`)
            .setColor('#FF5555');
          return interaction.reply({ embeds: [errEmbed], flags: [64] });
        }

        const detailEmbed = new EmbedBuilder()
          .setTitle(`📣 SỰ KIỆN: ${event.title.toUpperCase()} 📣`)
          .setDescription(event.description)
          .setColor(event.status === 'active' ? '#10B981' : '#6B7280')
          .setImage(event.bannerUrl || null)
          .addFields(
            { name: '📅 Thời Gian Hoạt Động', value: `⏳ **${event.duration}**`, inline: true },
            { name: '🔑 Mã Sự Kiện', value: `\`${event.eventId}\``, inline: true },
            { name: '⚡ Trạng Thái', value: event.status === 'active' ? '🟢 Đang diễn ra' : '🔴 Đã kết thúc', inline: true },
            { name: '🏆 Tiêu Chí Tính Điểm & Phần Thưởng', value: event.criteria, inline: false },
            { name: '👥 Số Đệ Tử Đã Ghi Danh', value: `✨ **${event.participants.length}** đệ tử đã tham gia (Xem BXH bằng \`/sukien bxh id:${event.eventId}\`)`, inline: false },
            { name: '👤 Người Khởi Tạo', value: `Tu sĩ **${event.createdBy}**`, inline: true }
          )
          .setFooter({ text: 'Để tham gia sự kiện này, gõ /sukien thamgia' })
          .setTimestamp();

        return interaction.reply({ embeds: [detailEmbed] });
      } catch (error) {
        console.error('[Event Detail] Lỗi:', error);
        return interaction.reply('Lỗi thần pháp, không thể đọc chi tiết sự kiện.');
      }
    }

    // =======================================================
    // 4. THAM GIA SỰ KIỆN (thamgia)
    // =======================================================
    if (sub === 'thamgia') {
      const eventIdInput = interaction.options.getString('id')!.trim().toUpperCase();

      try {
        const event = await EventModel.findOne({ eventId: eventIdInput });
        if (!event) {
          return interaction.reply({ content: `❌ Không tìm thấy sự kiện với ID \`${eventIdInput}\`.`, flags: [64] });
        }

        if (event.status !== 'active') {
          return interaction.reply({ content: '⚠️ Sự kiện này đã kết thúc, bạn không thể ghi danh tham gia nữa.', flags: [64] });
        }

        // Kiểm tra xem đã tham gia chưa
        const isJoined = event.participants.some(p => p.userId === userId);
        if (isJoined) {
          const alreadyEmbed = new EmbedBuilder()
            .setTitle('🛡️ ĐÃ GHI DANH 🛡️')
            .setDescription(`Bạn đã ghi danh tham gia sự kiện **${event.title}** từ trước! Tích cực hoàn thành tiêu chí để cướp hạng trên \`/sukien bxh id:${event.eventId}\`.`)
            .setColor('#3B82F6');
          return interaction.reply({ embeds: [alreadyEmbed], flags: [64] });
        }

        const user = await User.findOne({ discordId: userId });
        const charName = user?.characterName || interaction.user.username;

        // Thêm đệ tử vào mảng
        event.participants.push({
          userId,
          username: charName,
          points: 0,
          joinedAt: new Date()
        });

        await event.save();

        const successEmbed = new EmbedBuilder()
          .setTitle('💮 GHI DANH SỰ KIỆN THÀNH CÔNG 💮')
          .setDescription(`Chúc mừng đệ tử **${charName}** đã đăng ký tham gia thành công đại sự kiện **${event.title}**!`)
          .setColor('#10B981')
          .addFields(
            { name: '🔑 Mã Sự Kiện', value: `\`${event.eventId}\``, inline: true },
            { name: '🔥 Điểm Khởi Đầu', value: `**0 Điểm**`, inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [successEmbed] });
      } catch (error) {
        console.error('[Event Join] Lỗi:', error);
        return interaction.reply('Lỗi pháp trận, đăng ký tham gia thất bại.');
      }
    }

    // =======================================================
    // 5. BẢNG XẾP HẠNG SỰ KIỆN (bxh)
    // =======================================================
    if (sub === 'bxh') {
      const eventIdInput = interaction.options.getString('id')!.trim().toUpperCase();

      try {
        const event = await EventModel.findOne({ eventId: eventIdInput });
        if (!event) {
          return interaction.reply({ content: `❌ Không tìm thấy sự kiện với ID \`${eventIdInput}\`.`, flags: [64] });
        }

        // Sắp xếp người tham gia theo điểm giảm dần
        const sorted = [...event.participants].sort((a, b) => b.points - a.points).slice(0, 15);
        let bxhText = '';

        if (sorted.length === 0) {
          bxhText = '*Chưa có đệ tử nào tham gia hoặc tích lũy điểm số!*';
        } else {
          sorted.forEach((p, idx) => {
            let medal = `[#${idx + 1}]`;
            if (idx === 0) medal = '🥇';
            if (idx === 1) medal = '🥈';
            if (idx === 2) medal = '🥉';
            bxhText += `${medal} **${p.username}** - Điểm tích luỹ: **${p.points.toLocaleString()}**\n`;
          });
        }

        const bxhEmbed = new EmbedBuilder()
          .setTitle(`🏆 BẢNG XẾP HẠNG: ${event.title.toUpperCase()} 🏆`)
          .setDescription(`Hiển thị Top 15 đệ tử có điểm cống hiến sự kiện cao nhất tông môn!`)
          .setColor('#F59E0B')
          .addFields(
            { name: '🔥 BXH Đệ Tử Tranh Tài', value: bxhText, inline: false },
            { name: '🎯 Tiêu chí tích điểm', value: event.criteria, inline: false }
          )
          .setFooter({ text: `Mã ID sự kiện: ${event.eventId}` })
          .setTimestamp();

        return interaction.reply({ embeds: [bxhEmbed] });
      } catch (error) {
        console.error('[Event Leaderboard] Lỗi:', error);
        return interaction.reply('Lỗi pháp khí, không thể truy vấn bảng xếp hạng.');
      }
    }

    // =======================================================
    // 6. CẬP NHẬT ĐIỂM SỰ KIỆN (capnhatdiem) - ADMIN ONLY
    // =======================================================
    if (sub === 'capnhatdiem') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '⚠️ Bạn không có quyền Administrator để cập nhật điểm sự kiện!', flags: [64] });
      }

      const eventIdInput = interaction.options.getString('id')!.trim().toUpperCase();
      const targetUser = interaction.options.getUser('user')!;
      const pointsToChange = interaction.options.getInteger('diem')!;

      try {
        const event = await EventModel.findOne({ eventId: eventIdInput });
        if (!event) {
          return interaction.reply({ content: `❌ Không tìm thấy sự kiện với ID \`${eventIdInput}\`.`, flags: [64] });
        }

        if (event.status !== 'active') {
          return interaction.reply({ content: '⚠️ Sự kiện này đã kết thúc, không thể thay đổi điểm số.', flags: [64] });
        }

        // Tìm đệ tử trong danh sách tham gia
        const participant = event.participants.find(p => p.userId === targetUser.id);
        if (!participant) {
          return interaction.reply({ content: `⚠️ Đệ tử **${targetUser.username}** chưa đăng ký tham gia sự kiện này! Hãy yêu cầu đệ tử gõ \`/sukien thamgia id:${event.eventId}\` trước.`, flags: [64] });
        }

        // Thay đổi điểm
        participant.points += pointsToChange;
        // Điểm số tối thiểu là 0
        if (participant.points < 0) participant.points = 0;

        await event.save();

        const updateEmbed = new EmbedBuilder()
          .setTitle('⚙️ CẬP NHẬT ĐIỂM SỰ KIỆN ⚙️')
          .setDescription(`Pháp thuật chấp sự vừa thay đổi điểm cống hiến của một đệ tử!`)
          .setColor('#10B981')
          .addFields(
            { name: '👤 Đệ Tử', value: `<@${targetUser.id}> (${participant.username})`, inline: true },
            { name: '⚡ Biến động', value: `${pointsToChange >= 0 ? '+' : ''}${pointsToChange} Điểm`, inline: true },
            { name: '🏆 Điểm Mới', value: `**${participant.points} Điểm**`, inline: true }
          )
          .setFooter({ text: `Sự kiện: ${event.title} [ID: ${event.eventId}]` })
          .setTimestamp();

        return interaction.reply({ embeds: [updateEmbed] });
      } catch (error) {
        console.error('[Event Update Points] Lỗi:', error);
        return interaction.reply('Lỗi kết nối DB, không thể cập nhật điểm.');
      }
    }

    // =======================================================
    // 7. ĐÓNG SỰ KIỆN (dong) - ADMIN ONLY
    // =======================================================
    if (sub === 'dong') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '⚠️ Bạn không có quyền Administrator để kết thúc sự kiện!', flags: [64] });
      }

      const eventIdInput = interaction.options.getString('id')!.trim().toUpperCase();

      try {
        const event = await EventModel.findOne({ eventId: eventIdInput });
        if (!event) {
          return interaction.reply({ content: `❌ Không tìm thấy sự kiện với ID \`${eventIdInput}\`.`, flags: [64] });
        }

        if (event.status === 'completed') {
          return interaction.reply({ content: '⚠️ Sự kiện này đã được kết thúc từ trước.', flags: [64] });
        }

        // Kết thúc sự kiện
        event.status = 'completed';
        await event.save();

        // Tìm 3 đệ tử đứng đầu
        const topParticipants = [...event.participants].sort((a, b) => b.points - a.points).slice(0, 3);
        let podiumText = '';

        if (topParticipants.length === 0) {
          podiumText = '*Không có đệ tử nào đạt điểm cống hiến trong sự kiện này!*';
        } else {
          topParticipants.forEach((p, idx) => {
            const trophies = ['🥇 Quán Quân', '🥈 Á Quân', '🥉 Quý Quân'];
            podiumText += `${trophies[idx]}: **${p.username}** với **${p.points} Điểm** \n`;
          });
        }

        const closeEmbed = new EmbedBuilder()
          .setTitle(`💮 SỰ KIỆN KẾT THÚC: ${event.title.toUpperCase()} 💮`)
          .setDescription(`Đại sự kiện tông môn **${event.title}** đã kết thúc hoàn mỹ! Bản ghi chép điểm số của các đệ tử đã được đúc kết.`)
          .setColor('#DC2626')
          .setImage(event.bannerUrl || null)
          .addFields(
            { name: '🔑 Mã Sự Kiện', value: `\`${event.eventId}\``, inline: true },
            { name: '👥 Tổng Số Người Tranh Tài', value: `**${event.participants.length}** đệ tử`, inline: true },
            { name: '🎖️ Vinh Danh Top 3 Đệ Tử Xuất Sắc Nhất', value: podiumText, inline: false }
          )
          .setTimestamp();

        // Gửi thông báo kết thúc lên kênh sự kiện
        const configChannelId = process.env.DISCORD_EVENT_CHANNEL_ID;
        let eventChannel = configChannelId ? interaction.guild?.channels.cache.get(configChannelId) : null;

        if (!eventChannel) {
          eventChannel = interaction.guild?.channels.cache.find(c => 
            c.isTextBased() && (
              c.name.toLowerCase().includes('sự-kiện') || 
              c.name.toLowerCase().includes('sukien') || 
              c.name.toLowerCase().includes('event')
            )
          );
        }

        if (eventChannel && eventChannel.isTextBased()) {
          await (eventChannel as any).send({ content: '🏆 **KẾT QUẢ ĐẠI SỰ KIỆN** 🏆', embeds: [closeEmbed] });
          return interaction.reply({ content: `✅ Đã kết thúc sự kiện thành công và công bố kết quả tại kênh <#${eventChannel.id}>!` });
        }

        return interaction.reply({ embeds: [closeEmbed] });
      } catch (error) {
        console.error('[Event Close] Lỗi:', error);
        return interaction.reply('Lỗi hệ thống, kết thúc sự kiện thất bại.');
      }
    }

    // =======================================================
    // 8. XOÁ SỰ KIỆN (xoa) - ADMIN ONLY
    // =======================================================
    if (sub === 'xoa') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: '⚠️ Bạn không có quyền Administrator để xoá sự kiện!', flags: [64] });
      }

      const eventIdInput = interaction.options.getString('id')!.trim().toUpperCase();

      try {
        const deleted = await EventModel.findOneAndDelete({ eventId: eventIdInput });
        if (!deleted) {
          return interaction.reply({ content: `❌ Không tìm thấy sự kiện nào với mã ID \`${eventIdInput}\` để xoá.`, flags: [64] });
        }

        return interaction.reply({ content: `✅ Đã xoá thành công sự kiện **${deleted.title}** (Mã ID: \`${deleted.eventId}\`) khỏi thiên điển của tông môn.` });
      } catch (error) {
        console.error('[Event Delete] Lỗi:', error);
        return interaction.reply('Lỗi DB, xoá sự kiện thất bại.');
      }
    }

    // =======================================================
    // 9. CẬP NHẬT THÔNG TIN SỰ KIỆN (update) - ADMIN ONLY
    // =======================================================
    if (sub === 'update') {
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        const errEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Bạn không có đủ quyền Administrator để chỉnh sửa sự kiện!')
          .setColor('#FF5555');
        return interaction.reply({ embeds: [errEmbed], flags: [64] });
      }

      const eventIdInput = interaction.options.getString('id')!.trim().toUpperCase();
      const newTitle = interaction.options.getString('tieude')?.trim();
      const newDuration = interaction.options.getString('thoigian')?.trim();
      const newCriteria = interaction.options.getString('tieuchi')?.trim();
      const newDescription = interaction.options.getString('mota')?.trim();
      const newStyle = interaction.options.getString('phongcach')?.trim();

      // Kiểm tra xem có nhập ít nhất một trường không
      if (!newTitle && !newDuration && !newCriteria && !newDescription && !newStyle) {
        const warnEmbed = new EmbedBuilder()
          .setTitle('⚠️ THÔNG BÁO ⚠️')
          .setDescription('Vui lòng nhập ít nhất một trường cần chỉnh sửa (tên, thời gian, tiêu chí, mô tả hoặc phong cách).')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [warnEmbed], flags: [64] });
      }

      // Defer reply ngay lập tức để tránh timeout vì vẽ AI có thể mất vài giây
      await interaction.deferReply({ flags: [64] });

      try {
        const event = await EventModel.findOne({ eventId: eventIdInput });
        if (!event) {
          const errEmbed = new EmbedBuilder()
            .setTitle('❌ KHÔNG TÌM THẤY ❌')
            .setDescription(`Không tìm thấy sự kiện nào có mã ID \`${eventIdInput}\`.`)
            .setColor('#FF5555');
          return interaction.editReply({ embeds: [errEmbed] });
        }

        if (event.status !== 'active') {
          const errEmbed = new EmbedBuilder()
            .setTitle('⚠️ SỰ KIỆN ĐÃ ĐÓNG ⚠️')
            .setDescription('Sự kiện này đã kết thúc, không thể chỉnh sửa thông tin nữa.')
            .setColor('#FFCC00');
          return interaction.editReply({ embeds: [errEmbed] });
        }

        // Kiểm tra xem dữ liệu mới có thực sự thay đổi so với dữ liệu cũ không
        let hasChanges = false;
        if (newTitle && newTitle !== event.title) hasChanges = true;
        if (newDuration && newDuration !== event.duration) hasChanges = true;
        if (newCriteria && newCriteria !== event.criteria) hasChanges = true;
        if (newDescription && newDescription !== event.description) hasChanges = true;
        if (newStyle) hasChanges = true; // Phong cách vẽ banner mới luôn được tính là thay đổi

        if (!hasChanges) {
          const warnEmbed = new EmbedBuilder()
            .setTitle('⚠️ KHÔNG CÓ THAY ĐỔI ⚠️')
            .setDescription('Các giá trị nhập vào trùng khớp với thông tin hiện tại của sự kiện.')
            .setColor('#FFCC00');
          return interaction.editReply({ embeds: [warnEmbed] });
        }

        // Cập nhật các trường
        const updates: any = {};
        if (newTitle) updates.title = newTitle;
        if (newDuration) updates.duration = newDuration;
        if (newCriteria) updates.criteria = newCriteria;
        if (newDescription) updates.description = newDescription;

        // Tạo banner mới nếu có chỉnh sửa tiêu đề hoặc phong cách
        if (newTitle || newStyle) {
          const titleForBanner = newTitle || event.title;
          const styleForBanner = newStyle || 'Huyền ảo đấu la';
          const cleanStyle = styleForBanner ? `, style ${styleForBanner}` : '';
          const promptText = `masterpiece official art, epic glowing fantasy scene for event "${titleForBanner}"${cleanStyle}, stunning visual, magical light effects, concept art, highly detailed, horizontal landscape layout, wide aspect ratio banner, cinematic lighting --no text, no watermark`;
          const encodedPrompt = encodeURIComponent(promptText);
          updates.bannerUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=1200&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
        }

        // Áp dụng thay đổi vào document
        Object.assign(event, updates);

        // Lưu vào DB trước
        await event.save();

        let messageUpdateSuccess = true;
        let updateErrorMsg = '';

        // Cập nhật tin nhắn thông báo trong kênh sự kiện
        if (event.announcementChannelId && event.announcementMessageId) {
          try {
            const channel = await interaction.guild?.channels.fetch(event.announcementChannelId);
            if (channel && channel.isTextBased()) {
              const message = await (channel as any).messages.fetch(event.announcementMessageId);
              if (message) {
                const updatedEmbed = new EmbedBuilder()
                  .setTitle(`📣 SỰ KIỆN TÔNG MÔN KHAI MỞ: ${event.title.toUpperCase()} 📣`)
                  .setDescription(`Hỡi chư vị đệ tử Đế Tông! Ban Quản Trị tông môn xin thông cáo khai mở đại sự kiện mới!\n\n${event.description}`)
                  .setColor('#FF9900')
                  .setImage(event.bannerUrl || null)
                  .addFields(
                    { name: '📅 Thời Gian Hoạt Động', value: `⏳ **${event.duration}**`, inline: true },
                    { name: '🔑 Mã Sự Kiện', value: `\`${event.eventId}\``, inline: true },
                    { name: '🏆 Tiêu Chi Tính Điểm & Phần Thưởng', value: event.criteria, inline: false },
                    { name: '📖 HƯỚNG DẪN THAM GIA & CÁC LỆNH SỰ KIỆN', value: `1️⃣ Ghi danh tông môn (nếu chưa): \`/dangky\`\n2️⃣ Đăng ký tham gia sự kiện: \`/sukien thamgia id:${event.eventId}\`\n3️⃣ Xem thông tin chi tiết & Banner: \`/sukien chitiet id:${event.eventId}\`\n4️⃣ Xem bảng xếp hạng cống hiến: \`/sukien bxh id:${event.eventId}\``, inline: false }
                  )
                  .setFooter({ text: `Người khởi tạo: ${event.createdBy} • Hãy nhanh chóng ghi danh tham gia sự kiện!` })
                  .setTimestamp();

                const registerBtn = new ButtonBuilder()
                  .setCustomId(`event_register:${event.eventId}`)
                  .setLabel('Ghi Danh Tham Gia ⚔️')
                  .setStyle(ButtonStyle.Success);

                const registerRow = new ActionRowBuilder<ButtonBuilder>().addComponents(registerBtn);

                await message.edit({ embeds: [updatedEmbed], components: [registerRow] });
              }
            }
          } catch (error: any) {
            console.error('[Event Update Message] Lỗi sửa tin nhắn thông báo:', error);
            messageUpdateSuccess = false;
            updateErrorMsg = error.message || 'Không rõ nguyên nhân';
          }
        }

        const successEmbed = new EmbedBuilder()
          .setTitle('💮 CẬP NHẬT SỰ KIỆN THÀNH CÔNG 💮')
          .setDescription(`Sự kiện **${event.title}** (Mã ID: \`${event.eventId}\`) đã được chỉnh sửa thông tin thành công trên Thiên Điển!`)
          .setColor('#10B981')
          .setImage(event.bannerUrl || null)
          .addFields(
            { name: '📅 Thời Gian Hoạt Động', value: `⏳ **${event.duration}**`, inline: true },
            { name: '🔑 Mã Sự Kiện', value: `\`${event.eventId}\``, inline: true }
          )
          .setTimestamp();

        if (!messageUpdateSuccess) {
          successEmbed.addFields({
            name: '⚠️ LƯU Ý HỆ THỐNG',
            value: `Thông tin trong Thiên Điển đã cập nhật thành công, nhưng không thể sửa tin nhắn thông báo gốc trên Discord (Lỗi: \`${updateErrorMsg}\`). Hãy kiểm tra lại kênh hoặc quyền hạn của bot.`
          });
        }

        return interaction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        console.error('[Event Update Subcommand] Lỗi:', error);
        const errEmbed = new EmbedBuilder()
          .setTitle('❌ LỖI HỆ THỐNG ❌')
          .setDescription('Không thể thực hiện chỉnh sửa sự kiện do lỗi thiên pháp bảo điển.')
          .setColor('#FF0000');
        return interaction.editReply({ embeds: [errEmbed] });
      }
    }
  }
};
