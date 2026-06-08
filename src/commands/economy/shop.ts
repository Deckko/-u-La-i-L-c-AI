import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  StringSelectMenuBuilder 
} from 'discord.js';
import User from '../../models/User.js';
import { updateGuildMemberRole } from '../../utils/levelUtils.js';

// Danh sách vật phẩm tiên tông
export interface IShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
}

export const SHOP_ITEMS: IShopItem[] = [
  { id: 'gacha_scroll', name: 'Vé Quay Gacha 📜', description: 'Dùng để thử vận khí tầm bảo tìm kiếm Chí Tôn Thần Khí bằng lệnh `/quay`.', cost: 50, effect: 'Gacha Scroll x1' },
  { id: 'combat_boost', name: 'Đột Phá Bản Thể Phù 💥', description: 'Gia tăng trực hệ linh lực lực chiến thêm +500 điểm.', cost: 200, effect: 'combat_power_500' },
  { id: 'epic_power_pill', name: 'Cửu Chuyển Đan Dược 🔮', description: 'Văn hóa luyện đan Thượng Giới truyền thụ. Tăng ngay +5,000 Lực chiến.', cost: 1800, effect: 'combat_power_5000' },
  { id: 'vip_rank_pass', name: 'Lệnh Bài VIP Tông Môn 👑', description: 'Sở hữu danh phận Tông Môn VIP, tước hiệu hiển thị quý phái.', cost: 1000, effect: 'vip_title' },
  { id: 'exclusive_title', name: 'Chí Tôn Thần Hoàng Ấn 🏵️', description: 'Đút kết thăng khoa danh vọng. Tặng danh hiệu Đệ Nhất Ma Tôn!', cost: 2500, effect: 'god_title' }
];

