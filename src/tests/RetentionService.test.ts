import { test, mock } from 'node:test';
import assert from 'node:assert';
import { retentionService } from '../services/RetentionService.js';
import { userRepository } from '../repositories/UserRepository.js';
import LoginStreak from '../database/models/LoginStreak.js';
import RewardHistory from '../database/models/RewardHistory.js';
import { gameConfigService } from '../services/GameConfigService.js';

test('RetentionService: processDailyCheckin tăng chuỗi và trao thưởng chính xác', async () => {
  // 1. Mock userRepository
  const mockUser = {
    discordId: 'user_1',
    registered: true,
    balance: 500,
    exp: 200,
    combatPower: 1000,
    dailyStreak: 0,
    lastDaily: null as Date | null,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 ngày trước
    save: async function() { return this; }
  };

  const getByDiscordIdStub = mock.method(userRepository, 'getByDiscordId', async () => {
    return mockUser as any;
  });

  // 2. Mock LoginStreak.findOne
  const mockStreak = {
    userId: 'user_1',
    currentStreak: 2,
    maxStreak: 2,
    lastLoginDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 giờ trước -> Hợp lệ điểm danh và giữ chuỗi
    save: async function() { return this; }
  };

  const findOneStreakStub = mock.method(LoginStreak, 'findOne', async () => {
    return mockStreak as any;
  });

  // 3. Mock gameConfigService.getConfig
  const getConfigStub = mock.method(gameConfigService, 'getConfig', async () => {
    return {
      base_coins: 100,
      base_exp: 50,
      streaks: {
        '3': { coins_multiplier: 1.5, desc: 'Mốc 3 ngày: Nhân sâm vạn năm' }
      }
    } as any;
  });

  // 4. Mock RewardHistory save
  const saveRewardHistoryStub = mock.method(RewardHistory.prototype, 'save', async function() {
    return this;
  });

  const res = await retentionService.processDailyCheckin('user_1', 'guild_1', null);

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.streak, 3); // 2 + 1
  assert.strictEqual(res.coinsAwarded, 150); // 100 * 1.5 multiplier
  assert.strictEqual(res.expAwarded, 50); // Base exp
  assert.strictEqual(res.newBalance, 650); // 500 + 150

  getByDiscordIdStub.mock.restore();
  findOneStreakStub.mock.restore();
  getConfigStub.mock.restore();
  saveRewardHistoryStub.mock.restore();
});

test('RetentionService: processDailyCheckin chặn điểm danh trước 24 giờ', async () => {
  const mockUser = {
    discordId: 'user_1',
    registered: true,
    balance: 500,
    exp: 200,
    createdAt: new Date(),
    save: async function() { return this; }
  };

  const getByDiscordIdStub = mock.method(userRepository, 'getByDiscordId', async () => {
    return mockUser as any;
  });

  const mockStreak = {
    userId: 'user_1',
    currentStreak: 2,
    maxStreak: 2,
    lastLoginDate: new Date(Date.now() - 10 * 60 * 60 * 1000), // Mới điểm danh 10 giờ trước -> Chặn
    save: async function() { return this; }
  };

  const findOneStreakStub = mock.method(LoginStreak, 'findOne', async () => {
    return mockStreak as any;
  });

  const res = await retentionService.processDailyCheckin('user_1', 'guild_1', null);

  assert.strictEqual(res.success, false);
  assert.strictEqual(res.streak, 2);
  assert.ok(res.error?.includes('đã điểm danh rồi'));

  getByDiscordIdStub.mock.restore();
  findOneStreakStub.mock.restore();
});
