import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  PermissionFlagsBits 
} from 'discord.js';
import Boss from '../../models/Boss.js';
import User from '../../models/User.js';
import { checkLevelUp, updateGuildMemberRole } from '../../utils/levelUtils.js';

/**
 * Trả về chuỗi Progress Bar vẽ thanh HP của Boss một cách thẩm mỹ
 */
function getBossHpBar(hp: number, maxHp: number): string {
  const barLength = 10;
  const ratio = Math.max(0, Math.min(hp / maxHp, 1));
  const filled = Math.round(ratio * barLength);
  const empty = barLength - filled;
  return '🟥'.repeat(filled) + '⬜'.repeat(empty);
}

export default {
  cooldown: 2, // Đặt Cooldown lệnh 2 giây để tránh bão Click spam API
  data: new SlashCommandBuilder()
    .setName('boss')
    .setDescription('Hệ thống lệnh đánh Boss thế giới Đế Tông')
    .addSubcommand(subcmd => 
      subcmd.setName('spawn')
        .setDescription('Triệu hồi World Boss Thế Giới Đấu La (Chỉ dành cho Admin)')
        .addStringOption(opt => opt.setName('ten').setDescription('Tên Thần Ma Vương Boss').setRequired(true))
        .addIntegerOption(opt => opt.setName('hp').setDescription('Tổng lượng Huyết HP dồi dào').setRequired(true))
    )
    .addSubcommand(subcmd => 
      subcmd.setName('info')
        .setDescription('Hiển thị thông tin Thần Ma Boss hiện tại và Bảng sát thương')
    )
    .addSubcommand(subcmd => 
      subcmd.setName('attack')
        .setDescription('Thi triển linh lực Hỗn Độn vây hãm tấn công quyết đấu với Boss Thâm Cảnh')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    // =======================================================
    // CASE A: SPAWN BOSS (ADMIN ONLY)
    // =======================================================
    if (sub === 'spawn') {
      // Xác định quyền quản trị
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ 
          content: '⚠️ **BẤT LỰC**: Bạn không có đủ lực lượng linh đạo (quyền Administrator) để khởi chạy Thiên Trận triệu hồi Boss!', 
          flags: [64] 
        });
      }

      const bossName = interaction.options.getString('ten')!;
      const maxHp = interaction.options.getInteger('hp')!;

      try {
        // Cập nhật trạng thái Boss trong DB
        let boss = await Boss.findOne({ bossId: 'world_boss' });
        if (!boss) {
          boss = new Boss({ bossId: 'world_boss' });
        }

        boss.name = bossName;
        boss.maxHp = maxHp;
        boss.hp = maxHp;
        boss.active = true;
        boss.attacks = [];
        boss.spawnedBy = interaction.user.username;

        await boss.save();

        const spawnEmbed = new EmbedBuilder()
          .setTitle('👺 THẢM HỌA GIÁNG LÂM - THẾ GIỚI BOSS XUẤT THẾ 👺')
          .setDescription(`Hắc ám vạn dặm dâng trào! Trận pháp thiên lôi vỡ vụn, một siêu cấp Hồn Thần Ma đã giáng xuống hoành hành Đấu La!`)
          .setColor('#9333EA') // Màu tím yêu ma dũng mãnh
          .addFields(
            { name: '👹 Quái Ma Danh Xưng', value: `**${bossName}**`, inline: true },
            { name: '❤️ Sức Sống HP Linh Lực', value: `❤️ **${maxHp.toLocaleString()}** HP`, inline: true },
            { name: '📢 Thiên Lệnh Tông Môn', value: `Hỡi toàn thể đệ tử Đế Tông! Hãy nhanh chóng mài sắc hồn hoàn, gõ lệnh \`/boss attack\` để hợp công quy đổi trừ diệt ác ma nhặt về kho báu khủng!`, inline: false }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [spawnEmbed] });
      } catch (error) {
        console.error('[Boss Spawn] Lỗi:', error);
        return interaction.reply('Triệu hồi thất bại do bị rò rỉ linh tính pháp khí.');
      }
    }

    // =======================================================
    // CASE B: INFO BOSS
    // =======================================================
    if (sub === 'info') {
      try {
        const boss = await Boss.findOne({ bossId: 'world_boss' });

        if (!boss || !boss.active) {
          const noBossEmbed = new EmbedBuilder()
            .setTitle('💮 CHIẾN TRƯỜNG THÁI BÌNH 💮')
            .setDescription('Hiện tại tà khí đã bớt vây quanh, không có Boss thế giới hoạt động trong kết giới Đế Tông.')
            .setColor('#10B981');
          return interaction.reply({ embeds: [noBossEmbed] });
        }

        // Tạo bảng xếp hạng top sát thương
        const sortedAttacks = [...boss.attacks].sort((a, b) => b.damage - a.damage).slice(0, 10);
        let leaderboardText = '';

        if (sortedAttacks.length === 0) {
          leaderboardText = '*Chưa có chiến binh nào ra đòn tấn công! Hãy xung phong.*';
        } else {
          sortedAttacks.forEach((atk, idx) => {
            const pct = ((atk.damage / boss.maxHp) * 100).toFixed(1);
            let medal = `[#${idx + 1}]`;
            if (idx === 0) medal = '🥇';
            if (idx === 1) medal = '🥈';
            if (idx === 2) medal = '🥉';
            leaderboardText += `${medal} **${atk.username}** - Sát thương: **${atk.damage.toLocaleString()}** (${pct}%)\n`;
          });
        }

        const infoEmbed = new EmbedBuilder()
          .setTitle(`👹 THẦN MA ACTIVE: ${boss.name} 👹`)
          .setDescription(`Huyết mạch của Ma Thần đang dao động cực lớn. Chư vị tăng sĩ hãy xông lên phá kết giới!`)
          .setColor('#DC2626') // Đỏ sặc sỡ
          .addFields(
            { name: '🔥 Trạng Thái Sinh Mệnh HP', value: `${getBossHpBar(boss.hp, boss.maxHp)}\n**${boss.hp.toLocaleString()} / ${boss.maxHp.toLocaleString()} HP**`, inline: false },
            { name: '👑 Bảng Phong Thần Đột Kích (Top 10 Sát Thương)', value: leaderboardText, inline: false }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [infoEmbed] });
      } catch (error) {
        console.error('[Boss Info] Lỗi:', error);
        return interaction.reply('Lỗi không thể quan thấu thần giới lúc này.');
      }
    }

    // =======================================================
    // CASE C: ATTACK BOSS (CRITICAL HIGH CONCURRENCY LOCK ENGINE)
    // =======================================================
    if (sub === 'attack') {
      // 1. Kiểm tra đăng ký người dùng
      const user = await User.findOne({ discordId: userId });
      if (!user || !user.registered) {
        const notRegisteredEmbed = new EmbedBuilder()
          .setTitle('⚠️ THẤT BẠI ⚠️')
          .setDescription('Gõ `/dangky` ghi nhận tu vị thần quan tiên cốt của bạn trước khi phi thân đột kích Boss!')
          .setColor('#FFCC00');
        return interaction.reply({ embeds: [notRegisteredEmbed] });
      }

      try {
        // 2. Tính toán Thần Sát Thương dựa theo Lực chiến (Combat Power) của người đánh
        const baseDmg = Math.floor(user.combatPower * 0.05);
        const randomBonus = Math.floor(user.combatPower * Math.random() * 0.10);
        const finalDamage = baseDmg + randomBonus + 10;

        const charName = user.characterName || interaction.user.username;

        // 3. Thực hiện cập nhật HP Boss và danh sách sát thương nguyên tử (Atomic Update)
        // Thử cập nhật nếu người dùng ĐÃ có tên trong danh sách attacks
        let boss = await Boss.findOneAndUpdate(
          { bossId: 'world_boss', active: true, hp: { $gt: 0 }, "attacks.discordId": userId },
          { $inc: { hp: -finalDamage, "attacks.$.damage": finalDamage } },
          { new: true }
        );

        if (!boss) {
          // Nếu người dùng CHƯA có tên trong danh sách attacks, push entry mới
          boss = await Boss.findOneAndUpdate(
            { bossId: 'world_boss', active: true, hp: { $gt: 0 }, "attacks.discordId": { $ne: userId } },
            { $inc: { hp: -finalDamage }, $push: { attacks: { discordId: userId, username: charName, damage: finalDamage } } },
            { new: true }
          );
        }

        // Nếu vẫn không tìm thấy Boss active hoặc Boss đã hết máu
        if (!boss) {
          const deadEmbed = new EmbedBuilder()
            .setTitle('💮 PHÁT ĐOÀN KHUẤT PHỤC 💮')
            .setDescription('Hồn Thần Ma Vương đã bị vây giết hoặc biến mất đột ngột! Mời chư đồng môn đợi Thiên Trận kế tiếp.')
            .setColor('#10B981');
          return interaction.reply({ embeds: [deadEmbed] });
        }

        let isBossDead = false;
        let actualDamage = finalDamage;

        // Xử lý khi Boss chết (HP <= 0)
        if (boss.hp <= 0) {
          isBossDead = true;
          const overDamage = Math.abs(boss.hp);
          actualDamage = finalDamage - overDamage;
          if (actualDamage < 0) actualDamage = 0;

          // Cập nhật trạng thái Boss chết: HP về 0, active = false
          // Đồng thời hiệu chỉnh lại lượng damage thực tế mà đòn đánh cuối gây ra (tránh overdamage hiển thị)
          await Boss.updateOne(
            { bossId: 'world_boss', "attacks.discordId": userId },
            { 
              $set: { hp: 0, active: false, "attacks.$.damage": (boss.attacks.find(a => a.discordId === userId)?.damage || 0) - overDamage }
            }
          );

          // Tải lại tài liệu Boss đã cập nhật chính xác
          const finalBossDoc = await Boss.findOne({ bossId: 'world_boss' });
          if (finalBossDoc) {
            boss = finalBossDoc;
          }
        }

        // Tăng tu vi tích lũy khi đánh Boss cho người chơi
        user.exp += Math.floor(actualDamage * 0.1) + 5;
        const levelUpResult = await checkLevelUp(user, interaction.member as any);
        await user.save();

        // 4. Nếu Boss chết, thực hiện tổng hợp sát thương & Phân bổ Kho Báu
        if (isBossDead) {
          const totalBossDamage = boss.maxHp;
          const coinRewardPool = 8000;
          const expRewardPool = 4000;

          let distributionsText = '';
          const sortedAllAttacks = [...boss.attacks].sort((a, b) => b.damage - a.damage);

          for (let idx = 0; idx < sortedAllAttacks.length; idx++) {
            const atk = sortedAllAttacks[idx];
            const dmgPct = (atk.damage / totalBossDamage);
            
            const finalCoinsEarned = Math.round(coinRewardPool * dmgPct);
            const finalExpEarned = Math.round(expRewardPool * dmgPct);

            const userToReward = await User.findOne({ discordId: atk.discordId });
            if (userToReward) {
              userToReward.balance += finalCoinsEarned;
              userToReward.exp += finalExpEarned;
              
              if (idx === 0) {
                userToReward.title = `🥇 Tiên Sát Thần Ma • ${userToReward.characterName}`;
              }
              await userToReward.save();

              // Đồng bộ vai trò và biệt danh ngay lập tức cho người đứng đầu Sát Thương
              if (idx === 0 && interaction.guild) {
                try {
                  const memberToReward = await interaction.guild.members.fetch(atk.discordId);
                  if (memberToReward) {
                    await updateGuildMemberRole(memberToReward, userToReward.level);
                  }
                } catch (memberErr) {
                  console.warn(`[Boss Reward] Không thể tìm thấy member ${atk.discordId} để đồng bộ danh hiệu.`);
                }
              }
            }

            if (idx < 5) {
              distributionsText += `- **${atk.username}** (%Dmg: **${(dmgPct * 100).toFixed(1)}%**): Thưởng hoàng kim **+${finalCoinsEarned} Xu**, **+${finalExpEarned} XP** \n`;
            }
          }

          const killEmbed = new EmbedBuilder()
            .setTitle('🏆 VĂN KÝ - TIÊN MA KHUẤT PHỤC - KHẤT HOÀN KHO BÁU 🏆')
            .setDescription(`Vạn vạn hào quang phá tung không khí! Bạo vỡ đệ tử dồn dập nện đòn chí mạng trảm hại ác quỷ **${boss.name}** thành từng mảnh!`)
            .setColor('#10B981')
            .addFields(
              { name: '🔥 Đòn Diệt Vong Cuối Cùng', value: `Vết trảm của chư tăng sĩ đã trảm mòn tà niệm Ma Thần dũng liệt.`, inline: false },
              { name: '🏅 Top 5 Chấp Sự Sát Thương Nhất', value: distributionsText || '*Không có đóng góp nào*', inline: false },
              { name: '🎁 Đãi Ngộ Tông Môn', value: `Hệ thống vừa chia thưởng tự động **8,000 Xu** cùng **4,000 XP** trực tiếp vào thiên bảng khố phòng của các đệ tử đóng góp theo đúng tỉ lệ cống hiến!\n**Top 1 Sát Thương** vinh nhận danh vị độc tôn: **🥇 Tiên Sát Thần Ma**`, inline: false }
            )
            .setTimestamp();

          return interaction.reply({ embeds: [killEmbed] });
        }

        // 5. Nếu Boss còn sống, trả dữ liệu nện đòn bình thường cho người chơi xem
        let attackDesc = `Bạn thi triển tuyệt kỹ thần thông chém thẳng vào **${boss.name}**!`;
        if (levelUpResult.leveledUp) {
          attackDesc += `${levelUpResult.msg}`;
        }

        const attackSuccessEmbed = new EmbedBuilder()
          .setTitle('⚔️ MA TRẬN KHAI TRẢM - ĐỆ TỬ XUNG PHONG ⚔️')
          .setDescription(attackDesc)
          .setColor('#EA580C')
          .addFields(
            { name: '💥 Sát Thương Của Bạn', value: `🗡️ **-${actualDamage.toLocaleString()}** HP (Dựa theo lực chiến CP: **${user.combatPower.toLocaleString()}** VC)`, inline: true },
            { name: '❤️ HP Boss Hiện Tại', value: `${getBossHpBar(boss.hp, boss.maxHp)}\n**${boss.hp.toLocaleString()} / ${boss.maxHp.toLocaleString()} HP**`, inline: true },
            { name: '🛡️ Trận Pháp Ban Thưởng', value: `Ghi nhận dũng khí đột kích: Đã tích tụ **+${Math.floor(actualDamage * 0.1) + 5} XP** trực tiếp.`, inline: false }
          )
          .setFooter({ text: 'Gõ /boss info để xem danh sách trảm ma tích lộc.' })
          .setTimestamp();

        return interaction.reply({ embeds: [attackSuccessEmbed] });
      } catch (err) {
        console.error('[Boss Attack Engine] Lỗi nặng xuất hiện:', err);
        return interaction.reply('Pháp khí va đập hỗn loạn, chiêu thức đánh hụt Ma Thần.');
      }
    }
  }
};
