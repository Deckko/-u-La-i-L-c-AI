import ItemEffect, { IItemEffect, EffectType } from '../database/models/ItemEffect.js';
import UserEffect, { IUserEffect, EffectSourceType } from '../database/models/UserEffect.js';
import logger from '../core/logger.js';

export class EffectEngine {
  /**
   * Áp dụng một hiệu ứng lên người chơi
   */
  async applyEffect(
    userId: string,
    effectId: string,
    sourceType: EffectSourceType,
    sourceId: string,
    customDurationSeconds?: number
  ): Promise<IUserEffect | null> {
    try {
      const effectDef = await ItemEffect.findOne({ effectId });
      if (!effectDef) {
        logger.error(`[EffectEngine] Không tìm thấy định nghĩa hiệu ứng: ${effectId}`);
        return null;
      }

      // Xác định thời gian hết hạn
      let expiresAt: Date | null = null;
      const duration = customDurationSeconds !== undefined ? customDurationSeconds : effectDef.duration;
      if (duration > 0) {
        expiresAt = new Date(Date.now() + duration * 1000);
      }

      // Lưu hoặc cập nhật bản ghi UserEffect
      const userEffect = await UserEffect.findOneAndUpdate(
        { userId, effectId, sourceId },
        { $set: { expiresAt, sourceType } },
        { upsert: true, new: true }
      );

      logger.info(`[EffectEngine] Đã áp dụng hiệu ứng ${effectId} từ nguồn ${sourceType}:${sourceId} cho user ${userId} (Hết hạn: ${expiresAt ? expiresAt.toISOString() : 'Vĩnh viễn'})`);
      return userEffect;
    } catch (error) {
      logger.error(`[EffectEngine] Lỗi khi áp dụng hiệu ứng ${effectId} cho user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Gỡ bỏ một hiệu ứng cụ thể khỏi người chơi
   */
  async removeEffect(userId: string, effectId: string, sourceId: string): Promise<boolean> {
    try {
      const res = await UserEffect.deleteOne({ userId, effectId, sourceId });
      logger.info(`[EffectEngine] Đã gỡ bỏ hiệu ứng ${effectId} từ nguồn ${sourceId} của user ${userId}`);
      return res.deletedCount > 0;
    } catch (error) {
      logger.error(`[EffectEngine] Lỗi khi gỡ bỏ hiệu ứng ${effectId} của user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Tính toán tổng hệ số cộng thêm (Boost Multiplier) cho một loại chỉ số
   * Ví dụ: Tính toán tổng % XP cộng thêm. Kết quả trả về 0.15 tương đương +15%
   */
  async calculateBoost(userId: string, effectType: EffectType): Promise<number> {
    try {
      const now = new Date();

      // 1. Lấy tất cả hiệu ứng đang hoạt động của người chơi (hoặc chưa hết hạn)
      const userEffects = await UserEffect.find({
        userId,
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: now } }
        ]
      });

      if (userEffects.length === 0) return 0;

      // 2. Dọn dẹp bất đồng bộ các hiệu ứng đã hết hạn (để tránh rác DB)
      UserEffect.deleteMany({
        userId,
        expiresAt: { $lte: now }
      }).catch(err => logger.error('[EffectEngine] Lỗi khi xóa hiệu ứng hết hạn:', err));

      // 3. Lấy định nghĩa chi tiết của các hiệu ứng
      const effectIds = userEffects.map(e => e.effectId);
      const effectDefs = await ItemEffect.find({
        effectId: { $in: effectIds },
        effectType
      });

      if (effectDefs.length === 0) return 0;

      const defMap = new Map<string, IItemEffect>();
      for (const def of effectDefs) {
        defMap.set(def.effectId, def);
      }

      // Group các hiệu ứng đang kích hoạt theo effectId để xử lý stackable
      const groupedValues = new Map<string, number[]>();
      for (const ue of userEffects) {
        const def = defMap.get(ue.effectId);
        if (!def) continue;

        if (!groupedValues.has(ue.effectId)) {
          groupedValues.set(ue.effectId, []);
        }
        groupedValues.get(ue.effectId)!.push(def.effectValue);
      }

      let totalBoost = 0;

      // Tính toán dựa trên thuộc tính stackable của định nghĩa hiệu ứng
      for (const [effectId, values] of groupedValues.entries()) {
        const def = defMap.get(effectId)!;
        if (def.stackable) {
          // Cộng dồn toàn bộ
          totalBoost += values.reduce((sum, val) => sum + val, 0);
        } else {
          // Không cộng dồn, chỉ lấy giá trị cao nhất từ nguồn này
          totalBoost += Math.max(...values);
        }
      }

      return totalBoost;
    } catch (error) {
      logger.error(`[EffectEngine] Lỗi khi tính toán boost ${effectType} cho user ${userId}:`, error);
      return 0;
    }
  }
}

export const effectEngine = new EffectEngine();
