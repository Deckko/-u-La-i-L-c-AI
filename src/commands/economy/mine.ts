import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import User from '../../database/models/User.js';
import { checkLevelUp } from '../../utils/levelUtils.js';
import { eventBus } from '../../core/EventBus.js';
import { effectEngine } from '../../services/EffectEngine.js';

const MINE_LOOTS = [
  { ore: 'Phế Thiết Ngũ Kim 🪨', tier: 'Tạp Chất', low: 50, high: 80, msg: 'Đào được vụn quặng kim loại bình thường, rác rưởi nhưng có thể bồi bổ lò rèn.' },
  { ore: 'Hắc Thủy Tinh Quặng 🔮', tier: 'Trung Kỳ', low: 90, high: 140, msg: 'Đào trúng tinh thạch đen lấp lánh phản quang tinh khiết tràn ngập lực cốt.' },
  { ore: 'Hoàng Kim Chu Sa Quặng 🪙', tier: 'Cao Kỳ (Quý)', low: 150, high: 195, msg: 'Hân hoan nảy quặng sặc sỡ ánh kim sa, khối lượng nén nhiều nguyên chất tiền tiền tiền!' },
  { ore: 'Đại Hỗn Độn Nguyên Thạch Càn Khôn ✨', tier: 'Đỉnh Cảnh (Cực Hiếm)', low: 200, high: 260, msg: 'Đập rầm một tiếng, nứt ra cổ ngọc chiếu thẳng hào quang mười dặm hoàng kim thái cổ!' }
];

export default {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Mang cuốc chim khai sơn thám tháo quặng tại quặng mỏ Đế Tông nhận Đấu Xu'),

  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({ discordId: userId });

      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Gõ `/dangky` để ghi tên nhập môn mới có thể xin phát mộc trâm cuốc quặng tại Sơn Thâm Bảo Khố!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      // Tính toán cooldown động dựa trên Effect Engine (cooldown_reduction)
      const cooldownReduction = await effectEngine.calculateBoost(userId, 'cooldown_reduction');
      const baseCooldownMs = 10 * 60 * 1000; // 10 Phút
      const cooldownMs = Math.floor(baseCooldownMs * (1 - cooldownReduction));

      const now = Date.now();
      const lastMineTime = user.lastMine ? new Date(user.lastMine).getTime() : 0;

      if (now - lastMineTime < cooldownMs) {
        const timeLeftMs = cooldownMs - (now - lastMineTime);
        const minsLeft = Math.floor(timeLeftMs / (1000 * 60));
        const secsLeft = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

        const cdEmbed = new EmbedBuilder()
          .setTitle('⏳ SƠN HOÀNG CẤM THUẬT ⏳')
          .setDescription(`Mạch đá còn sụp đổ mịt mù khói bụi linh lực! Hãy đợi **${minsLeft}p ${secsLeft}s** nữa cho đất đai yên vị rồi hả đào bới tiếp.`)
          .setColor('#FF5555');
        return interaction.reply({ embeds: [cdEmbed] });
      }

      // Tỷ lệ rớt: 50% Sơ bần, 35% Thượng phẩm, 11% Cao kỳ, 4% Chí cực nguyên thạch
      const r = Math.random() * 100;
      let loot;
      if (r < 50) {
        loot = MINE_LOOTS[0];
      } else if (r < 85) {
        loot = MINE_LOOTS[1];
      } else if (r < 96) {
        loot = MINE_LOOTS[2];
      } else {
        loot = MINE_LOOTS[3];
      }

      // Tính xu nhận được ngẫu nhiên trong khoảng low - high kèm boost từ Effect Engine
      const coinBoost = await effectEngine.calculateBoost(userId, 'coin_boost');
      const expBoost = await effectEngine.calculateBoost(userId, 'xp_boost');

      const rawCoins = Math.floor(Math.random() * (loot.high - loot.low + 1)) + loot.low;
      const rawExp = Math.floor(Math.random() * 11) + 5; // 5 -> 15 XP

      const coinsEarned = Math.floor(rawCoins * (1 + coinBoost));
      const expEarned = Math.floor(rawExp * (1 + expBoost));

      user.balance += coinsEarned;
      user.exp += expEarned;
      user.lastMine = new Date();

      const levelUpResult = await checkLevelUp(user, interaction.member as any);
      await user.save();

      // Phát sự kiện cày cuốc qua Event Bus để Quest & Achievement tự động xử lý
      eventBus.emitEvent('player_mined', {
        userId,
        guildId: interaction.guildId || 'global',
        coinsEarned,
        expEarned,
        lootTier: loot.tier
      });

      let descText = `Vung cuốc thiền định dũng mãnh đập nát lớp thạch phong vũ trụ!\nTông giả tìm thấy quặng khoáng: **${loot.ore}** [Cấp bậc: **${loot.tier}**]`;
      if (levelUpResult.leveledUp) {
        descText += `${levelUpResult.msg}`;
      }

      const successEmbed = new EmbedBuilder()
        .setTitle('⛏️ KHAI MỎ HOÀNG KIM SƠN THẦN ⛏️')
        .setDescription(descText)
        .setColor('#F59E0B') // Hổ Phách rực rỡ tượng trưng cho tinh quặng
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '🪙 Tinh thạch ngân sách', value: `+${coinsEarned} Xu Đế Tông`, inline: true },
          { name: '⚡ Nguyên khí tăng tiến', value: `+${expEarned} XP Cảnh giới`, inline: true },
          { name: '💰 Tổng Khố Phòng', value: `🪙 ${user.balance.toLocaleString()} Xu`, inline: true }
        )
        .setFooter({ text: `Chú giải quặng: ${loot.msg}` })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (error) {
      console.error('[Command mine] Lỗi:', error);
      try {
        await interaction.reply({ content: 'Hang đá đổ vỡ nghẽn mạch cuốc quặng thất bại, vạn xin thần linh tha thứ!', flags: [64] });
      } catch (e) {
        console.error('[Command mine] Không thể gửi báo lỗi:', e);
      }
    }
  }
};
