import { Interaction, EmbedBuilder, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import User from '../models/User.js';
import EventModel from '../models/Event.js';
import { getRankName, updateGuildMemberRole } from '../utils/levelUtils.js';
import { checkUserSpamLimit } from '../utils/redisUtils.js';

export default {
  name: 'interactionCreate',
  async execute(interaction: Interaction, client: any) {
    // =======================================================
    // 1. XỬ LÝ SLASH COMMAND
    // =======================================================
    if (interaction.isChatInputCommand()) {
      // 1.0 Chống spam lệnh toàn cục (Anti-Spam Macro Protection)
      const spamStatus = await checkUserSpamLimit(interaction.user.id);
      if (spamStatus.isSpamming) {
        const spamEmbed = new EmbedBuilder()
          .setTitle('⚠️ CẢNH BÁO TÔNG MÔN ⚠️')
          .setDescription(`Bạn đang thi triển các mệnh lệnh quá dồn dập trong thời gian ngắn! \n\nVui lòng tĩnh tâm tọa thiền nghỉ ngơi trong **${spamStatus.timeLeft}** giây để hồi phục kinh mạch.`)
          .setColor('#FF9900')
          .setFooter({ text: 'Pháp trận chống macro tự động của Đế Tông' });
        return interaction.reply({ embeds: [spamEmbed], flags: [64] });
      }

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // 1.1 Kiểm tra Cooldown lệnh toàn diện
      const { cooldowns } = client;
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const defaultCooldownDuration = 3; // Cooldown mặc định 3 giây chống spam sập API
      const cooldownAmount = (command.cooldown || defaultCooldownDuration) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          
          const cooldownEmbed = new EmbedBuilder()
            .setTitle('⏳ COOLDOWN TRẬN PHÁP ⏳')
            .setDescription(`Vui lòng chờ **${timeLeft.toFixed(1)}** giây nữa để tiếp tục vận hành lệnh này. Vận công quá nhanh có thể tẩu hỏa nhập ma!`)
            .setColor('#FF5555')
            .setFooter({ text: 'Hệ thống bảo hộ Linh Lực' });

          return interaction.reply({ embeds: [cooldownEmbed], flags: [64] }); // Ephemeral
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        console.log(`[Interaction] Bắt đầu thực thi lệnh /${interaction.commandName} cho user: ${interaction.user.tag} (${interaction.user.id})`);
        await command.execute(interaction);
        console.log(`[Interaction] Hoàn thành thực thi lệnh /${interaction.commandName} cho user: ${interaction.user.tag}`);
      } catch (error) {
        console.error(`[Lỗi Lệnh] Có vấn đề đột ngột khi chạy lệnh /${interaction.commandName}:`, error);
        
        const errEmbed = new EmbedBuilder()
          .setTitle('❌ THIÊN PHÁP TRỤC TRẶC ❌')
          .setDescription('Đã xảy ra lỗi tâm linh bất ngờ trong hệ thống khi thực thi mệnh lệnh này. Tông môn đang cử trưởng lão phục hồi!')
          .setColor('#FF0000');

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ embeds: [errEmbed], flags: [64] });
        } else {
          await interaction.reply({ embeds: [errEmbed], flags: [64] });
        }
      }
    }

    // =======================================================
    // 2. XỬ LÝ SUBMIT MODAL (ĐĂNG KÝ HỒ SƠ MODAL FORM)
    // =======================================================
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'dangky_modal') {
        try {
          const characterName = interaction.fields.getTextInputValue('dangky_char_name_input').trim();
          const serverName = interaction.fields.getTextInputValue('dangky_server_name_input').trim();
          const combatPowerStr = interaction.fields.getTextInputValue('dangky_combat_power_input').trim();

          const combatPower = parseInt(combatPowerStr, 10);
          if (isNaN(combatPower) || combatPower < 0) {
            const errEmbed = new EmbedBuilder()
              .setTitle('❌ THẤT BẠI ĐĂNG KÝ ❌')
              .setDescription('Lực chiến tu vi bắt buộc phải là một con số nguyên dương hợp lệ! Vui lòng thực hiện đăng ký lại.')
              .setColor('#FF5555');
            return interaction.reply({ embeds: [errEmbed] });
          }

          // Lưu hoặc cập nhật thông tin User trong DB
          let user = await User.findOne({ discordId: interaction.user.id });
          if (!user) {
            user = new User({
              discordId: interaction.user.id,
              username: interaction.user.username,
              level: 1,
              exp: 0,
              balance: 100 // Tặng 100 xu khởi đầu hành trình Đấu La
            });
          }

          user.characterName = characterName;
          user.serverName = serverName;
          user.combatPower = combatPower;
          user.registered = true;
          user.title = getRankName(user.level);

          await user.save();

          // Thiết lập Auto-Role nếu đang thuộc server Discord
          if (interaction.guild && interaction.member) {
            // Ép kiểu vì interaction.member có thể là APIInteractionGuildMember
            await updateGuildMemberRole(interaction.member as any, user.level);
          }

          const successEmbed = new EmbedBuilder()
            .setTitle('💮 ĐẾ TÔNG - GHI DANH SÁCH PHONG 💮')
            .setDescription(`Chào mừng tân đệ tử đã gia nhập **Đế Tông môn hạ**! Danh xưng và cấp bậc của bạn đã được ghi vào Thiên Bảng.`)
            .setColor('#FFD700')
            .setThumbnail(interaction.user.displayAvatarURL({ forceStatic: false }))
            .addFields(
              { name: 'Khí Phách Danh Xưng', value: `👤 ${characterName}`, inline: true },
              { name: 'Bản Đạo Server', value: `🌐 ${serverName}`, inline: true },
              { name: 'Khai Thiên Lực Chiến', value: `💥 ${combatPower.toLocaleString()} Linh lực`, inline: true },
              { name: 'Chức vị nhập môn', value: `🌾 ${user.title}`, inline: true },
              { name: 'Tông môn Đãi ngộ', value: `🪙 +100 Xu Đế Tông khởi hành`, inline: true }
            )
            .setFooter({ text: 'Trúc cơ thành công! Mau đi rèn luyên level để thăng quan tiến chức.' })
            .setTimestamp();

          await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
          console.error('[Modal Submit] Lỗi đăng ký:', error);
          await interaction.reply({ content: 'Đăng ký thất bại, có lỗi xuất hiện khi lưu thiên thư.' });
        }
      }

      if (interaction.customId === 'suahoso_modal') {
        try {
          const characterName = interaction.fields.getTextInputValue('suahoso_char_name_input').trim();
          const serverName = interaction.fields.getTextInputValue('suahoso_server_name_input').trim();
          const combatPowerStr = interaction.fields.getTextInputValue('suahoso_combat_power_input').trim();

          const combatPower = parseInt(combatPowerStr, 10);
          if (isNaN(combatPower) || combatPower < 0) {
            const errEmbed = new EmbedBuilder()
              .setTitle('❌ THẤT BẠI CẬP NHẬT ❌')
              .setDescription('Lực chiến tu vi bắt buộc phải là một con số nguyên dương hợp lệ! Vui lòng sửa lại.')
              .setColor('#FF5555');
            return interaction.reply({ embeds: [errEmbed] });
          }

          // Cập nhật thông tin trong DB
          const user = await User.findOne({ discordId: interaction.user.id });
          if (!user) {
            return interaction.reply('Tông môn không tìm thấy hồ sơ của bạn.');
          }

          user.characterName = characterName;
          user.serverName = serverName;
          user.combatPower = combatPower;
          await user.save();

          // Đồng bộ lại biệt danh và vai trò
          if (interaction.guild && interaction.member) {
            await updateGuildMemberRole(interaction.member as any, user.level);
          }

          const successEmbed = new EmbedBuilder()
            .setTitle('💮 CẬP NHẬT HỒ SƠ THÀNH CÔNG 💮')
            .setDescription(`Hồ sơ tiên nhân của bạn đã được cập nhật thành công trên Thiên Bảng.`)
            .setColor('#10B981')
            .setThumbnail(interaction.user.displayAvatarURL({ forceStatic: false }))
            .addFields(
              { name: 'Khí Phách Danh Xưng', value: `👤 ${characterName}`, inline: true },
              { name: 'Bản Đạo Server', value: `🌐 ${serverName}`, inline: true },
              { name: 'Lực Chiến Mới', value: `💥 ${combatPower.toLocaleString()} Linh lực`, inline: true }
            )
            .setFooter({ text: 'Dữ liệu đã được đồng bộ chuẩn chỉnh!' })
            .setTimestamp();

          await interaction.reply({ embeds: [successEmbed] });
        } catch (error) {
          console.error('[Modal Submit] Lỗi sửa hồ sơ:', error);
          await interaction.reply({ content: 'Không thể cập nhật thông tin do lỗi bảo điển.' });
        }
      }

      if (interaction.customId === 'sukien_tao_modal') {
        try {
          const title = interaction.fields.getTextInputValue('sukien_title_input').trim();
          const duration = interaction.fields.getTextInputValue('sukien_duration_input').trim();
          const criteria = interaction.fields.getTextInputValue('sukien_criteria_input').trim();
          const description = interaction.fields.getTextInputValue('sukien_description_input').trim();
          const style = interaction.fields.getTextInputValue('sukien_style_input').trim() || 'Huyền ảo đấu la';

          // Tạo mã ID sự kiện ngẫu nhiên dạng SKXXXX
          const eventId = 'SK' + Math.floor(1000 + Math.random() * 9000);

           // Tạo Prompt vẽ banner cho Pollinations AI (Tối ưu hóa cực kỳ đẳng cấp, loại bỏ chữ méo)
          const cleanStyle = style ? `, style ${style}` : '';
          const promptText = `masterpiece official art, epic glowing fantasy scene for event "${title}"${cleanStyle}, stunning visual, magical light effects, concept art, highly detailed, horizontal landscape layout, wide aspect ratio banner, cinematic lighting --no text, no watermark`;
          const encodedPrompt = encodeURIComponent(promptText);
          const bannerUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=1200&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

          // Lưu sự kiện vào MongoDB
          const newEvent = new EventModel({
            eventId,
            title,
            description,
            duration,
            criteria,
            bannerUrl,
            status: 'active',
            participants: [],
            createdBy: interaction.user.username
          });

          await newEvent.save();

          // Tạo Embed thông báo
          const eventEmbed = new EmbedBuilder()
            .setTitle(`📣 SỰ KIỆN TÔNG MÔN KHAI MỞ: ${title.toUpperCase()} 📣`)
            .setDescription(`Hỡi chư vị đệ tử Đế Tông! Ban Quản Trị tông môn xin thông cáo khai mở đại sự kiện mới!\n\n${description}`)
            .setColor('#FF9900')
            .setImage(bannerUrl)
            .addFields(
              { name: '📅 Thời Gian Hoạt Động', value: `⏳ **${duration}**`, inline: true },
              { name: '🔑 Mã Sự Kiện', value: `\`${eventId}\``, inline: true },
              { name: '🏆 Tiêu Chi Tính Điểm & Phần Thưởng', value: criteria, inline: false },
              { name: '📖 HƯỚNG DẪN THAM GIA & CÁC LỆNH SỰ KIỆN', value: `1️⃣ Ghi danh tông môn (nếu chưa): \`/dangky\`\n2️⃣ Đăng ký tham gia sự kiện: \`/sukien thamgia id:${eventId}\`\n3️⃣ Xem thông tin chi tiết & Banner: \`/sukien chitiet id:${eventId}\`\n4️⃣ Xem bảng xếp hạng cống hiến: \`/sukien bxh id:${eventId}\``, inline: false }
            )
            .setFooter({ text: `Người khởi tạo: ${interaction.user.username} • Hãy nhanh chóng ghi danh tham gia sự kiện!` })
            .setTimestamp();

          // Tìm kênh thông báo sự kiện bằng ID cấu hình hoặc bằng tên (chứa từ khóa sự-kiện, sukien, event)
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

          // Tạo Nút ghi danh trực tiếp cực kỳ tiện lợi và đẳng cấp
          const registerBtn = new ButtonBuilder()
            .setCustomId(`event_register:${eventId}`)
            .setLabel('Ghi Danh Tham Gia ⚔️')
            .setStyle(ButtonStyle.Success);

          const registerRow = new ActionRowBuilder<ButtonBuilder>().addComponents(registerBtn);

          if (eventChannel && eventChannel.isTextBased()) {
            // Gửi vào kênh sự kiện và ping @everyone kèm nút click trực tiếp
            const annMsg = await (eventChannel as any).send({ content: '📢 @everyone', embeds: [eventEmbed], components: [registerRow] });
 
            newEvent.announcementChannelId = eventChannel.id;
            newEvent.announcementMessageId = annMsg.id;
            await newEvent.save();

            const successEmbed = new EmbedBuilder()
              .setTitle('💮 SỰ KIỆN ĐÃ ĐƯỢC PHÁT HÀNH 💮')
              .setDescription(`Đại sự kiện **${title}** (Mã ID: \`${eventId}\`) đã được khởi tạo thành công và thông báo tới toàn server tại kênh <#${eventChannel.id}>!`)
              .setColor('#10B981')
              .setImage(bannerUrl);
 
            await interaction.reply({ embeds: [successEmbed] });
          } else {
            // Gửi ở kênh hiện tại và cảnh báo thiếu kênh sự kiện kèm nút click
            const warningEmbed = new EmbedBuilder()
              .setTitle('💮 SỰ KIỆN ĐÃ ĐƯỢC PHÁT HÀNH 💮')
              .setDescription(`⚠️ Tông môn chưa tìm thấy kênh \`#sự-kiện\`. Sự kiện **${title}** (Mã ID: \`${eventId}\`) đã được phát hành tại đây và thông báo @everyone! Hãy tạo kênh \`#sự-kiện\` để các sự kiện sau được quy củ hơn.`)
              .setColor('#FF9900')
              .setImage(bannerUrl);
 
            const annMsg = await interaction.reply({ content: '@everyone', embeds: [warningEmbed], components: [registerRow], fetchReply: true });

            newEvent.announcementChannelId = interaction.channelId;
            newEvent.announcementMessageId = annMsg.id;
            await newEvent.save();
          }
        } catch (error) {
          console.error('[Modal Submit] Lỗi tạo sự kiện:', error);
          await interaction.reply({ content: 'Không thể khởi tạo sự kiện do lỗi thiên điển.', flags: [64] });
        }
      }
    }

    // =======================================================
    // 3. XỬ LÝ BUTTON INTERACTION (Hệ thống Shop và BXH Phân Trang)
    // =======================================================
    if (interaction.isButton()) {
      const customId = interaction.customId;
      
      // Xử lý nút Click Ghi Danh Sự Kiện trực tiếp
      if (customId.startsWith('event_register:')) {
        const eventId = customId.split(':')[1];
        try {
          // 1. Kiểm tra đăng ký tài khoản đệ tử
          const user = await User.findOne({ discordId: interaction.user.id });
          if (!user || !user.registered) {
            const notRegisteredEmbed = new EmbedBuilder()
              .setTitle('⚠️ CHƯA GHI DANH TÔNG MÔN ⚠️')
              .setDescription('Gõ `/dangky` gia nhập thiên quân Đế Tông mới ghi danh tham gia sự kiện được!')
              .setColor('#FFCC00');
            return interaction.reply({ embeds: [notRegisteredEmbed], flags: [64] });
          }

          // 2. Tìm sự kiện
          const event = await EventModel.findOne({ eventId });
          if (!event) {
            return interaction.reply({ content: `❌ Không tìm thấy sự kiện với ID \`${eventId}\`.`, flags: [64] });
          }

          if (event.status !== 'active') {
            return interaction.reply({ content: '⚠️ Sự kiện này đã kết thúc, không thể ghi danh tham gia nữa.', flags: [64] });
          }

          // 3. Kiểm tra xem đã ghi danh chưa
          const isJoined = event.participants.some(p => p.userId === interaction.user.id);
          if (isJoined) {
            const alreadyEmbed = new EmbedBuilder()
              .setTitle('🛡️ ĐẦY ĐỦ THỦ TỤC 🛡️')
              .setDescription(`Bạn đã ghi danh tham gia sự kiện **${event.title}** từ trước! Tích cực hoàn thành tiêu chí để cướp hạng trên \`/sukien bxh id:${event.eventId}\`.`)
              .setColor('#3B82F6');
            return interaction.reply({ embeds: [alreadyEmbed], flags: [64] });
          }

          // 4. Thêm đệ tử vào mảng và lưu
          event.participants.push({
            userId: interaction.user.id,
            username: user.characterName || interaction.user.username,
            points: 0,
            joinedAt: new Date()
          });

          await event.save();

          const successEmbed = new EmbedBuilder()
            .setTitle('💮 GHI DANH SỰ KIỆN THÀNH CÔNG 💮')
            .setDescription(`Chúc mừng đệ tử **${user.characterName || interaction.user.username}** đã đăng ký tham gia thành công đại sự kiện **${event.title}**!`)
            .setColor('#10B981')
            .addFields(
              { name: '🔑 Mã Sự Kiện', value: `\`${event.eventId}\``, inline: true },
              { name: '🔥 Điểm Khởi Đầu', value: `**0 Điểm**`, inline: true }
            )
            .setTimestamp();

          return interaction.reply({ embeds: [successEmbed], flags: [64] }); // Gửi ẩn tránh làm phiền kênh chung
        } catch (error) {
          console.error('[Event Button Join] Lỗi:', error);
          return interaction.reply({ content: 'Lỗi pháp trận, đăng ký tham gia thất bại.', flags: [64] });
        }
      }
      
      // Chúng ta sẽ hỗ trợ định dạng customId: "action:tab:page:extra" để quản lý phân trang stateless cực xịn
      if (customId.startsWith('shop:') || customId.startsWith('leaderboard:')) {
        // Các lệnh shop và leaderboard sẽ tự bắt lại sự kiện click qua button của chúng.
        // Ở đây chúng ta chỉ cần chuyển tiếp hoặc để lệnh xử lý (defer update sẽ do file lệnh đảm nhiệm).
        return; 
      }
    }
  }
};
