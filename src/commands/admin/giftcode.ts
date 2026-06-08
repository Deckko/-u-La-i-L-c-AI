import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  PermissionFlagsBits 
} from 'discord.js';
import Giftcode from '../../models/Giftcode.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('giftcode')
    .setDescription('Hệ thống lệnh quản lý Giftcode Tông Môn Đấu La (Chỉ dành cho Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Khóa lệnh ở tầng Discord API
    .addSubcommand(subcmd => 
      subcmd.setName('create')
        .setDescription('Tạo Giftcode thần quỹ Đế Tông mới')
        .addStringOption(opt => opt.setName('code').setDescription('Mã code bí truyền').setRequired(true))
        .addIntegerOption(opt => opt.setName('xu').setDescription('Lượng Xu Đế Tông ban thưởng').setRequired(true))
        .addIntegerOption(opt => opt.setName('exp').setDescription('Lượng XP cảnh giới ban thưởng').setRequired(true))
        .addIntegerOption(opt => opt.setName('luot_nhap').setDescription('Số lượt sử dụng tối đa').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('view')
        .setDescription('Xem toàn bộ danh quản lý Giftcode hiện hữu trong bản đồ tông môn')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '⚠️ **XÂM PHẠM**: Bạn không có quyền hành của một Trưởng Lão Tối Cao (Administrator) để can thiệp vào kho báu Giftcode!', 
        flags: [64] 
      });
    }

    const sub = interaction.options.getSubcommand();

    // =======================================================
    // 1. TẠO GIFTCODE (create)
    // =======================================================
    if (sub === 'create') {
      const codeInput = interaction.options.getString('code')!.trim().toUpperCase();
      const rewardCoins = interaction.options.getInteger('xu')!;
      const rewardExp = interaction.options.getInteger('exp')!;
      const maxUses = interaction.options.getInteger('luot_nhap')!;

      try {
        // Kiểm tra xem code đã tồn tại chưa
        const existing = await Giftcode.findOne({ code: codeInput });
        if (existing) {
          const errEmbed = new EmbedBuilder()
            .setTitle('❌ THIẾT BIỆT THẤT BẠI ❌')
            .setDescription(`Mã mật hiệu **${codeInput}** đã tồn tại trong tiên điển bảo pháp! Vui lòng chọn ký tự mật hiệu khác.`)
            .setColor('#FF0000');
          return interaction.reply({ embeds: [errEmbed] });
        }

        // Tạo mới
        const newCode = new Giftcode({
          code: codeInput,
          rewardCoins,
          rewardExp,
          maxUses,
          usedCount: 0,
          usedBy: []
        });

        await newCode.save();

        const successEmbed = new EmbedBuilder()
          .setTitle('💮 THIÊN ẤN TẠO THÀNH - GIFTCODE ẤN HÀNH 💮')
          .setDescription('Chưởng quản tối cao vừa khắc thêm mật tự vào tiên thạch bảo pháp, ban phúc lành cho vạn chúng!')
          .setColor('#10B981')
          .addFields(
            { name: '🔑 Mật Mã', value: `\`${codeInput}\``, inline: true },
            { name: '🪙 Ban Thưởng Xu', value: `+${rewardCoins.toLocaleString()} Xu`, inline: true },
            { name: '⚡ Ban Thưởng XP', value: `+${rewardExp.toLocaleString()} XP`, inline: true },
            { name: '👥 Tổng Lượt Nhập', value: `Sử dụng: **${maxUses}** đệ tử tối đa`, inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [successEmbed] });
      } catch (error) {
        console.error('[Giftcode Create] Lỗi:', error);
        return interaction.reply('Khắc ấn mật mã thất bại do nghẽn luồng bảo khí.');
      }
    }

    // =======================================================
    // 2. XEM TOÀN BỘ DANH SÁCH GIFTCODES (view)
    // =======================================================
    if (sub === 'view') {
      try {
        const codes = await Giftcode.find({}).sort({ createdAt: -1 }).limit(15);
        
        if (codes.length === 0) {
          const noCodesEmbed = new EmbedBuilder()
            .setTitle('🔑 THIÊN ẤN CHƯA KHAI 🔑')
            .setDescription('Tông môn hiện chưa có mã Giftcode bảo pháp nào được tạo lập trong hệ thống.')
            .setColor('#6B7280');
          return interaction.reply({ embeds: [noCodesEmbed], flags: [64] });
        }

        const viewEmbed = new EmbedBuilder()
          .setTitle('⚙️ THIÊN THƯ QUẢN TRỊ - DANH KHẢO GIFTCODE ⚙️')
          .setDescription('Hiển thị tối đa 15 mật tự thần quĩ Đế Tông vừa cấu tạo mới nhất:')
          .setColor('#1E3A8A') // Màu xanh biển đậm quyền quý
          .setTimestamp();

        codes.forEach(c => {
          viewEmbed.addFields({
            name: `🔑 Code: \`${c.code}\``,
            value: `- Thưởng: **${c.rewardCoins.toLocaleString()} Xu** | **${c.rewardExp.toLocaleString()} XP**\n- Giới hạn: **${c.usedCount} / ${c.maxUses} lượt nhập**`,
            inline: false
          });
        });

        return interaction.reply({ embeds: [viewEmbed], flags: [64] });
      } catch (error) {
        console.error('[Giftcode View] Lỗi:', error);
        return interaction.reply({ content: 'Thấu suốt khố mật pháp bại lộ, không thể hiển thị.', flags: [64] });
      }
    }
  }
};
