import { test, mock } from 'node:test';
import assert from 'node:assert';
import { titleService } from '../services/TitleService.js';
import { titleRepository } from '../repositories/TitleRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { questService } from '../services/QuestService.js';
import { questRepository } from '../repositories/QuestRepository.js';
import { achievementService } from '../services/AchievementService.js';
import { achievementRepository } from '../repositories/AchievementRepository.js';
import { playerStatsRepository } from '../repositories/PlayerStatsRepository.js';
import { seasonRepository } from '../repositories/SeasonRepository.js';
import { eventLogRepository } from '../repositories/EventLogRepository.js';

// Stub EventLog persistence globally for unit testing
mock.method(eventLogRepository, 'logEvent', async () => ({}) as any);

// =======================================================
// 1. UNIT TESTS CHO TITLE SERVICE
// =======================================================
test('TitleService: unlockTitle mở khóa danh hiệu thành công', async () => {
  const mockTitleDef = { titleId: 'tan_nhan', name: 'Tân Nhân' };
  const mockUser = {
    discordId: 'user_1',
    titlesOwned: [] as string[],
    save: async function() { return this; }
  };

  const getTitleStub = mock.method(titleRepository, 'getById', async () => mockTitleDef as any);
  const unlockTitleStub = mock.method(titleRepository, 'unlockTitle', async () => true);
  const getByDiscordIdStub = mock.method(userRepository, 'getByDiscordId', async () => mockUser as any);

  const success = await titleService.unlockTitle('user_1', 'guild_1', 'tan_nhan');

  assert.strictEqual(success, true);
  assert.ok(mockUser.titlesOwned.includes('Tân Nhân'));

  getTitleStub.mock.restore();
  unlockTitleStub.mock.restore();
  getByDiscordIdStub.mock.restore();
});

test('TitleService: equipTitle trang bị danh hiệu thành công', async () => {
  const mockTitleDef = { titleId: 'tan_nhan', name: 'Tân Nhân' };
  const mockUser = {
    discordId: 'user_1',
    title: '',
    titlesOwned: ['Tân Nhân'],
    save: async function() { return this; }
  };

  const getTitleStub = mock.method(titleRepository, 'getById', async () => mockTitleDef as any);
  const equipTitleStub = mock.method(titleRepository, 'equipTitle', async () => true);
  const getByDiscordIdStub = mock.method(userRepository, 'getByDiscordId', async () => mockUser as any);

  const res = await titleService.equipTitle('user_1', 'tan_nhan');

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.titleName, 'Tân Nhân');
  assert.strictEqual(mockUser.title, 'Tân Nhân');

  getTitleStub.mock.restore();
  equipTitleStub.mock.restore();
  getByDiscordIdStub.mock.restore();
});

// =======================================================
// 2. UNIT TESTS CHO QUEST SERVICE
// =======================================================
test('QuestService: claimReward trao tiền và kinh nghiệm cho người chơi', async () => {
  const mockQuest = {
    questId: 'daily_mine',
    type: 'daily',
    targetCount: 10,
    rewardCoins: 100,
    rewardExp: 50
  };

  const mockProgress = {
    questId: 'daily_mine',
    currentCount: 10,
    claimed: false,
    save: async function() { return this; }
  };

  const mockUser = {
    discordId: 'user_1',
    balance: 1000,
    exp: 200,
    level: 1,
    save: async function() { return this; }
  };

  const getQuestStub = mock.method(questRepository, 'getById', async () => mockQuest as any);
  const getProgressStub = mock.method(questRepository, 'getProgress', async () => mockProgress as any);
  const getByDiscordIdStub = mock.method(userRepository, 'getByDiscordId', async () => mockUser as any);
  const saveHistoryStub = mock.method(questRepository, 'saveHistory', async () => ({} as any));

  const res = await questService.claimReward('user_1', 'guild_1', 'daily_mine', null);

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.coins, 100);
  assert.strictEqual(res.exp, 50);
  assert.strictEqual(mockProgress.claimed, true);
  assert.strictEqual(mockUser.balance, 1100); // 1000 + 100
  assert.strictEqual(mockUser.exp, 250); // 200 + 50

  getQuestStub.mock.restore();
  getProgressStub.mock.restore();
  getByDiscordIdStub.mock.restore();
  saveHistoryStub.mock.restore();
});

// =======================================================
// 3. UNIT TESTS CHO ACHIEVEMENT SERVICE
// =======================================================
test('AchievementService: getPlayerAchievementsList trả về danh sách đầy đủ trạng thái mở khóa', async () => {
  const mockAllAchievements = [
    { achievementId: 'mine_expert', name: 'Đại Địa Tiên Nhân', description: 'Khai thác 100 lần', category: 'activity', criteriaType: 'mine_count', targetValue: 100, rewardCoins: 500, rewardExp: 250, isHidden: false }
  ];

  const mockUnlocked = [
    { achievementId: 'mine_expert', unlockedAt: new Date() }
  ];

  const mockStats = {
    totalMines: 100,
    totalFish: 0
  };

  const getAllAchievementsStub = mock.method(achievementRepository, 'getAllAchievements', async () => mockAllAchievements as any);
  const getUnlockedAchievementsStub = mock.method(achievementRepository, 'getUnlockedAchievements', async () => mockUnlocked as any);
  const getOrCreateStatsStub = mock.method(playerStatsRepository, 'getOrCreate', async () => mockStats as any);
  const getByDiscordIdStub = mock.method(userRepository, 'getByDiscordId', async () => ({ level: 5 } as any));

  const achList = await achievementService.getPlayerAchievementsList('user_1');

  assert.strictEqual(achList.length, 1);
  assert.strictEqual(achList[0].achievementId, 'mine_expert');
  assert.strictEqual(achList[0].completed, true);
  assert.strictEqual(achList[0].currentValue, 100);

  getAllAchievementsStub.mock.restore();
  getUnlockedAchievementsStub.mock.restore();
  getOrCreateStatsStub.mock.restore();
  getByDiscordIdStub.mock.restore();
});
