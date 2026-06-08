import { 
  SlashCommandBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js';
import User from '../../models/User.js';

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('suahoso')
    .setDescription('Chỉnh sửa thông tin danh tính (Tên nhân vật, Server, Lực chiến) của bạn'),
    
  async execute(interaction: ChatInputCommandInteraction) {
    // Kiểm tra xem đã đăng ký chưa
    const user = await User.findOne({ discordId: interaction.user.id });
    if (!user || !user.registered) {
      const errEmbed = new EmbedBuilder()
        .setTitle('⚠️ CHƯA GHI DANH ⚠️')
        .setDescription('Tôn giả chưa ghi danh nhập môn! Hãy sử dụng lệnh `/dangky` trước để gia nhập tông môn.')
        .setColor('#FF5555');
      return interaction.reply({ embeds: [errEmbed], flags: [64] });
    }

    // Khởi tạo Modal sửa hồ sơ
    const modal = new ModalBuilder()
      .setCustomId('suahoso_modal')
      .setTitle('CHỈNH SỬA HỒ SƠ ĐẾ TÔNG');

    // Trường Tên Nhân Vật
    const characterNameInput = new TextInputBuilder()
      .setCustomId('suahoso_char_name_input')
      .setLabel('TÊN NHÂN VẬT MỚI')
      .setValue(user.characterName || '')
      .setPlaceholder('VD: Đường Tam, Tiêu Viêm...')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(25)
      .setRequired(true);

    // Trường Tên Server
    const serverNameInput = new TextInputBuilder()
      .setCustomId('suahoso_server_name_input')
      .setLabel('TÊN SERVER MỚI')
      .setValue(user.serverName || '')
      .setPlaceholder('VD: S1 - Hạo Thiên Tông...')
      .setStyle(TextInputStyle.Short)
      .setMinLength(2)
      .setMaxLength(30)
      .setRequired(true);

    // Trường Lực Chiến
    const combatPowerInput = new TextInputBuilder()
      .setCustomId('suahoso_combat_power_input')
      .setLabel('LỰC CHIẾN TU VI MỚI')
      .setValue(String(user.combatPower || 0))
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

    // Đẩy modal về phía Client
    await interaction.showModal(modal);
  }
};
