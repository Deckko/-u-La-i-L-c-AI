import FeatureFlag from '../database/models/FeatureFlag.js';
import GuildConfig from '../database/models/GuildConfig.js';
import logger from '../core/logger.js';

export class FeatureFlagService {
  /**
   * Kiểm tra xem một tính năng có đang được kích hoạt hay không dựa trên cấu hình Flag và trạng thái Guild/User
   * @param flagName Tên tính năng (VD: dungeons, guild_wars, battle_pass, ai_features)
   * @param userId ID người dùng Discord
   * @param guildId ID Server Discord
   * @param isAdmin Quyền quản trị của người dùng
   */
  async isFeatureEnabled(
    flagName: string,
    userId: string,
    guildId: string,
    isAdmin: boolean = false
  ): Promise<{ enabled: boolean; reason?: string }> {
    try {
      // 1. Tìm cấu hình flag toàn cục
      const flag = await FeatureFlag.findOne({ flagName });
      if (!flag) {
        // Mặc định cho phép hoạt động nếu chưa được cấu hình
        return { enabled: true };
      }

      const status = flag.status;

      // 2. Định tuyến kiểm tra theo trạng thái Flag
      if (status === 'disabled') {
        return { enabled: false, reason: 'Tính năng này hiện đang bị Trưởng Lão đóng lại để bảo trì.' };
      }

      if (status === 'enabled') {
        return { enabled: true };
      }

      if (status === 'admin-only') {
        if (isAdmin) {
          return { enabled: true };
        }
        return { enabled: false, reason: 'Tính năng này hiện chỉ dành riêng cho Ban Quản Trị tông môn.' };
      }

      // 3. Kiểm tra tính năng Premium
      if (status === 'premium') {
        const guildCfg = await GuildConfig.findOne({ guildId });
        if (guildCfg && guildCfg.premiumStatus === 'premium') {
          return { enabled: true };
        }
        return { enabled: false, reason: 'Tính năng này chỉ khả dụng cho các Server đã mở khóa gói Premium.' };
      }

      // 4. Kiểm tra tính năng Beta
      if (status === 'beta') {
        // Cho phép admin hoặc server premium test trước
        const guildCfg = await GuildConfig.findOne({ guildId });
        const hasBetaAccess = isAdmin || (guildCfg && guildCfg.premiumStatus === 'premium');
        if (hasBetaAccess) {
          return { enabled: true };
        }
        return { enabled: false, reason: 'Tính năng này hiện đang trong giai đoạn thử nghiệm (Beta Testing).' };
      }

      return { enabled: true };
    } catch (error) {
      logger.error(`[FeatureFlagService] Lỗi khi kiểm tra tính năng ${flagName}:`, error);
      return { enabled: true }; // Cho phép chạy để tránh lỗi treo bot khi DB nghẽn
    }
  }

  /**
   * Cập nhật trạng thái của Feature Flag
   */
  async setFlagStatus(
    flagName: string,
    status: 'enabled' | 'disabled' | 'beta' | 'premium' | 'admin-only',
    description: string = ''
  ): Promise<void> {
    try {
      await FeatureFlag.findOneAndUpdate(
        { flagName },
        { $set: { status, description } },
        { upsert: true, new: true }
      );
      logger.info(`[FeatureFlagService] Đã cập nhật trạng thái của flag ${flagName} thành ${status}`);
    } catch (error) {
      logger.error(`[FeatureFlagService] Lỗi khi cập nhật flag ${flagName}:`, error);
      throw error;
    }
  }
}

export const featureFlagService = new FeatureFlagService();
