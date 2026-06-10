import { test, mock } from 'node:test';
import assert from 'node:assert';
import { eventBus } from '../core/EventBus.js';
import { eventLogRepository } from '../repositories/EventLogRepository.js';

test('EventBus phát sự kiện runtime và tự động lưu các sự kiện quan trọng xuống DB', async () => {
  const logStub = mock.method(eventLogRepository, 'logEvent', async () => {
    return {} as any;
  });

  let receivedPayload: any = null;
  eventBus.onEvent('boss_killed', (payload) => {
    receivedPayload = payload;
  });

  eventBus.emitEvent('boss_killed', {
    userId: '12345',
    guildId: '67890',
    bossId: 'dieu_than'
  });

  // Kiểm tra callback runtime nhận đúng payload
  assert.deepStrictEqual(receivedPayload, {
    userId: '12345',
    guildId: '67890',
    bossId: 'dieu_than'
  });

  // Kiểm tra repository ghi log đúng cấu trúc
  assert.strictEqual(logStub.mock.calls.length, 1);
  assert.deepStrictEqual(logStub.mock.calls[0].arguments, [
    'BossKill',
    '12345',
    '67890',
    { bossId: 'dieu_than' }
  ]);

  logStub.mock.restore();
});

test('EventBus phát sự kiện runtime thông thường và không lưu xuống DB nếu mapping là null', async () => {
  const logStub = mock.method(eventLogRepository, 'logEvent', async () => {
    return {} as any;
  });

  let receivedPayload: any = null;
  eventBus.onEvent('player_mined', (payload) => {
    receivedPayload = payload;
  });

  eventBus.emitEvent('player_mined', {
    userId: '12345',
    guildId: '67890',
    coinsEarned: 100,
    expEarned: 50,
    lootTier: 'rare'
  });

  // Đảm bảo nhận được sự kiện runtime
  assert.deepStrictEqual(receivedPayload, {
    userId: '12345',
    guildId: '67890',
    coinsEarned: 100,
    expEarned: 50,
    lootTier: 'rare'
  });

  // Đảm bảo không gọi repository ghi log
  assert.strictEqual(logStub.mock.calls.length, 0);

  logStub.mock.restore();
});
