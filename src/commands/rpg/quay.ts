import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../models/User.js';
import { checkLevelUp, updateGuildMemberRole } from '../../utils/levelUtils.js';

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('quay')
    .setDescription('Thực hiện gacha quay số tầm bảo Đế Tông Thần Chi Địa giá 50 Xu hoặc 1 Vé Tầm Bảo'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ CHƯA NHẬP ĐẠO ⚠️')
          .setDescription('Gõ `/dangky` gia nhập thiên quân Đế Tông mới khai triển được thần trận gacha tầm bảo!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      // Thanh toán chi phí:
      // Kiểm tra và tiêu hao 1 Vé Quay Gacha từ khay hành trang
      if (!user.gachaScrolls || user.gachaScrolls < 1) {
        const notEnoughEmbed = new EmbedBuilder()
          .setTitle('❌ THIẾU VÉ QUAY GACHA ❌')
          .setDescription(`Bạn cần **1 Vé Quay Gacha** để kích hoạt tầm bảo. Khay hành trang của bạn hiện tại không có vé nào!\nHãy ghé thăm **Đế Tông Bảo Các** bằng lệnh \`/shop\` để mua thêm vé.`)
          .setColor('#FF5555');
        return interaction.reply({ embeds: [notEnoughEmbed] });
      }

      // Khấu trừ tài sản
      user.gachaScrolls -= 1;

      // Tính toán tỉ lệ Gacha Drop Rate:
      // 55% Normal, 28% Rare, 12% Epic, 4.5% Legendary, 0.5% Divine
      const roll = Math.random() * 100;

      let tier = '';
      let lootName = '';
      let lootColor = '';
      let expAward = 0;
      let powerAward = 0;
      let titleReward = '';

      if (roll < 55) {
        // Normal (55.0%)
        tier = '⚪ Sơ Cấp Thường Phẩm (55.0%)';
        lootName = 'Bách Niên Hồn Hoàn Lam Ngân Thảo ☘️';
        lootColor = '#94A3B8'; // Xám bạc
        powerAward = Math.floor(Math.random() * 51) + 50; // 50 -> 100 Lực chiến
        expAward = 10;
      } else if (roll < 83) {
        // Rare (28.0%)
        tier = '🟢 Trung Kỳ Bảo Thạch (28.0%)';
        lootName = 'Thiên Niên Hồn Hoàn Quỷ Hỏa Khuyển 🐺';
        lootColor = '#10B981'; // Xanh lá
        powerAward = Math.floor(Math.random() * 151) + 200; // 200 -> 350 Lực chiến
        expAward = 30;
      } else if (roll < 95) {
        // Epic (12.0%)
        tier = '🟣 Thượng Cổ Bảo Vật (12.0%)';
        lootName = 'Hải Thần Tam Xoa Kích Bán Thành Phẩm 🔱';
        lootColor = '#8B5CF6'; // Tím Ma Pháp
        powerAward = Math.floor(Math.random() * 401) + 800; // 800 -> 1200 Lực chiến
        expAward = 100;
        titleReward = '🏅 Anh Hùng Hóa Hồn';
      } else if (roll < 99.5) {
        // Legendary (4.5%)
        tier = '🟠 Chí Tôn Thượng Thần (4.5%)';
        lootName = 'Cửu Vĩ Thiên Hồn Thần Cốt Hoàng Kim ✨';
        lootColor = '#F59E0B'; // Vàng cam
        powerAward = Math.floor(Math.random() * 1501) + 3000; // 3000 -> 4500 Lực chiến
        expAward = 500;
        titleReward = '👑 Thần Vương Đấu La';
      } else {
        // Divine (0.5%)
        tier = '🔮 HOÀNG KIM CHÍ CAO VẠN CỔ THẦN (0.5% CỰC HIẾM)';
        lootName = 'VẠN CỔ ĐỘC TÔN THIÊN ĐẾ ẤN INFINTY 🌟';
        lootColor = '#EC4899'; // Hồng Độc Tôn
        powerAward = 15000; // 15,000 Lực chiến cực hạn
        expAward = 2500;
        titleReward = '⚡ Chí Cao Vạn Cổ Thần ✨';
      }

      // Áp dụng phần thưởng và lưu DB
      user.combatPower += powerAward;
      user.exp += expAward;
      if (titleReward) {
        user.title = titleReward;
        if (!user.titlesOwned.includes(titleReward)) {
          user.titlesOwned.push(titleReward);
        }
      }

      const levelUpResult = await checkLevelUp(user, interaction.member as any);
      
      // Nếu có danh hiệu thưởng từ Gacha thì giữ nguyên danh hiệu đó thay vì bị đè bởi level title mới
      if (titleReward) {
        user.title = titleReward;
        if (!user.titlesOwned.includes(titleReward)) {
          user.titlesOwned.push(titleReward);
        }
      }
      
      await user.save();

      // Cập nhật biệt danh và vai trò ngay khi nhận thưởng danh hiệu từ Gacha
      if (titleReward && interaction.guild && interaction.member) {
        await updateGuildMemberRole(interaction.member as any, user.level);
      }

      let descText = `Sử dụng **1 Vé Quay Gacha** kích hoạt Hỗn Độn Tầm Bảo Trận thành công. Hư không rách mở ra tiên khí bốc lên ngào ngạt!`;
      if (levelUpResult.leveledUp) {
        descText += `${levelUpResult.msg}`;
      }

      const gachaEmbed = new EmbedBuilder()
        .setTitle('🔮 ĐẾ TÔNG CHI ĐỊA - CHIẾN TRẬN CHI QUAY 🔮')
        .setDescription(descText)
        .setColor(lootColor as any)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '✨ Cảnh Giới Tầm Bảo', value: `🛠️ **${tier}**`, inline: false },
          { name: '🎁 Vật Phẩm Thu Hoạch', value: `🌸 **${lootName}**`, inline: false },
          { name: '⚡ Tác Động Linh Lực', value: `💥 +${powerAward.toLocaleString()} Lực Chiến \n🧪 +${expAward} XP cảnh giới`, inline: true },
          { name: '🎟️ Vé Gacha Còn Lại', value: `🎟️ **${user.gachaScrolls} Vé**`, inline: true }
        )
        .setFooter({ text: 'Tỷ lệ Gacha công bằng: Thường (55%) | Trung (28%) | Quý (12%) | Thần Vương (4.5%) | Chí Cao (0.5%)' })
        .setTimestamp();

      if (titleReward) {
        gachaEmbed.addFields({ name: '🎗️ Tông Môn Sắc Phong Danh Hiệu', value: `🎉 Nhậm phong danh hiệu siêu cấp mới: **${titleReward}**!`, inline: false });
      }

      await interaction.reply({ embeds: [gachaEmbed] });
    } catch (error) {
      console.error('[Command quay] Lỗi Gacha:', error);
      await interaction.reply('Thần trận gacha bốc lửa dữ dội khôn lường, cướp đoạt tầm bảo thất bại.');
    }
  }
};
