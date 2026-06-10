import { Client, ActivityType } from 'discord.js';
import { flushXPCacheToDB, addXPToCache } from '../utils/redisUtils.js';
import User from '../database/models/User.js';
import logger from '../core/logger.js';
import { leaderboardService, LeaderboardCategory } from '../services/LeaderboardService.js';
import { economyAuditService } from '../services/EconomyAuditService.js';

export default {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    logger.info(`
============================================================
              🔥 ĐẾ TÔNG RPG DISCORD BOT 🔥
    Trạng thái: Trực Tuyến & Linh Lực Tràn Đầy
    Đang phục vụ Server Đấu La Đại Lục!
============================================================
    `);

    client.user?.setActivity('Đấu La Thế Giới RPG', { type: ActivityType.Playing });

    // Chạy các snapshot ban đầu khi vừa trực tuyến
    try {
      logger.info('[Ready Core] Khởi động: Chạy bản chụp Bảng Xếp Hạng & Kinh Tế ban đầu...');
      const categories: LeaderboardCategory[] = ['level', 'power', 'coins', 'guild', 'achievements'];
      for (const cat of categories) {
        await leaderboardService.takeSnapshot(cat);
      }
      await economyAuditService.takeSnapshot();
      logger.info('[Ready Core] Khởi động: Bản chụp ban đầu hoàn thành.');
    } catch (err) {
      logger.error('[Ready Core] Khởi động: Lỗi chạy bản chụp ban đầu:', err);
    }

    // =======================================================
    // 1. KÍCH HOẠT CRON CRITICAL TASK: FLOOD XP CACHE -> DB
    // Mỗi 3 phút ghi đồng loạt xuống MongoDB để tránh nghẽn luồng xử lý
    // =======================================================
    setInterval(async () => {
      try {
        await flushXPCacheToDB();
      } catch (err) {
        logger.error('[Ready Core] Lỗi định kỳ Batch-Update XP:', err);
      }
    }, 3 * 60 * 1000);

    // =======================================================
    // 2. VOICE XP SWEEPER (1 phút chạy 1 lần)
    // Tự động quét và ban thưởng 1 XP cho mỗi đệ tử đang đàm luận (trong voice channel)
    // =======================================================
    setInterval(async () => {
      try {
        let voiceUsersRewardCount = 0;
        
        for (const guild of client.guilds.cache.values()) {
          const activeVoiceMembers = guild.members.cache.filter(member => 
            member.voice.channelId !== null && 
            !member.user.bot &&
            !member.voice.deaf && 
            !member.voice.mute    
          );

          for (const member of activeVoiceMembers.values()) {
            const userInDb = await User.findOne({ discordId: member.id });
            if (userInDb && userInDb.registered) {
              await addXPToCache(member.id, 1);
              voiceUsersRewardCount++;
            }
          }
        }
        
        if (voiceUsersRewardCount > 0) {
          logger.info(`[Voice Sweeper] Đã phát 1 XP miễn phí cho ${voiceUsersRewardCount} đệ tử trong thiền đường.`);
        }
      } catch (err) {
        logger.error('[Voice Sweeper] Lỗi sweeps voice channels:', err);
      }
    }, 60 * 1000);

    // =======================================================
    // 3. LEADERBOARD SNAPSHOT CRON (1 giờ chạy 1 lần)
    // =======================================================
    setInterval(async () => {
      try {
        logger.info('[Ready Core] Đang thực thi chụp ảnh nhanh Bảng Xếp Hạng...');
        const categories: LeaderboardCategory[] = ['level', 'power', 'coins', 'guild', 'achievements'];
        for (const cat of categories) {
          await leaderboardService.takeSnapshot(cat);
        }
      } catch (err) {
        logger.error('[Ready Core] Lỗi khi thực hiện snapshot Bảng Xếp Hạng:', err);
      }
    }, 60 * 60 * 1000);

    // =======================================================
    // 4. ECONOMY AUDIT SNAPSHOT CRON (1 giờ chạy 1 lần)
    // =======================================================
    setInterval(async () => {
      try {
        logger.info('[Ready Core] Đang thực thi chụp ảnh nhanh Kinh Tế...');
        await economyAuditService.takeSnapshot();
      } catch (err) {
        logger.error('[Ready Core] Lỗi khi thực hiện snapshot Kinh Tế:', err);
      }
    }, 60 * 60 * 1000);
  }
};
