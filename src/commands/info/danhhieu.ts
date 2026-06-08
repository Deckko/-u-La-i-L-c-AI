import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';
import User from '../../models/User.js';
import { getRankName, updateGuildMemberRole } from '../../utils/levelUtils.js';

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('danhhieu')
    .setDescription('Quản lý, xem và trang bị các danh hiệu tu tiên bạn đang sở hữu'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ CHƯA GHI DANH ⚠️')
          .setDescription('Gõ `/dangky` gia nhập thiên quân Đế Tông mới có thể bách bảo quản lý danh hiệu!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed], flags: [64] });
      }

      // Xác định danh hiệu cấp bậc mặc định của user
      const defaultRankTitle = getRankName(user.level);
      const activeTitle = user.title || defaultRankTitle;

      // Hàm render giao diện quản lý danh hiệu
      function generateTitleEmbedAndComponents(active: string, titlesOwned: string[], levelRank: string) {
        const embed = new EmbedBuilder()
          .setTitle('🏵️ ĐẾ TÔNG - THIÊN ẤN DANH HIỆU 🏵️')
          .setDescription(`Đạo hữu: **${user.characterName || interaction.user.username}**\n\n- Danh hiệu đang trang bị: **${active}**\n- Cảnh giới tu vi cấp bậc: **${levelRank}**`)
          .setColor('#8B008B')
          .setThumbnail(interaction.user.displayAvatarURL())
          .setTimestamp();

        // Danh sách danh hiệu sở hữu
        const customTitlesText = titlesOwned.length > 0 
          ? titlesOwned.map((t, idx) => `${idx + 1}. **${t}**`).join('\n')
          : '*Chưa sở hữu danh hiệu đặc biệt nào (Mua ở `/shop` hoặc mở `/quay` gacha để nhận)*';

        embed.addFields(
          { name: '🌾 Danh Hiệu Mặc Định Theo Cấp', value: `↳ **${levelRank}**`, inline: false },
          { name: '✨ Các Danh Hiệu Đặc Biệt Đã Unlocked', value: customTitlesText, inline: false }
        );

        // Tạo Select Menu chọn danh hiệu
        const options = [
          {
            label: `Danh hiệu cấp: ${levelRank.replace(/[^\w\s\u00C0-\u1EF9]/g, '').trim()}`.substring(0, 100),
            description: 'Trang bị danh hiệu mặc định theo cấp độ hiện tại của bạn',
            value: 'default_rank',
            default: active === levelRank || active === 'Tân Nhân'
          }
        ];

        // Thêm các danh hiệu đặc biệt đã unlocked
        titlesOwned.forEach((t) => {
          const cleanLabel = t.replace(/[^\w\s\u00C0-\u1EF9]/g, '').trim();
          options.push({
            label: cleanLabel.substring(0, 100),
            description: `Trang bị danh hiệu đặc biệt: ${cleanLabel}`.substring(0, 100),
            value: t,
            default: active === t
          });
        });

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('danhhieu_select')
          .setPlaceholder('Chọn danh hiệu muốn trang bị...')
          .addOptions(options);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

        // Tạo Nút bấm phụ trợ
        const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId('danhhieu_revert')
            .setLabel('Trang Bị Mặc Định 🌾')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(active === levelRank),
          new ButtonBuilder()
            .setCustomId('danhhieu_refresh')
            .setLabel('Làm Mới 🔄')
            .setStyle(ButtonStyle.Primary)
        );

        return { embeds: [embed], components: [row, btnRow] };
      }

      // Gửi phản hồi ban đầu
      const initialPayload = generateTitleEmbedAndComponents(activeTitle, user.titlesOwned || [], defaultRankTitle);
      const message = await interaction.reply({ ...initialPayload, fetchReply: true });

      // Khởi tạo collector
      const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === userId,
        time: 60 * 1000 // Hạn 1 phút
      });

      collector.on('collect', async (i) => {
        // Xử lý Select Menu
        if (i.isStringSelectMenu() && i.customId === 'danhhieu_select') {
          const selectedValue = i.values[0];

          // Tìm lại thông tin user mới nhất
          const currentUser = await User.findOne({ discordId: userId });
          if (!currentUser) return;

          let targetTitle = selectedValue;
          if (selectedValue === 'default_rank') {
            targetTitle = getRankName(currentUser.level);
          }

          // Cập nhật title trong DB
          currentUser.title = targetTitle;
          await currentUser.save();

          // Đồng bộ biệt danh và vai trò Discord ngay lập tức
          if (interaction.guild && interaction.member) {
            await updateGuildMemberRole(interaction.member as any, currentUser.level);
          }

          // Cập nhật giao diện mới
          const updatedPayload = generateTitleEmbedAndComponents(targetTitle, currentUser.titlesOwned || [], getRankName(currentUser.level));
          
          const successEmbed = new EmbedBuilder()
            .setTitle('✨ THAY ĐỔI DANH HIỆU THÀNH CÔNG ✨')
            .setDescription(`Đã trang bị danh hiệu mới: **${targetTitle}**! Biệt danh và vai trò của bạn đã được cập nhật trực tuyến trên Discord.`)
            .setColor('#10B981');

          await i.update({
            embeds: [updatedPayload.embeds[0], successEmbed],
            components: updatedPayload.components
          });
        }

        // Xử lý Buttons
        if (i.isButton()) {
          if (i.customId === 'danhhieu_revert') {
            const currentUser = await User.findOne({ discordId: userId });
            if (!currentUser) return;

            const defaultTitle = getRankName(currentUser.level);
            currentUser.title = defaultTitle;
            await currentUser.save();

            // Đồng bộ biệt danh và vai trò Discord ngay lập tức
            if (interaction.guild && interaction.member) {
              await updateGuildMemberRole(interaction.member as any, currentUser.level);
            }

            // Cập nhật giao diện mới
            const updatedPayload = generateTitleEmbedAndComponents(defaultTitle, currentUser.titlesOwned || [], defaultTitle);
            
            const successEmbed = new EmbedBuilder()
              .setTitle('🌾 ĐỒNG BỘ MẶC ĐỊNH THÀNH CÔNG 🌾')
              .setDescription(`Đã đưa danh hiệu về mặc định theo cấp tu vi: **${defaultTitle}**`)
              .setColor('#3B82F6');

            await i.update({
              embeds: [updatedPayload.embeds[0], successEmbed],
              components: updatedPayload.components
            });
          } else if (i.customId === 'danhhieu_refresh') {
            const currentUser = await User.findOne({ discordId: userId });
            if (!currentUser) return;

            const defaultTitle = getRankName(currentUser.level);
            const active = currentUser.title || defaultTitle;
            const updatedPayload = generateTitleEmbedAndComponents(active, currentUser.titlesOwned || [], defaultTitle);

            await i.update({
              embeds: updatedPayload.embeds,
              components: updatedPayload.components
            });
          }
        }
      });

      collector.on('end', async () => {
        try {
          await message.edit({ components: [] });
        } catch (err) {
          // Silent
        }
      });

    } catch (error) {
      console.error('[Command danhhieu] Lỗi:', error);
      await interaction.reply({ content: 'Không thể mở pháp trận quản lý danh hiệu lúc này.', flags: [64] });
    }
  }
};
