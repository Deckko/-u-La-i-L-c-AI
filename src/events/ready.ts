import { Client, ActivityType } from 'discord.js';
import { flushXPCacheToDB, addXPToCache } from '../utils/redisUtils.js';
import User from '../models/User.js';
import { xpToNextLevel } from '../utils/levelUtils.js';

export default {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    console.log(`
============================================================
              🔥 ĐẾ TÔNG RPG DISCORD BOT 🔥
    Trạng thái: Trực Tuyến & Linh Lực Tràn Đầy
    Đang phục vụ Server Đấu La Đại Lục quy mô 70,000+ đệ tử!
============================================================
    `);

    // Thiết lập trạng thái hoạt động (Presence)
    client.user?.setActivity('Đấu La Thế Giới RPG', { type: ActivityType.Playing });

    // =======================================================
    // 1. KÍCH HOẠT CRON CRITICAL TASK: FLOOD XP CACHE -> DB
    // Mỗi 3 phút ghi đồng loạt xuống MongoDB để tránh nghẽn luồng xử lý
    // =======================================================
    setInterval(async () => {
      try {
        await flushXPCacheToDB();
      } catch (err) {
        console.error('[Ready Core] Lỗi định kỳ Batch-Update XP:', err);
      }
    }, 3 * 60 * 1000);

    // =======================================================
    // 2. VOICE XP SWEEPER (1 phút chạy 1 lần)
    // Tự động quét và ban thưởng 1 XP cho mỗi đệ tử đang đàm luận (trong voice channel)
    // =======================================================
    setInterval(async () => {
      try {
        let voiceUsersRewardCount = 0;
        
        // Quét qua các guild mà bot đang ở
        for (const guild of client.guilds.cache.values()) {
          // Lấy tất cả các voice states đang có người kết nối
          const activeVoiceMembers = guild.members.cache.filter(member => 
            member.voice.channelId !== null && 
            !member.user.bot &&
            !member.voice.deaf && // Không bị điếc (để đảm bảo hoạt động tương tác thực)
            !member.voice.mute    // Không bị tắt mic
          );

          for (const member of activeVoiceMembers.values()) {
            // Kiểm tra xem user này đã đăng ký Đế Tông chưa
            const userInDb = await User.findOne({ discordId: member.id });
            if (userInDb && userInDb.registered) {
              // Ghi 1 XP vào Cache tạm thời
              await addXPToCache(member.id, 1);
              voiceUsersRewardCount++;
            }
          }
        }
        
        if (voiceUsersRewardCount > 0) {
          console.log(`[Voice Sweeper] Đã phát 1 XP miễn phí cho ${voiceUsersRewardCount} đệ tử trong thiền đường.`);
        }
      } catch (err) {
        console.error('[Voice Sweeper] Lỗi sweeps voice channels:', err);
      }
    }, 60 * 1000);
  }
};
