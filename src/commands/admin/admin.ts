import { 
  SlashCommandBuilder, 
  ChatInputCommandInteraction, 
  EmbedBuilder, 
  PermissionFlagsBits 
} from 'discord.js';
import { featureFlagService } from '../../services/FeatureFlagService.js';
import { economyAuditService } from '../../services/EconomyAuditService.js';
import { metricsService } from '../../services/MetricsService.js';
import { healthService } from '../../services/HealthService.js';
import SuspiciousActivity from '../../database/models/SuspiciousActivity.js';
import logger from '../../core/logger.js';

export default {
  cooldown: 3,
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Hệ thống lệnh quản trị thiên cơ tông môn (Chỉ dành cho Admin)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName('flag')
        .setDescription('Cập nhật trạng thái Feature Flag động')
        .addStringOption(opt =>
          opt
            .setName('name')
            .setDescription('Tên tính năng cần điều khiển')
            .setRequired(true)
            .addChoices(
              { name: 'Nhiệm Vụ (quests)', value: 'quests' },
              { name: 'Thành Tựu (achievements)', value: 'achievements' },
              { name: 'Bang Hội (guilds)', value: 'guilds' },
              { name: 'Phó Bản (dungeons)', value: 'dungeons' },
              { name: 'Bang Chiến (guild_wars)', value: 'guild_wars' },
              { name: 'Battle Pass (battle_pass)', value: 'battle_pass' },
              { name: 'Tính Năng AI (ai_features)', value: 'ai_features' }
            )
        )
        .addStringOption(opt =>
          opt
            .setName('status')
            .setDescription('Trạng thái kích hoạt mới')
            .setRequired(true)
            .addChoices(
              { name: 'Kích Hoạt (enabled)', value: 'enabled' },
              { name: 'Vô Hiệu Hóa (disabled)', value: 'disabled' },
              { name: 'Beta Thử Nghiệm (beta)', value: 'beta' },
              { name: 'Gói Trả Phí (premium)', value: 'premium' },
              { name: 'Chỉ Admin (admin-only)', value: 'admin-only' }
            )
        )
        .addStringOption(opt =>
          opt
            .setName('description')
            .setDescription('Mô tả lý do thay đổi trạng thái')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('economy')
        .setDescription('Quản lý và kiểm toán kinh tế tông môn')
        .addStringOption(opt =>
          opt
            .setName('action')
            .setDescription('Chọn thao tác kiểm toán')
            .setRequired(true)
            .addChoices(
              { name: 'Chạy Kiểm Toán (audit)', value: 'audit' },
              { name: 'Chụp Ảnh Nhanh (snapshot)', value: 'snapshot' }
            )
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('metrics')
        .setDescription('Giám sát chỉ số vận hành và tình trạng phần cứng bot')
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ 
        content: '⚠️ **XÂM PHẠM**: Bạn không có quyền hành của một Trưởng Lão Tối Cao (Administrator) để can thiệp vào thiên cơ quản trị!', 
        flags: [64] 
      });
    }

    const subcommand = interaction.options.getSubcommand();

    // =======================================================
    // 1. QUẢN LÝ FEATURE FLAGS (flag)
    // =======================================================
    if (subcommand === 'flag') {
      const name = interaction.options.getString('name')!;
      const status = interaction.options.getString('status')! as any;
      const description = interaction.options.getString('description') || `Cập nhật trạng thái flag sang ${status}`;

      try {
        await featureFlagService.setFlagStatus(name, status, description);

        const embed = new EmbedBuilder()
          .setTitle('⚙️ CẬP NHẬT FEATURE FLAG THÀNH CÔNG ⚙️')
          .setDescription(`Hệ thống thiên cơ đã được điều hướng thay đổi trạng thái tính năng:`)
          .setColor('#10B981')
          .addFields(
            { name: '🔑 Tên Tính Năng', value: `\`${name}\``, inline: true },
            { name: '⚡ Trạng Thái Mới', value: `**${status.toUpperCase()}**`, inline: true },
            { name: '📝 Mô tả / Lý do', value: description, inline: false }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command admin flag] Lỗi:', error);
        return interaction.reply({ content: 'Lỗi thiên trận khi cập nhật Feature Flag.', flags: [64] });
      }
    }

    // =======================================================
    // 2. KIỂM TOÁN TÀI CHÍNH (economy)
    // =======================================================
    if (subcommand === 'economy') {
      const action = interaction.options.getString('action')!;

      if (action === 'snapshot') {
        await interaction.deferReply();
        try {
          const snap = await economyAuditService.takeSnapshot();

          const embed = new EmbedBuilder()
            .setTitle('📊 THIÊN CƠ CHỤP HÌNH TÀI CHÍNH 📊')
            .setDescription(`Bản snapshot tài chính hệ thống số \`${snap.snapshotId}\` đã được lưu vết thành công:`)
            .setColor('#D4AF37')
            .addFields(
              { name: '🪙 Tổng Xu Lưu Thông', value: `🪙 **${snap.totalCirculation.toLocaleString()} Xu**`, inline: true },
              { name: '🟢 Tổng Tiền Sinh Ra (Mint)', value: `🪙 **${snap.totalMinted.toLocaleString()} Xu**`, inline: true },
              { name: '🔴 Tổng Tiền Bị Hủy (Burn)', value: `🪙 **${snap.totalBurned.toLocaleString()} Xu**`, inline: true },
              { name: '📈 Tỷ Lệ Lạm Phát', value: `**${snap.inflationRate.toFixed(2)}%**`, inline: true },
              { name: '⚖️ Hệ số Gini Bất Bình Đẳng', value: `**${snap.wealthGini.toFixed(3)}** (0: Bình đẳng, 1: Khoảng cách lớn)`, inline: true },
              { name: '⚡ Tốc Độ Lưu Thông Coin (24h)', value: `**${snap.coinVelocity.toFixed(4)}**`, inline: true },
              { name: '💎 Tỉ Trọng Tài Sản Top 1% Giàu', value: `**${snap.top1PercentShare.toFixed(2)}%** tài sản hệ thống`, inline: false },
              { name: '👑 Tỉ Trọng Tài Sản Top 10% Giàu', value: `**${snap.top10PercentShare.toFixed(2)}%** tài sản hệ thống`, inline: false }
            )
            .setTimestamp();

          return interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('[Command admin economy snapshot] Lỗi:', error);
          return interaction.editReply('Lỗi pháp trận khi thực thi chụp hình tài chính.');
        }
      }

      if (action === 'audit') {
        await interaction.deferReply();
        try {
          // Thực hiện một snapshot nhanh
          const snap = await economyAuditService.takeSnapshot();
          
          // Lấy danh sách SuspiciousActivity mới nhất
          const suspects = await SuspiciousActivity.find({}).sort({ createdAt: -1 }).limit(5);

          const embed = new EmbedBuilder()
            .setTitle('🛡️ BẢN BÁO CÁO KIỂM TOÁN TÀI CHÍNH TOÀN DIỆN 🛡️')
            .setDescription(`Chỉ số kinh tế tổng hợp mới nhất từ Thiên cơ kiểm toán:`)
            .setColor('#1E3A8A')
            .addFields(
              { name: '🪙 Tổng Xu Lưu Thông', value: `🪙 **${snap.totalCirculation.toLocaleString()} Xu**`, inline: true },
              { name: '⚖️ Hệ số Gini Tài Sản', value: `**${snap.wealthGini.toFixed(3)}**`, inline: true },
              { name: '📈 Tốc Độ Vận Hành Tiền (Velocity)', value: `**${snap.coinVelocity.toFixed(4)}**`, inline: true }
            );

          let suspectText = '';
          if (suspects.length === 0) {
            suspectText = '*Không phát hiện nghi vấn gian lận nào trong tông môn.*';
          } else {
            suspectText = suspects.map((s, i) => {
              const types = {
                abnormal_wealth_growth: '⚠️ Tăng Trưởng Tài Sản Bất Thường',
                circular_transfer: '🔄 Chuyển Tiền Vòng Tròn (Macro)',
                multi_account_link: '👥 Spam Tài Khoản Phụ (Clone)'
              };
              return `**${i+1}. ${types[s.type as keyof typeof types]}**\n↳ Người nghi vấn: <@${s.userId}>\n↳ Chi tiết: *${s.details?.msg || 'Nghi ngờ gian lận'}*\n↳ Thời gian: ${s.createdAt.toLocaleString()}\n`;
            }).join('\n');
          }

          embed.addFields({ name: '🚨 DANH SÁCH NGHI VẤN GIAN LẬN GẦN ĐÂY', value: suspectText, inline: false });
          embed.setTimestamp();

          return interaction.editReply({ embeds: [embed] });
        } catch (error) {
          logger.error('[Command admin economy audit] Lỗi:', error);
          return interaction.editReply('Lỗi pháp trận khi chạy kiểm toán dòng tiền.');
        }
      }
    }

    // =======================================================
    // 3. THEO DÕI HỆ THỐNG & ĐO LƯỜNG (metrics)
    // =======================================================
    if (subcommand === 'metrics') {
      await interaction.deferReply();
      try {
        const metrics = await metricsService.getMetrics();
        const health = await healthService.checkHealth();

        const statusMap = {
          ok: '🟢 Tốt Đẹp (OK)',
          degraded: '🟡 Giảm Hiệu Năng (Degraded)',
          error: '🔴 LỖI NGUYÊN KHÍ (ERROR)'
        };

        const embed = new EmbedBuilder()
          .setTitle('⚙️ THIÊN BẢN GIÁM SÁT VẬN HÀNH & NGUYÊN KHÍ BOT ⚙️')
          .setColor(health.status === 'ok' ? '#10B981' : health.status === 'degraded' ? '#FFCC00' : '#FF3333')
          .addFields(
            { name: '🤖 Trạng Thái Nguyên Khí', value: statusMap[health.status], inline: true },
            { name: '⏳ Uptime Hệ Thống', value: `⏱️ **${(health.uptime / 3600).toFixed(2)} giờ**`, inline: true },
            { name: '💾 Tải Bộ Nhớ (RAM Sys)', value: `📟 **${health.memory.usagePercentage}** (${health.memory.free} / ${health.memory.total})`, inline: false },
            { name: '🖥️ RAM Tiến Trình Node.js', value: `↳ Heap: **${health.processMemory.heapUsed}** / **${health.processMemory.heapTotal}**\n↳ RSS: **${health.processMemory.rss}**`, inline: false },
            { name: '🍃 Trạng thái Database', value: `📁 MongoDB: **${health.db.mongo.toUpperCase()}**\n⚡ Redis Core: **${health.db.redis.toUpperCase()}**`, inline: false },
            { name: '👥 Tiên Nhân Hoạt Động', value: `⚡ **DAU:** **${metrics.activeUsers.dau}** | **WAU:** **${metrics.activeUsers.wau}** | **MAU:** **${metrics.activeUsers.mau}**`, inline: false },
            { name: '📈 Thống Kê Tổng Hợp', value: `🌾 Đệ tử ghi danh: **${metrics.totals.registeredUsers}**\n🏰 Tông môn hưng thịnh: **${metrics.totals.guilds}**\n📜 Nhiệm vụ hoàn thành: **${metrics.totals.questsCompleted}**\n🏆 Thành tựu mở khóa: **${metrics.totals.achievementsUnlocked}**`, inline: false },
            { name: '📊 Hiệu Suất Hoạt Động', value: `🎯 Hoàn thành Nhiệm Vụ: **${metrics.rates.questCompletionRate}**\n👑 Tỉ lệ Mở Thành Tựu: **${metrics.rates.achievementUnlockRate}**\n🏰 Lập bang mới (7 ngày): **${metrics.rates.guildCreationRate7d} bang**`, inline: false }
          )
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      } catch (error) {
        logger.error('[Command admin metrics] Lỗi:', error);
        return interaction.editReply('Lỗi pháp trận khi kết nối bảng giám sát vận hành.');
      }
    }
  }
};
