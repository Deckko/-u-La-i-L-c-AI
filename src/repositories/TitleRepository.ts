import Title, { ITitle } from '../database/models/Title.js';
import UserTitle, { IUserTitle } from '../database/models/UserTitle.js';
import logger from '../core/logger.js';

export class TitleRepository {
  /**
   * Lấy danh hiệu theo ID
   */
  async getById(titleId: string): Promise<ITitle | null> {
    try {
      return await Title.findOne({ titleId });
    } catch (error) {
      logger.error(`[TitleRepository] Lỗi khi lấy danh hiệu ${titleId}:`, error);
      throw error;
    }
  }

  /**
   * Khởi tạo hoặc cập nhật định nghĩa danh hiệu
   */
  async upsertTitle(titleId: string, name: string, description: string, rarity: 'normal' | 'rare' | 'epic' | 'legendary'): Promise<ITitle> {
    try {
      return await Title.findOneAndUpdate(
        { titleId },
        { $set: { name, description, rarity } },
        { upsert: true, new: true }
      );
    } catch (error) {
      logger.error(`[TitleRepository] Lỗi khi upsert danh hiệu ${titleId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy tất cả định nghĩa danh hiệu trong game
   */
  async getAllTitles(): Promise<ITitle[]> {
    try {
      return await Title.find({});
    } catch (error) {
      logger.error('[TitleRepository] Lỗi khi lấy tất cả danh hiệu:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách danh hiệu đã mở khóa của người chơi
   */
  async getUnlockedTitles(userId: string): Promise<IUserTitle[]> {
    try {
      return await UserTitle.find({ userId });
    } catch (error) {
      logger.error(`[TitleRepository] Lỗi khi lấy danh sách danh hiệu của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mở khóa danh hiệu cho người chơi
   */
  async unlockTitle(userId: string, titleId: string): Promise<IUserTitle | null> {
    try {
      const existing = await UserTitle.findOne({ userId, titleId });
      if (existing) return existing;

      const newUnlock = new UserTitle({ userId, titleId });
      return await newUnlock.save();
    } catch (error) {
      logger.error(`[TitleRepository] Lỗi khi mở khóa danh hiệu ${titleId} cho user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh hiệu đang trang bị của người chơi
   */
  async getEquippedTitle(userId: string): Promise<IUserTitle | null> {
    try {
      return await UserTitle.findOne({ userId, isEquipped: true });
    } catch (error) {
      logger.error(`[TitleRepository] Lỗi khi lấy danh hiệu đang trang bị của user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Trang bị danh hiệu cho người chơi
   */
  async equipTitle(userId: string, titleId: string): Promise<boolean> {
    try {
      // Xác nhận người chơi thực sự sở hữu danh hiệu này
      const owns = await UserTitle.findOne({ userId, titleId });
      if (!owns) return false;

      // Hủy trang bị tất cả danh hiệu khác
      await UserTitle.updateMany({ userId }, { $set: { isEquipped: false } });

      // Trang bị danh hiệu này
      owns.isEquipped = true;
      await owns.save();
      return true;
    } catch (error) {
      logger.error(`[TitleRepository] Lỗi khi trang bị danh hiệu ${titleId} cho user ${userId}:`, error);
      throw error;
    }
  }
}

export const titleRepository = new TitleRepository();
