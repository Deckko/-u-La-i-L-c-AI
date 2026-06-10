import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../database/models/User.js';
import { checkLevelUp } from '../../utils/levelUtils.js';

const FISH_POOLS = [
  { catch: 'Cá Trắm Cỏ Linh Khí 🐟', tier: 'Sơ Cấp', coins: 15, msg: 'Hồ nhỏ rải rác linh thạch, cá chép há miệng đớp nhẹ phao thiền của tôn đạo.' },
  { catch: 'Băng Tinh Ngư Tuyết Lĩnh ❄️', tier: 'Trung Cấp', coins: 45, msg: 'Vớt được cá băng lấp lánh cực lạnh, mang linh năng hàn băng thanh mát tâm trạng.' },
  { catch: 'Hỏa Long Linh Ngư Dương Cực 🔥', tier: 'Cao Cấp', coins: 90, msg: 'Hấp dẫn đỉnh thế linh ngư đỏ rực, chứa chân hoả của Đấu La đại lục rực cháy nồng nàn.' },
  { catch: 'Yêu Thú Cửu Vĩ Linh Ngư Thượng Cổ 🐉', tier: 'Huyền Thoại (Cực Hiếm)', coins: 180, msg: 'Thần thú râu vàng lấp lánh, mười ngàn năm tu vi hiển hách vươn mình đớp thính!' }
];

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('fish')
    .setDescription('Truy cập đầm nước "Băng Hỏa Lưỡng Nghi Nhãn" để câu cá linh dược lấy Đấu Xu'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Gõ `/dangky` để ghi tên nhập môn trước khi mở cần trúc buông phao rèn tâm tại Linh Hồ!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      // Kiểm tra cooldown 5 phút (300,000 ms)
      const now = Date.now();
      const lastFishTime = user.lastFish ? new Date(user.lastFish).getTime() : 0;
      const cooldownMs = 5 * 60 * 1000; // 5 Phút

      if (now - lastFishTime < cooldownMs) {
        const timeLeftMs = cooldownMs - (now - lastFishTime);
        const minsLeft = Math.floor(timeLeftMs / (1000 * 60));
        const secsLeft = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

        const cdEmbed = new EmbedBuilder()
          .setTitle('⏳ KIÊN NHẪN CHỜ PHÁP ⏳')
          .setDescription(`Phao câu bị rêu bao phủ, đám yêu ngư còn cảnh giác! Hãy tĩnh lẵng tu dưỡng **${minsLeft}p ${secsLeft}s** tiếp theo rồi hạ phao.`)
          .setColor('#FF5555');
        return interaction.reply({ embeds: [cdEmbed] });
      }

      // Xác định tỷ lệ rớt cá linh tinh diệu
      // 55% Sơ cấp, 28% Trung cấp, 13% Cao cấp, 4% Huyền Thoại
      const r = Math.random() * 100;
      let fish;
      if (r < 55) {
        fish = FISH_POOLS[0];
      } else if (r < 83) {
        fish = FISH_POOLS[1];
      } else if (r < 96) {
        fish = FISH_POOLS[2];
      } else {
        fish = FISH_POOLS[3];
      }

      // Linh thạch cộng thêm
      const coinsEarned = fish.coins;
      const expEarned = Math.floor(Math.random() * 6) + 3; // 3-8 XP

      user.balance += coinsEarned;
      user.exp += expEarned;
      user.lastFish = new Date();

      const levelUpResult = await checkLevelUp(user, interaction.member as any);
      await user.save();

      let descText = `Vừa kéo cần thiền đạo lên mặt nước linh khí bốc lên nghi ngút!\nĐệ tử nhận về linh ngư: **${fish.catch}** [Cấp bậc: **${fish.tier}**]`;
      if (levelUpResult.leveledUp) {
        descText += `${levelUpResult.msg}`;
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('🎣 BĂNG HỎA SONG ĐẠO - THU HOẠCH LINH NGƯ 🎣')
        .setDescription(descText)
        .setColor('#3B82F6') // Màu xanh biển sâu thẳm
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🪙 Bản vị Linh Thạch', value: `+${coinsEarned} Xu Đế Tông`, inline: true },
          { name: '⚡ Tĩnh Tâm Thần Nghi', value: `+${expEarned} XP Cảnh giới`, inline: true },
          { name: '💰 Tổng Khố Phòng', value: `🪙 ${user.balance.toLocaleString()} Xu`, inline: true }
        )
        .setFooter({ text: `Yêu Ngư: ${fish.msg}` })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[Command fish] Lỗi:', error);
      try {
        await interaction.reply({ content: 'Phao tiêu bị rách giữa dòng, cá bơi mất khôn lường.', flags: [64] });
      } catch (e) {
        console.error('[Command fish] Không thể gửi báo lỗi:', e);
      }
    }
  }
};
