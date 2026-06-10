import { userRepository } from '../repositories/UserRepository.js';
import logger from '../core/logger.js';

export class EconomyService {
  /**
   * Kiểm tra cooldown của người chơi cho các hoạt động cày cuốc
   */
  checkCooldown(lastTime: Date | null, cooldownMinutes: number): { isCooldown: boolean; timeLeftSeconds: number } {
    if (!lastTime) {
      return { isCooldown: false, timeLeftSeconds: 0 };
    }

    const now = Date.now();
    const lastTimeMs = new Date(lastTime).getTime();
    const cooldownMs = cooldownMinutes * 60 * 1000;

    if (now - lastTimeMs < cooldownMs) {
      const timeLeftSeconds = Math.ceil((cooldownMs - (now - lastTimeMs)) / 1000);
      return { isCooldown: true, timeLeftSeconds };
    }

    return { isCooldown: false, timeLeftSeconds: 0 };
  }

  /**
   * Chuyển tiền Đấu Xu giữa hai người chơi, có khấu trừ thuế giao dịch chống lạm phát
   */
  async processTransfer(
    senderId: string,
    receiverId: string,
    amount: number,
    taxRate: number = 0.05
  ): Promise<{ success: boolean; taxDeducted: number; senderNewBalance: number; receiverNewBalance: number; error?: string }> {
    try {
      if (amount <= 0) {
        return { success: false, taxDeducted: 0, senderNewBalance: 0, receiverNewBalance: 0, error: 'Số tiền chuyển khoản phải lớn hơn 0' };
      }

      const sender = await userRepository.getByDiscordId(senderId);
      const receiver = await userRepository.getByDiscordId(receiverId);

      if (!sender || !sender.registered) {
        return { success: false, taxDeducted: 0, senderNewBalance: 0, receiverNewBalance: 0, error: 'Người chuyển tiền chưa đăng ký tài khoản' };
      }

      if (!receiver || !receiver.registered) {
        return { success: false, taxDeducted: 0, senderNewBalance: 0, receiverNewBalance: 0, error: 'Người nhận tiền chưa đăng ký tài khoản' };
      }

      if (sender.balance < amount) {
        return { success: false, taxDeducted: 0, senderNewBalance: 0, receiverNewBalance: 0, error: 'Số dư khố phòng của bạn không đủ' };
      }

      const taxDeducted = Math.floor(amount * taxRate);
      const amountReceived = amount - taxDeducted;

      // Cập nhật số dư người gửi
      sender.balance -= amount;
      await sender.save();

      // Cập nhật số dư người nhận
      receiver.balance += amountReceived;
      await receiver.save();

      logger.info(
        `[EconomyService] Giao dịch thành công: ${sender.username} -> ${receiver.username} | Số tiền: ${amount} Xu | Thuế 5%: ${taxDeducted} Xu`
      );

      return {
        success: true,
        taxDeducted,
        senderNewBalance: sender.balance,
        receiverNewBalance: receiver.balance
      };
    } catch (error) {
      logger.error(`[EconomyService] Lỗi khi chuyển Đấu Xu từ ${senderId} sang ${receiverId}:`, error);
      return { success: false, taxDeducted: 0, senderNewBalance: 0, receiverNewBalance: 0, error: 'Lỗi thiên thạch khi xử lý giao dịch' };
    }
  }

  /**
   * Xử lý giao dịch cá cược / cờ bạc của người chơi
   */
  async processBet(
    userId: string,
    amount: number,
    isWin: boolean,
    multiplier: number
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      const user = await userRepository.getByDiscordId(userId);
      if (!user || !user.registered) {
        return { success: false, newBalance: 0, error: 'Đồng đạo chưa đăng ký tài khoản' };
      }

      if (user.balance < amount) {
        return { success: false, newBalance: 0, error: 'Số dư khố phòng của bạn không đủ cược' };
      }

      if (isWin) {
        const winReward = Math.floor(amount * multiplier);
        user.balance += (winReward - amount); // Cộng phần chênh lệch dương
      } else {
        user.balance -= amount;
      }

      await user.save();
      logger.info(`[EconomyService] Cược ${amount} Xu | Kết quả: ${isWin ? 'THẮNG' : 'THUA'} | Số dư mới: ${user.balance} Xu`);

      return { success: true, newBalance: user.balance };
    } catch (error) {
      logger.error(`[EconomyService] Lỗi khi xử lý cược cho user ${userId}:`, error);
      return { success: false, newBalance: 0, error: 'Lỗi hệ thống khi thanh toán cược' };
    }
  }
}

export const economyService = new EconomyService();