const ITEMS_PER_PAGE = 3;

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Truy cập Đế Tông Bảo Các (Cửa Hàng RPG) để mua sắm đan dược và vật phẩm'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    let currentPage = 1;
    let selectedItemId: string | null = null;

    const user = await User.findOne({ discordId: userId });
    if (!user || !user.registered) {
      const errEmbed = new EmbedBuilder()
        .setTitle('⚠️ CHƯA ĐĂNG KÝ ⚠️')
        .setDescription('Vui lòng gõ `/dangky` ghi nhận thân thế tiên nhân trước khi giao dịch đan linh thoại.')
        .setColor('#FFCC00');
      return interaction.reply({ embeds: [errEmbed] });
    }

    // 1. Tạo hàm render Trang Shop tương ứng
    function generateShopEmbedAndComponents(page: number, selectedId: string | null, userBalance: number, characterName: string, gachaScrolls: number = 0) {
      const totalPages = Math.ceil(SHOP_ITEMS.length / ITEMS_PER_PAGE);
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const paginatedItems = SHOP_ITEMS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      const embed = new EmbedBuilder()
        .setTitle('🏪 ĐẾ TÔNG PHIÊN CHỢ - BẢO CÁC 🏪')
        .setDescription(`Khách nhân: **${characterName}**\nSố dư khố phòng: 🪙 **${userBalance.toLocaleString()} Xu** | 🎟️ **${gachaScrolls} Vé Gacha**\n\nHãy dùng **Xu Đế Tông** để trao đổi đan dược hộ thân và các thần vật bảo pháp thượng cổ.`)
        .setColor('#D4AF37')
        .setFooter({ text: `Bảo Các Trang ${page}/${totalPages} • Thế giới Đấu La` })
        .setTimestamp();

      // Thêm thông tin vật phẩm vào Embed
      paginatedItems.forEach(item => {
        const isSelected = item.id === selectedId;
        embed.addFields({
          name: `${isSelected ? '👉 ' : ''}${item.name} | 🪙 ${item.cost.toLocaleString()} Xu`,
          value: `- ID: \`${item.id}\`\n- Hiệu quả: *${item.effect}*\n- Mô tả: *${item.description}*`,
          inline: false
        });
      });

      // Tạo nút phân trang & Xác nhận mua
      const selectedItem = SHOP_ITEMS.find(item => item.id === selectedId);
      const btnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`shop:prev:${page}`)
          .setLabel('Trang Trước ⬅️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId(`shop:next:${page}`)
          .setLabel('➡️ Trang Kế')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages),
        new ButtonBuilder()
          .setCustomId(`shop:confirm_buy:${page}`)
          .setLabel(selectedItem ? `Mua: ${selectedItem.name.replace(/[^\w\s\u00C0-\u1EF9]/g, '').trim()}` : 'Xác nhận mua 🛒')
          .setStyle(ButtonStyle.Success)
          .setDisabled(!selectedItem)
      );

      // Tạo Menu chọn mua vật phẩm của trang hiện tại
      const buyMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_buy_menu')
        .setPlaceholder('Chọn vật phẩm linh lực muốn mua...')
        .addOptions(
          paginatedItems.map(item => ({
            label: item.name.replace(/[^\w\s\u00C0-\u1EF9]/g, '').trim(),
            description: `${item.cost} Xu | Hàng hiệu quả cao`,
            value: item.id,
            default: item.id === selectedId
          }))
        );

      const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(buyMenu);

      return { embeds: [embed], components: [menuRow, btnRow] };
    }

    // Gửi phản hồi đầu tiên
    const message = await interaction.reply(generateShopEmbedAndComponents(currentPage, selectedItemId, user.balance, user.characterName || '', user.gachaScrolls || 0));

    // Khởi tạo Collector để bắt sự kiện người chơi click vào Shop
    const collector = message.createMessageComponentCollector({
      filter: (i) => i.user.id === userId, // Chỉ người gọi lệnh mới thao tác được shop này
      time: 60 * 1000 // Hết hạn sau 1 phút thiền đạo
    });

    collector.on('collect', async (i) => {
      const parts = i.customId.split(':');
      const action = parts[0] === 'shop' ? parts[1] : null;

      // Case 1: Đệ tử ấn nút chuyển trang, xác nhận mua, hoặc quay lại
      if (i.isButton()) {
        if (action === 'prev' || action === 'next') {
          let targetPage = parseInt(parts[2], 10);
          if (action === 'prev') targetPage--;
          if (action === 'next') targetPage++;

          const maxPages = Math.ceil(SHOP_ITEMS.length / ITEMS_PER_PAGE);
          if (targetPage >= 1 && targetPage <= maxPages) {
            currentPage = targetPage;
            selectedItemId = null; // Clear selection when changing page
            const currentUser = await User.findOne({ discordId: userId }) || user;
            await i.update(generateShopEmbedAndComponents(currentPage, selectedItemId, currentUser.balance, currentUser.characterName || '', currentUser.gachaScrolls || 0));
          }
        } else if (action === 'confirm_buy') {
          if (!selectedItemId) {
            await i.reply({ content: '⚠️ Chưa chọn vật phẩm nào!', flags: [64] });
            return;
          }

          const selectedItem = SHOP_ITEMS.find(item => item.id === selectedItemId);
          if (!selectedItem) {
            await i.reply({ content: '⚠️ Vật phẩm không hợp lệ!', flags: [64] });
            return;
          }

          const currentUser = await User.findOne({ discordId: userId });
          if (!currentUser || !currentUser.registered) {
            await i.reply({ content: '⚠️ Chưa đăng ký tài khoản!', flags: [64] });
            return;
          }

          if (currentUser.balance < selectedItem.cost) {
            const errEmbed = new EmbedBuilder()
              .setTitle('❌ NGHÈO KHÓ TRỞ NGẠI ❌')
              .setDescription(`Bạn cần **${selectedItem.cost} Xu**, nhưng hiện tại khố phòng chỉ có **${currentUser.balance} Xu Đế Tông**.\nHãy siêng năng làm việc thêm!`)
              .setColor('#FF5555');
            
            const backBtnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(`shop:back_to_shop:${currentPage}`)
                .setLabel('Quay lại Cửa hàng 🏪')
                .setStyle(ButtonStyle.Primary)
            );
            await i.update({ embeds: [errEmbed], components: [backBtnRow] });
            return;
          }

          // Trừ tiền tệ
          currentUser.balance -= selectedItem.cost;

          // Xử lý effect mua sắm cụ thể
          let extraResultText = '';
          let shouldUpdateRole = false;
          if (selectedItem.id === 'gacha_scroll') {
            currentUser.gachaScrolls = (currentUser.gachaScrolls || 0) + 1;
            extraResultText = `🎟️ Đã bổ sung 1 **Vé Quay Gacha Hoàng Kim** vào khay hành trang của bạn! Đệ tử có thể tiến hành \`/quay\` tầm bảo ngay.`;
          } else if (selectedItem.id === 'combat_boost') {
            currentUser.combatPower += 500;
            extraResultText = `💥 Cơ thể của bạn nóng rực! Lực chiến tăng mạnh **+500 Linh lực**.`;
          } else if (selectedItem.id === 'epic_power_pill') {
            currentUser.combatPower += 5000;
            extraResultText = `🔮 Cửu chuyển kim đan đại mạch thông suốt! Lực chiến bay cao thêm **+5,000 Linh lực**.`;
          } else if (selectedItem.id === 'vip_rank_pass') {
            const newTitle = `👑 VIP • ${currentUser.title}`;
            currentUser.title = newTitle;
            if (!currentUser.titlesOwned.includes(newTitle)) {
              currentUser.titlesOwned.push(newTitle);
            }
            extraResultText = `👑 Bạn đã có được thân phận tôn quý **VIP Tông Môn** lẫy lừng! Chúc mừng tôn phong.`;
            shouldUpdateRole = true;
          } else if (selectedItem.id === 'exclusive_title') {
            const newTitle = `🏵️ Đệ Nhất Ma Tôn Hoàng Kim 🏵️`;
            currentUser.title = newTitle;
            if (!currentUser.titlesOwned.includes(newTitle)) {
              currentUser.titlesOwned.push(newTitle);
            }
            extraResultText = `🔥 Bạn đã hấp thụ hoàn chỉnh Chí Tôn Thần Hoàng Ấn! Danh hiệu được quy đổi thành **Đệ Nhất Ma Tôn Hoàng Kim** cực ngầu!`;
            shouldUpdateRole = true;
          }

          await currentUser.save();

          // Cập nhật biệt danh và vai trò ngay khi mua danh hiệu
          if (shouldUpdateRole && interaction.guild && interaction.member) {
            await updateGuildMemberRole(interaction.member as any, currentUser.level);
          }

          const purchaseEmbed = new EmbedBuilder()
            .setTitle('🛒 TIÊN PHÁP TRANH ĐOẠT THÀNH CÔNG 🛒')
            .setDescription(`Chúc mừng đệ tử **${currentUser.characterName}** đã thu hoạch thành công tiên phẩm đỉnh cấp!`)
            .setColor('#10B981')
            .setThumbnail(i.user.displayAvatarURL())
            .addFields(
              { name: 'Vật Phẩm Sở Hữu', value: selectedItem.name, inline: true },
              { name: 'Khố Phòng Khấu Trừ', value: `-${selectedItem.cost} Xu`, inline: true },
              { name: 'Số Dư Khố Phòng', value: `🪙 ${currentUser.balance} Xu`, inline: true },
              { name: 'Biến Chuyển Linh Thể', value: extraResultText, inline: false }
            )
            .setTimestamp();

          const backBtnRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`shop:back_to_shop:${currentPage}`)
              .setLabel('Quay lại Cửa hàng 🏪')
              .setStyle(ButtonStyle.Primary)
          );

          // Clear selection after purchase
          selectedItemId = null;

          await i.update({ embeds: [purchaseEmbed], components: [backBtnRow] });
        } else if (action === 'back_to_shop') {
          const currentUser = await User.findOne({ discordId: userId }) || user;
          await i.update(generateShopEmbedAndComponents(currentPage, selectedItemId, currentUser.balance, currentUser.characterName || '', currentUser.gachaScrolls || 0));
        }
      }

      // Case 2: Đệ tử chọn đồ qua Select Menu (chỉ ghi nhận trạng thái chọn chứ chưa mua trực tiếp)
      if (i.isStringSelectMenu() && i.customId === 'shop_buy_menu') {
        selectedItemId = i.values[0];
        const currentUser = await User.findOne({ discordId: userId }) || user;
        await i.update(generateShopEmbedAndComponents(currentPage, selectedItemId, currentUser.balance, currentUser.characterName || '', currentUser.gachaScrolls || 0));
      }
    });

    collector.on('end', async () => {
      // Hết thời gian thì gỡ bỏ các components để tiết kiệm bộ nhớ & tránh click lỗi
      try {
        await message.edit({ components: [] });
      } catch (err) {
        // Silent error if message was deleted
      }
    });
  }
};
