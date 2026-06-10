import { gameConfigRepository } from '../repositories/GameConfigRepository.js';
import logger from '../core/logger.js';

export class GameConfigService {
  private cache: Map<string, any> = new Map();

  /**
   * Lấy giá trị cấu hình theo key, hỗ trợ cache in-memory
   */
  async getConfig<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (this.cache.has(key)) {
        return this.cache.get(key) as T;
      }

      const configDoc = await gameConfigRepository.getByKey(key);
      if (configDoc) {
        this.cache.set(key, configDoc.value);
        return configDoc.value as T;
      }

      // Lưu giá trị mặc định vào DB nếu chưa tồn tại
      logger.warn(`[GameConfigService] Không tìm thấy config cho key: ${key}. Đang lưu giá trị mặc định.`);
      await gameConfigRepository.upsertConfig(key, defaultValue, `Tự động tạo giá trị mặc định cho ${key}`);
      this.cache.set(key, defaultValue);
      return defaultValue;
    } catch (error) {
      logger.error(`[GameConfigService] Lỗi khi lấy cấu hình ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Cập nhật cấu hình
   */
  async setConfig(key: string, value: any, description: string = ''): Promise<void> {
    try {
      await gameConfigRepository.upsertConfig(key, value, description);
      this.cache.set(key, value);
    } catch (error) {
      logger.error(`[GameConfigService] Lỗi khi cập nhật cấu hình ${key}:`, error);
      throw error;
    }
  }

  /**
   * Xóa toàn bộ bộ nhớ đệm (dùng khi Admin thay đổi config trực tiếp trong DB)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('[GameConfigService] Đã làm sạch cache cấu hình game.');
  }
}

export const gameConfigService = new GameConfigService();
