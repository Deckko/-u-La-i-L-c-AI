import User, { IUser } from '../database/models/User.js';
import logger from '../core/logger.js';

export class UserRepository {
  /**
   * Tìm người chơi theo Discord ID
   */
  async getByDiscordId(discordId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ discordId });
    } catch (error) {
      logger.error(`[UserRepository] Lỗi khi lấy thông tin người chơi ${discordId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin người chơi, nếu chưa có thì tạo mới
   */
  async getOrCreate(discordId: string, username: string): Promise<IUser> {
    try {
      let user = await User.findOne({ discordId });
      if (!user) {
        user = new User({
          discordId,
          username,
          balance: 100 // Tặng 100 Đấu Xu ban đầu
        });
        await user.save();
        logger.info(`[UserRepository] Đã khởi tạo hồ sơ nhân vật mới cho user: ${username} (${discordId})`);
      }
      return user;
    } catch (error) {
      logger.error(`[UserRepository] Lỗi getOrCreate cho user ${discordId}:`, error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin người chơi bằng atomic operation
   */
  async update(discordId: string, updates: Partial<IUser>): Promise<IUser | null> {
    try {
      return await User.findOneAndUpdate(
        { discordId },
        { $set: updates },
        { new: true }
      );
    } catch (error) {
      logger.error(`[UserRepository] Lỗi khi cập nhật thông tin cho user ${discordId}:`, error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository();
