import { 
  SlashCommandBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js';
import User from '../../database/models/User.js';

export default {
  cooldown: 5, // Cooldown 5 giây chống spam lệnh tạo modal liên tục
  data: new SlashCommandBuilder()
    .setName('dangky')
    .setDescription('Ghi danh vào Đế Tông Tông Môn Đấu La Đại Lục'),
    
  async execute(interaction: ChatInputCommandInteraction) {
    // Kiểm tra xem đã đăng ký chưa
    const existingUser = await User.findOne({ discordId: interaction.user.id });
    if (existingUser && existingUser.registered) {
      const errEmbed = new EmbedBuilder()
        .setTitle('⚠️ THẦT BẠI TRUY CẬP ⚠️')
        .setDescription('Tôn giả đã ghi danh vào sổ sách tông môn từ trước! Không được phép tái lập danh môn.\n\n*Mẹo: Nếu muốn sửa đổi thông tin lực chiến/tên, hãy sử dụng lệnh `/suahoso`.*')
        .setColor('#FF5555');
      return interaction.reply({ embeds: [errEmbed], flags: [64] });
    }

    // Khởi tạo Modal ghi danh
    const modal = new ModalBuilder()
      .setCustomId('dangky_modal')
      .setTitle('GHI DANH ĐẾ TÔNG - RPG');

    // Trường Tên Nhân Vật
    const characterNameInput = new TextInputBuilder()
      .setCustomId('dangky_char_name_input')
      .setLabel('TÊN NHÂN VẬT (Bản Đạo Danh)')
      .setPlaceholder('VD: Đường Tam, Tiêu Viêm, ...')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(25)
      .setRequired(true);

    // Trường Tên Server
    const serverNameInput = new TextInputBuilder()
      .setCustomId('dangky_server_name_input')
      .setLabel('TÊN SERVER (Bản Địa)')
      .setPlaceholder('VD: S1 - Hạo Thiên Tông, S70 - Sát Thần...')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(30)
      .setRequired(true);

    // Trường Lực Chiến
    const combatPowerInput = new TextInputBuilder()
      .setCustomId('dangky_combat_power_input')
      .setLabel('LỰC CHIẾN TU VI HẬU THIÊN')
      .setPlaceholder('Điền một số nguyên dương. VD: 15600')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(12)
      .setRequired(true);

    // Ghép các Action Rows
    const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(characterNameInput);
    const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(serverNameInput);
    const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(combatPowerInput);

    modal.addComponents(firstRow, secondRow, thirdRow);

    // Đẩy modal về phía Client đệ tử hiển thị
    await interaction.showModal(modal);
  }
};
