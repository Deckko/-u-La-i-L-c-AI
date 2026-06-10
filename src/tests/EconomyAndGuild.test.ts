import { test, mock } from 'node:test';
import assert from 'node:assert';
import { economyAuditService } from '../services/EconomyAuditService.js';
import EconomyStats from '../database/models/EconomyStats.js';
import User from '../database/models/User.js';
import Guild from '../database/models/Guild.js';
import EventLog from '../database/models/EventLog.js';
import EconomySnapshot from '../database/models/EconomySnapshot.js';
import { guildService } from '../services/GuildService.js';
import { guildRepository } from '../repositories/GuildRepository.js';
import { userRepository } from '../repositories/UserRepository.js';
import { gameConfigService } from '../services/GameConfigService.js';
import { eventLogRepository } from '../repositories/EventLogRepository.js';

// Stub EventLog persistence globally for unit testing
mock.method(eventLogRepository, 'logEvent', async () => ({}) as any);

// =======================================================
// 1. UNIT TESTS CHO ECONOMY AUDIT SERVICE
// =======================================================
test('EconomyAuditService: takeSnapshot tính toán Gini, lạm phát và coin velocity chính xác', async () => {
  const mockEconomyStats = { totalMinted: 100000, totalBurned: 20000 };
  const mockUsers = [
    { balance: 5000, registered: true, createdAt: new Date() },
    { balance: 3000, registered: true, createdAt: new Date() },
    { balance: 2000, registered: true, createdAt: new Date() }
  ];
  const mockGuilds = [
    { treasuryCoins: 1000 }
  ];

  const findStatsStub = mock.method(EconomyStats, 'findOne', async () => mockEconomyStats as any);
  const findUsersStub = mock.method(User, 'find', () => {
    const queryChain = {
      sort: () => Promise.resolve(mockUsers)
    };
    return queryChain as any;
  });
  const findGuildsStub = mock.method(Guild, 'find', async () => mockGuilds as any);
  const findEventLogStub = mock.method(EventLog, 'find', async () => [] as any);
  
  // Mock EconomySnapshot findOne và save
  const findOneSnapshotStub = mock.method(EconomySnapshot, 'findOne', () => {
    const queryChain = {
      sort: () => Promise.resolve(null) // Chưa có snapshot trước đó
    };
    return queryChain as any;
  });
  const saveSnapshotStub = mock.method(EconomySnapshot.prototype, 'save', async function() {
    return this;
  });

  const snap = await economyAuditService.takeSnapshot();

  assert.ok(snap.snapshotId.startsWith('SNAP_'));
  assert.strictEqual(snap.totalCirculation, 11000); // 5000 + 3000 + 2000 + 1000
  assert.strictEqual(snap.totalMinted, 100000);
  assert.strictEqual(snap.totalBurned, 20000);
  assert.ok(snap.wealthGini >= 0 && snap.wealthGini <= 1);

  findStatsStub.mock.restore();
  findUsersStub.mock.restore();
  findGuildsStub.mock.restore();
  findEventLogStub.mock.restore();
  findOneSnapshotStub.mock.restore();
  saveSnapshotStub.mock.restore();
});

// =======================================================
// 2. UNIT TESTS CHO GUILD SERVICE
// =======================================================
test('GuildService: promoteMember thăng cấp đệ tử lên Trưởng Lão thành công', async () => {
  const mockMaster = {
    userId: 'master_1',
    role: 'master',
    guildId: { _id: 'guild_1' }
  };
  const mockTarget = {
    userId: 'member_1',
    role: 'member',
    guildId: { _id: 'guild_1' }
  };

  // Mock getMember và updateMemberRole
  const getMemberStub = mock.method(guildRepository, 'getMember', async (userId: string) => {
    if (userId === 'master_1') return mockMaster as any;
    if (userId === 'member_1') return mockTarget as any;
    return null;
  });

  const updateMemberRoleStub = mock.method(guildRepository, 'updateMemberRole', async (userId: string, role: string) => {
    mockTarget.role = role;
    return mockTarget as any;
  });

  const res = await guildService.promoteMember('master_1', 'member_1');

  assert.strictEqual(res.success, true);
  assert.strictEqual(mockTarget.role, 'elder');

  getMemberStub.mock.restore();
  updateMemberRoleStub.mock.restore();
});

test('GuildService: donateCoins khấu trừ xu và gia tăng ngân quỹ bang hội kèm XP', async () => {
  const mockMember = {
    userId: 'user_1',
    guildId: { _id: 'guild_1' },
    totalContribution: 0,
    save: async function() { return this; }
  };
  const mockUser = {
    discordId: 'user_1',
    balance: 1000,
    characterName: 'Đường Tam',
    save: async function() { return this; }
  };
  const mockGuild = {
    _id: 'guild_1',
    guildName: 'Đường Môn',
    level: 1,
    xp: 0,
    capacity: 10,
    save: async function() { return this; }
  };

  const getMemberStub = mock.method(guildRepository, 'getMember', async () => mockMember as any);
  const getByDiscordIdStub = mock.method(userRepository, 'getByDiscordId', async () => mockUser as any);
  const updateBankBalanceStub = mock.method(guildRepository, 'updateBankBalance', async () => ({} as any));
  const getGuildStub = mock.method(guildRepository, 'getById', async () => mockGuild as any);
  const getConfigStub = mock.method(gameConfigService, 'getConfig', async (key: string) => {
    if (key === 'guild_xp_per_coin') return 0.1;
    if (key === 'guild_level_up_xp_formula') return 'level * 1000';
    return null;
  });

  const res = await guildService.donateCoins('user_1', 500);

  assert.strictEqual(res.success, true);
  assert.strictEqual(mockUser.balance, 500); // 1000 - 500
  assert.strictEqual(mockMember.totalContribution, 500);
  assert.strictEqual(mockGuild.xp, 50); // 500 * 0.1

  getMemberStub.mock.restore();
  getByDiscordIdStub.mock.restore();
  updateBankBalanceStub.mock.restore();
  getGuildStub.mock.restore();
  getConfigStub.mock.restore();
});
