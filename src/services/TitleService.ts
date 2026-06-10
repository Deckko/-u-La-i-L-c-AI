import { titleRepository } from '../repositories/TitleRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { eventBus } from '../core/EventBus.js';
import logger from '../core/logger.js';

export class TitleService {
  /**
   * Mở khóa danh hiệu cho người chơi
   */
  async unlockTitle(userId: string, guildId: string, titleId: string): Promise<boolean> {
    try {
      const titleDef = await titleRepository.getById(titleId);
      if (!titleDef) {
        logger.warn(`[TitleService] Cố gắng mở khóa danh hiệu không tồn tại: ${titleId}`);
        return false;
      }

      const unlocked = await titleRepository.unlockTitle(userId, titleId);
      if (!unlocked) return false;

      // Đồng bộ hóa mảng titlesOwned trong hồ sơ người dùng
      const user = await userRepository.getByDiscordId(userId);
      if (user) {
        if (!user.titlesOwned.includes(titleDef.name)) {
          user.titlesOwned.push(titleDef.name);
          await user.save();
        }
      }

      // Phát sự kiện mở khóa danh hiệu
      eventBus.emitEvent('title_unlocked', {
        userId,
        guildId,
        titleId,
        titleName: titleDef.name
      });

      logger.info(`[TitleService] Người chơi ${userId} đã mở khóa danh hiệu: ${titleDef.name}`);
      return true;
    } catch (error) {
      logger.error(`[TitleService] Lỗi khi mở khóa danh hiệu ${titleId} cho user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Trang bị danh hiệu cho người chơi
   */
  async equipTitle(userId: string, titleId: string): Promise<{ success: boolean; titleName?: string; error?: string }> {
    try {
      const titleDef = await titleRepository.getById(titleId);
      if (!titleDef) {
        return { success: false, error: 'Danh hiệu không tồn tại trong hệ thống tông môn.' };
      }

      const success = await titleRepository.equipTitle(userId, titleId);
      if (!success) {
        return { success: false, error: 'Đồng đạo chưa mở khóa danh hiệu này!' };
      }

      // Đồng bộ hóa trường title trong hồ sơ người dùng
      const user = await userRepository.getByDiscordId(userId);
      if (user) {
        user.title = titleDef.name;
        // Đảm bảo có trong mảng sở hữu
        if (!user.titlesOwned.includes(titleDef.name)) {
          user.titlesOwned.push(titleDef.name);
        }
        await user.save();
      }

      logger.info(`[TitleService] Người chơi ${userId} đã trang bị danh hiệu: ${titleDef.name}`);
      return { success: true, titleName: titleDef.name };
    } catch (error) {
      logger.error(`[TitleService] Lỗi khi trang bị danh hiệu ${titleId} cho user ${userId}:`, error);
      return { success: false, error: 'Lỗi thiên pháp khi trang bị danh hiệu.' };
    }
  }

  /**
   * Lấy danh sách danh hiệu của người chơi để hiển thị
   */
  async getPlayerTitlesList(userId: string): Promise<Array<{ titleId: string; name: string; description: string; rarity: string; unlocked: boolean; equipped: boolean }>> {
    try {
      const allTitles = await titleRepository.getAllTitles();
      const unlockedDocs = await titleRepository.getUnlockedTitles(userId);

      const unlockedSet = new Set(unlockedDocs.map(d => d.titleId));
      const equippedDoc = unlockedDocs.find(d => d.isEquipped);

      return allTitles.map(t => ({
        titleId: t.titleId,
        name: t.name,
        description: t.description,
        rarity: t.rarity,
        unlocked: unlockedSet.has(t.titleId),
        equipped: equippedDoc ? equippedDoc.titleId === t.titleId : false
      }));
    } catch (error) {
      logger.error(`[TitleService] Lỗi khi lấy danh sách danh hiệu hiển thị của user ${userId}:`, error);
      throw error;
    }
  }
}

export const titleService = new TitleService();
