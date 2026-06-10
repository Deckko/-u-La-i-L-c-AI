import { test, mock } from 'node:test';
import assert from 'node:assert';
import { GameConfigService } from '../services/GameConfigService.js';
import { gameConfigRepository } from '../repositories/GameConfigRepository.js';

test('GameConfigService: getConfig lấy giá trị từ repository, lưu vào cache, và xử lý giá trị mặc định', async () => {
  const service = new GameConfigService();

  const getByKeyStub = mock.method(gameConfigRepository, 'getByKey', async (key: string) => {
    if (key === 'ti_le_roi_do') {
      return { value: 0.25 } as any;
    }
    return null;
  });

  const upsertStub = mock.method(gameConfigRepository, 'upsertConfig', async () => {
    return {} as any;
  });

  // Lần gọi đầu tiên: Query repository
  const val1 = await service.getConfig<number>('ti_le_roi_do', 0.1);
  assert.strictEqual(val1, 0.25);
  assert.strictEqual(getByKeyStub.mock.calls.length, 1);

  // Lần gọi thứ hai: Trả về từ cache (không gọi repo)
  const val2 = await service.getConfig<number>('ti_le_roi_do', 0.1);
  assert.strictEqual(val2, 0.25);
  assert.strictEqual(getByKeyStub.mock.calls.length, 1);

  // Gọi khóa không tồn tại: Ghi nhận giá trị mặc định và upsert xuống DB
  const val3 = await service.getConfig<number>('missing_key', 100);
  assert.strictEqual(val3, 100);
  assert.strictEqual(upsertStub.mock.calls.length, 1);

  // Làm sạch cache: Lần gọi tiếp theo phải query lại repository
  service.clearCache();
  const val4 = await service.getConfig<number>('ti_le_roi_do', 0.1);
  assert.strictEqual(val4, 0.25);
  assert.strictEqual(getByKeyStub.mock.calls.length, 3);

  getByKeyStub.mock.restore();
  upsertStub.mock.restore();
});
