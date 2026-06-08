import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../models/User.js';
import { checkLevelUp } from '../../utils/levelUtils.js';

const WORK_ACTIONS = [
  { act: 'Luyện đan dược Thất Phẩm tại Dược Cực Cốc 🧪', msg: 'Đệ tử đã vận chuyển tiên khí đỉnh cấp, kết hợp linh dược hái lượm luyện thành đại đan dược.' },
  { act: 'Rèn đúc rèn binh tại Thiết Tượng Đường Hạo Thiên ⚒️', msg: 'Ròng rã vung gạt búa tạ liên thanh đập mài khoáng quặng để tạo ra hồn khí sơ cấp.' },
  { act: 'Tiến vào mật lâm thanh trừ bầy kiến Địa Ngục Yêu Thú 🐜', msg: 'Một kích trảm sát hàng vạn tà ma kiến nơ kết giới, bảo vệ chu toàn cho biên cảnh tông môn.' },
  { act: 'Truyền giảng đạo pháp tu hành cho Tân Đệ Tử 📕', msg: 'Ngồi kiết già trên bục giảng khai sáng tâm tinh cho chư vị đồng môn sơ kỳ trúc cơ.' }
];

export default {
  cooldown: 5, // Cooldown chống spam lệnh
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Siêng năng làm công việc tông môn để cày Xu Đế Tông và nâng cao tu vi'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Gõ `/dangky` để ghi tên nhập đạo mới có quyền gánh vác chấp vụ tông môn!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      // Kiểm tra cooldown thời gian thực 1 giờ (3600000 ms) qua DB
      const now = Date.now();
      const lastWorkTime = user.lastWork ? new Date(user.lastWork).getTime() : 0;
      const cooldownMs = 60 * 60 * 1000; // 1 Giờ

      if (now - lastWorkTime < cooldownMs) {
        const timeLeftMs = cooldownMs - (now - lastWorkTime);
        const minsLeft = Math.floor(timeLeftMs / (1000 * 60));
        const secsLeft = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

        const cdEmbed = new EmbedBuilder()
          .setTitle('⏳ KIỆT SỨC CẤM KHAI ⏳')
          .setDescription(`Huyệt đạo khí huyết chưa thông hết! Hãy tĩnh tâm thiền định hồi sức và quay lại trong vòng **${minsLeft} phút ${secsLeft} giây** nữa.`)
          .setColor('#FF5555');
        return interaction.reply({ embeds: [cdEmbed] });
      }

      // Chọn ngẫu nhiên công việc tu vị
      const work = WORK_ACTIONS[Math.floor(Math.random() * WORK_ACTIONS.length)];
      const coinsEarned = Math.floor(Math.random() * 71) + 30; // 30 -> 100 Xu
      const expEarned = Math.floor(Math.random() * 21) + 10;   // 10 -> 30 XP

      // Lưu trữ kết quả
      user.balance += coinsEarned;
      user.exp += expEarned;
      user.lastWork = new Date();

      const levelUpResult = await checkLevelUp(user, interaction.member as any);
      await user.save();

      let descText = `Tông giả đã hoàn thục đạo sự xuất sắc: **${work.act}**\n*${work.msg}*`;
      if (levelUpResult.leveledUp) {
        descText += `${levelUpResult.msg}`;
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('🛠️ CHẤP VỤ HOÀN THÀNH - ĐẾ TÔNG CHI CỤC 🛠️')
        .setDescription(descText)
        .setColor('#84CC16') // Màu xanh lục tươi sáng
        .addFields(
          { name: '🪙 Tiền Đột Phá', value: `+${coinsEarned} Xu Đế Tông`, inline: true },
          { name: '⚡ Tu Vi Tích Lũy', value: `+${expEarned} XP Cảnh giới`, inline: true },
          { name: '💰 Tổng Khố Phòng', value: `🪙 ${user.balance.toLocaleString()} Xu`, inline: true }
        )
        .setFooter({ text: 'Rèn luyện khổ cực ắt đắc thành Đại La Kim Tiên !' })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[Command work] Lỗi:', error);
      try {
        await interaction.reply({ content: 'Pháp sự chấp vụ tông môn hỗn loạn, hành sự bất thành.', flags: [64] });
      } catch (e) {
        console.error('[Command work] Không thể gửi báo lỗi:', e);
      }
    }
  }
};
