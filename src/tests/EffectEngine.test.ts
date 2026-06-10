import { test, mock } from 'node:test';
import assert from 'node:assert';
import { effectEngine } from '../services/EffectEngine.js';
import ItemEffect from '../database/models/ItemEffect.js';
import UserEffect from '../database/models/UserEffect.js';

test('EffectEngine: applyEffect tìm thấy định nghĩa và lưu hiệu ứng cho người chơi', async () => {
  const findOneStub = mock.method(ItemEffect, 'findOne', async () => {
    return {
      effectId: 'buff_tieu_dao',
      duration: 3600,
      effectType: 'xp_boost',
      effectValue: 0.1
    } as any;
  });

  const findOneAndUpdateStub = mock.method(UserEffect, 'findOneAndUpdate', async (query: any, update: any) => {
    return {
      userId: query.userId,
      effectId: query.effectId,
      sourceId: query.sourceId,
      expiresAt: update.$set.expiresAt,
      sourceType: update.$set.sourceType
    } as any;
  });

  const result = await effectEngine.applyEffect('user_1', 'buff_tieu_dao', 'item', 'item_1');

  assert.ok(result);
  assert.strictEqual(result.userId, 'user_1');
  assert.strictEqual(result.effectId, 'buff_tieu_dao');
  assert.strictEqual(result.sourceType, 'item');
  assert.ok(result.expiresAt instanceof Date);

  findOneStub.mock.restore();
  findOneAndUpdateStub.mock.restore();
});

test('EffectEngine: removeEffect xóa thành công hiệu ứng của người chơi', async () => {
  const deleteOneStub = mock.method(UserEffect, 'deleteOne', async () => {
    return { deletedCount: 1 } as any;
  });

  const success = await effectEngine.removeEffect('user_1', 'buff_tieu_dao', 'item_1');
  assert.strictEqual(success, true);

  deleteOneStub.mock.restore();
});

test('EffectEngine: calculateBoost tính toán tổng hệ số cộng dồn và không cộng dồn đúng thiết kế', async () => {
  // Giả sử người chơi có 3 hiệu ứng đang hoạt động:
  // 1. vip_pickaxe (xp_boost, +10%, stackable = false)
  // 2. vip_pickaxe (xp_boost, +10%, stackable = false) -> Trùng lặp, chỉ lấy max 10%
  // 3. lucky_charm (xp_boost, +5%, stackable = true) -> Cộng dồn vào tổng
  const findUserEffectsStub = mock.method(UserEffect, 'find', async () => {
    return [
      { effectId: 'vip_pickaxe', expiresAt: null },
      { effectId: 'vip_pickaxe', expiresAt: null },
      { effectId: 'lucky_charm', expiresAt: null }
    ] as any;
  });

  const deleteManyStub = mock.method(UserEffect, 'deleteMany', async () => {
    return { deletedCount: 0 } as any;
  });

  const findItemEffectsStub = mock.method(ItemEffect, 'find', async () => {
    return [
      { effectId: 'vip_pickaxe', effectType: 'xp_boost', effectValue: 0.10, stackable: false },
      { effectId: 'lucky_charm', effectType: 'xp_boost', effectValue: 0.05, stackable: true }
    ] as any;
  });

  const totalBoost = await effectEngine.calculateBoost('user_1', 'xp_boost');

  // Kết quả mong đợi:
  // vip_pickaxe: non-stackable -> Math.max(0.10, 0.10) = 0.10
  // lucky_charm: stackable -> 0.05
  // Tổng = 0.15 (sử dụng sai số float nhỏ để so sánh)
  assert.ok(Math.abs(totalBoost - 0.15) < 1e-9, `Expected totalBoost to be close to 0.15, got ${totalBoost}`);

  findUserEffectsStub.mock.restore();
  deleteManyStub.mock.restore();
  findItemEffectsStub.mock.restore();
});
