import EconomyStats, { IEconomyStats } from '../database/models/EconomyStats.js';
import EconomySnapshot, { IEconomySnapshot } from '../database/models/EconomySnapshot.js';
import SuspiciousActivity from '../database/models/SuspiciousActivity.js';
import User from '../database/models/User.js';
import Guild from '../database/models/Guild.js';
import EventLog from '../database/models/EventLog.js';
import { gameConfigService } from './GameConfigService.js';
import { eventBus } from '../core/EventBus.js';
import logger from '../core/logger.js';
import crypto from 'crypto';

export class EconomyAuditService {
  /**
   * Khởi chạy listeners kiểm toán dòng tiền
   */
  init(): void {
    logger.info('[EconomyAuditService] Đang khởi tạo Event Listeners cho bộ kiểm toán kinh tế...');

    // Lắng nghe các sự kiện sinh tiền (Mint)
    eventBus.onEvent('player_mined', async (data) => {
      await this.recordMint(data.coinsEarned);
    });

    eventBus.onEvent('player_fished', async (data) => {
      await this.recordMint(data.coinsEarned);
    });

    eventBus.onEvent('player_worked', async (data) => {
      await this.recordMint(data.coinsEarned);
    });

    // Lắng nghe các sự kiện triệt tiêu tiền (Burn)
    eventBus.onEvent('coins_spent', async (data) => {
      // Coinfip thua hay mua đồ shop là tiêu hao tiền tệ
      await this.recordBurn(data.amount);
    });
  }

  /**
   * Ghi nhận Đấu Xu được sinh ra (Mint)
   */
  async recordMint(amount: number): Promise<void> {
    if (amount <= 0) return;
    try {
      await EconomyStats.findOneAndUpdate(
        {},
        { $inc: { totalMinted: amount } },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error('[EconomyAuditService] Lỗi khi ghi nhận Mint:', error);
    }
  }

  /**
   * Ghi nhận Đấu Xu bị đốt cháy (Burn)
   */
  async recordBurn(amount: number): Promise<void> {
    if (amount <= 0) return;
    try {
      await EconomyStats.findOneAndUpdate(
        {},
        { $inc: { totalBurned: amount } },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error('[EconomyAuditService] Lỗi khi ghi nhận Burn:', error);
    }
  }

  /**
   * Phân tích và phát hiện giao dịch đáng ngờ
   */
  async analyzeTransfer(senderId: string, receiverId: string, amount: number): Promise<void> {
    try {
      // 1. Kiểm tra tăng trưởng tài sản bất thường (Abnormal Wealth Growth)
      const threshold = await gameConfigService.getConfig<number>('suspicious_growth_threshold', 100000);
      if (amount >= threshold) {
        await this.logSuspicious(
          receiverId,
          'abnormal_wealth_growth',
          { amount, senderId, msg: `Nhận lượng tiền lớn từ ${senderId} vượt ngưỡng cảnh báo.` }
        );
      }

      // 2. Kiểm tra spam tài khoản phụ (Multi-account Link)
      const sender = await User.findOne({ discordId: senderId });
      if (sender) {
        const oneHour = 60 * 60 * 1000;
        const isNewAccount = (Date.now() - sender.createdAt.getTime()) < oneHour;
        if (isNewAccount && sender.balance < 50) {
          // Tài khoản mới tạo chuyển hết tiền đi
          await this.logSuspicious(
            senderId,
            'multi_account_link',
            { receiverId, amount, msg: 'Tài khoản mới đăng ký chuyển toàn bộ tiền khởi hành sang tài khoản khác.' }
          );
        }
      }

      // 3. Kiểm tra chuyển tiền xoay vòng (A -> B -> C -> A) trong 1 giờ
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Tìm các giao dịch chuyển khoản gần đây của receiver (người nhận)
      // Giả sử có log chuyển khoản EventLog
      const recentTransfers = await EventLog.find({
        eventType: 'GuildDonate', // Hoặc loại chuyển khoản, ở đây ta dùng EventLog làm cơ sở dữ liệu trace
        createdAt: { $gte: oneHourAgo }
      });

      // Kiểm tra xem receiverId có chuyển tiền cho ai mà người đó cuối cùng chuyển lại cho senderId hay không
      // Để đơn giản và tối ưu hiệu năng, chúng ta lưu vết cơ bản:
      // Tìm xem có giao dịch receiverId chuyển tiền cho senderId trực tiếp trong 1h qua không (Vòng tròn 2 người)
      const directLoop = recentTransfers.some(log => 
        log.userId === receiverId && log.payload?.receiverId === senderId
      );

      if (directLoop) {
        await this.logSuspicious(
          senderId,
          'circular_transfer',
          { targetId: receiverId, amount, msg: 'Phát hiện luồng tiền chuyển khoản xoay vòng khép kín giữa 2 thực thể.' }
        );
      }
    } catch (error) {
      logger.error('[EconomyAuditService] Lỗi khi phân tích giao dịch:', error);
    }
  }

  /**
   * Lưu vết hoạt động nghi vấn vào DB
   */
  private async logSuspicious(userId: string, type: SuspiciousType, details: Record<string, any>): Promise<void> {
    try {
      const activityId = crypto.randomUUID();
      const newSuspicious = new SuspiciousActivity({
        activityId,
        userId,
        type,
        details
      });
      await newSuspicious.save();
      logger.warn(`[EconomyAuditService] CẢNH BÁO GIAN LẬN: Khởi tạo hồ sơ nghi vấn ${type} cho user ${userId}`);
    } catch (error) {
      logger.error('[EconomyAuditService] Lỗi khi lưu hoạt động nghi vấn:', error);
    }
  }

  /**
   * Chụp ảnh nhanh tài chính toàn hệ thống (Economy Snapshot)
   */
  async takeSnapshot(): Promise<IEconomySnapshot> {
    try {
      // 1. Lấy tổng cung Minted / Burned
      let stats = await EconomyStats.findOne({});
      if (!stats) {
        stats = new EconomyStats({ totalMinted: 0, totalBurned: 0 });
        await stats.save();
      }

      // 2. Tính toán tổng xu lưu thông
      const users = await User.find({ registered: true }).sort({ balance: -1 });
      const totalUserBalance = users.reduce((sum, u) => sum + u.balance, 0);

      const guilds = await Guild.find({});
      const totalGuildTreasury = guilds.reduce((sum, g) => sum + g.treasuryCoins, 0);

      const totalCirculation = totalUserBalance + totalGuildTreasury;

      // 3. Phân bổ tài sản phần trăm
      const totalUsers = users.length;
      let top1PercentShare = 0;
      let top10PercentShare = 0;
      let top100Wealth = 0;

      if (totalUsers > 0) {
        const top1Count = Math.max(1, Math.floor(totalUsers * 0.01));
        const top10Count = Math.max(1, Math.floor(totalUsers * 0.1));
        const top100Count = Math.min(totalUsers, 100);

        const top1Wealth = users.slice(0, top1Count).reduce((sum, u) => sum + u.balance, 0);
        const top10Wealth = users.slice(0, top10Count).reduce((sum, u) => sum + u.balance, 0);
        top100Wealth = users.slice(0, top100Count).reduce((sum, u) => sum + u.balance, 0);

        top1PercentShare = totalCirculation > 0 ? (top1Wealth / totalCirculation) * 100 : 0;
        top10PercentShare = totalCirculation > 0 ? (top10Wealth / totalCirculation) * 100 : 0;
      }

      // 4. Tính toán hệ số Gini (Wealth inequality)
      // Gini = (sum|xi - xj|) / (2 * n^2 * mean)
      let wealthGini = 0;
      if (totalUsers > 1 && totalUserBalance > 0) {
        const mean = totalUserBalance / totalUsers;
        let absoluteDiffSum = 0;

        // Tối ưu hóa tính Gini bằng mảng đã sort balance để giảm O(N^2) xuống O(N log N) hoặc O(N)
        // Gini = (2/N) * (sum(i * xi) / sum(xi)) - (N + 1)/N
        let weightedSum = 0;
        for (let i = 0; i < totalUsers; i++) {
          // i từ 0 đến N-1. Ở đây users đã sort DESC, nên ta đảo index để tăng dần
          const balance = users[i].balance;
          const rank = totalUsers - i; // 1 là nghèo nhất, N là giàu nhất
          weightedSum += rank * balance;
        }
        wealthGini = (2 / totalUsers) * (weightedSum / totalUserBalance) - (totalUsers + 1) / totalUsers;
      }

      // 5. Tính toán Coin Velocity (Tốc độ xoay vòng tiền tệ trong 24 giờ qua)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const spentEvents = await EventLog.find({
        eventType: 'GuildDonate', // Hoặc bất cứ sự kiện nào tiêu xu
        createdAt: { $gte: oneDayAgo }
      });
      const totalSpentLast24h = spentEvents.reduce((sum, log) => sum + (log.payload?.amount || 0), 0);
      const coinVelocity = totalCirculation > 0 ? totalSpentLast24h / totalCirculation : 0;

      // 6. Tính toán tỷ lệ lạm phát (so sánh với Snapshot liền kề)
      let inflationRate = 0;
      const lastSnapshot = await EconomySnapshot.findOne({}).sort({ createdAt: -1 });
      if (lastSnapshot && lastSnapshot.totalCirculation > 0) {
        inflationRate = ((totalCirculation - lastSnapshot.totalCirculation) / lastSnapshot.totalCirculation) * 100;
      }

      // 7. Tạo Snapshot mới
      const snapshotId = `SNAP_${Date.now()}`;
      const newSnapshot = new EconomySnapshot({
        snapshotId,
        totalMinted: stats.totalMinted,
        totalBurned: stats.totalBurned,
        totalCirculation,
        top1PercentShare,
        top10PercentShare,
        top100Wealth,
        inflationRate,
        wealthGini,
        coinVelocity
      });

      await newSnapshot.save();
      logger.info(`[EconomyAuditService] Đã chụp thành công bản snapshot tài chính: ${snapshotId} (Lưu thông: 🪙 ${totalCirculation} Xu)`);
      return newSnapshot;
    } catch (error) {
      logger.error('[EconomyAuditService] Lỗi khi thực hiện snapshot tài chính:', error);
      throw error;
    }
  }
}

export const economyAuditService = new EconomyAuditService();
export type SuspiciousType = 'abnormal_wealth_growth' | 'circular_transfer' | 'multi_account_link';
