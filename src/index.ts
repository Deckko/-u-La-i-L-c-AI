import { Client, GatewayIntentBits, Collection } from 'discord.js';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import express from 'express';
import { config } from './config/config.js';
import logger from './core/logger.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';

// Đăng ký các database models
import './database/models/User.js';
import './database/models/GuildConfig.js';
import './database/models/FeatureFlag.js';
import './database/models/Event.js';
import './database/models/Boss.js';
import './database/models/Giftcode.js';
import './database/models/Stripe.js';
import './database/models/Title.js';
import './database/models/UserTitle.js';
import './database/models/LeaderboardSnapshot.js';
import './database/models/GameConfig.js';
import './database/models/SuspiciousActivity.js';
import './database/models/LoginStreak.js';
import './database/models/RewardHistory.js';
import './database/models/GuildMember.js';
import './database/models/GuildBank.js';
import './database/models/GuildTechnology.js';
import './database/models/GuildTerritory.js';
import './database/models/GuildRanking.js';
import './database/models/GuildSeasonStats.js';
import './database/models/EventLog.js';
import './database/models/Season.js';
import './database/models/Dungeon.js';
import './database/models/GuildWar.js';
import './database/models/BattlePass.js';
import './database/models/PlayerStats.js';
import './database/models/UserEffect.js';
import './database/models/ItemEffect.js';

import { questService } from './services/QuestService.js';
import { achievementService } from './services/AchievementService.js';
import { economyAuditService } from './services/EconomyAuditService.js';
import { seedGameplayData } from './migration/seedGameplayData.js';

// =======================================================
// SYSTEM DIAGNOSTICS & LOGGING RECORDER
// =======================================================
const systemLogs: { time: string; type: 'info' | 'warn' | 'error'; message: string }[] = [];
const maxLogs = 100;

function addLog(type: 'info' | 'warn' | 'error', message: string) {
  systemLogs.push({
    time: new Date().toLocaleTimeString('vi-VN'),
    type,
    message
  });
  if (systemLogs.length > maxLogs) {
    systemLogs.shift();
  }
}

// Redirect console logs to Winston & Local systemLogs buffer
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  const msg = args.join(' ');
  originalLog(msg);
  logger.info(msg);
  addLog('info', msg);
};
console.error = (...args) => {
  const msg = args.join(' ');
  originalError(msg);
  logger.error(msg);
  addLog('error', msg);
};
console.warn = (...args) => {
  const msg = args.join(' ');
  originalWarn(msg);
  logger.warn(msg);
  addLog('warn', msg);
};

process.on('uncaughtException', (err) => {
  logger.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('[UNHANDLED REJECTION]', reason as any);
});

// =======================================================
// 1. CHẠY EXPRESS SERVER (Dành cho Health Check và Debug log)
// =======================================================
const app = express();
const PORT = config.PORT;

const basicAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';
  if (userAgent.includes('Render/') || userAgent.includes('render-healthcheck')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="De Tong Admin Portal"');
    return res.status(401).send('Authentication required');
  }

  try {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    if (user === config.ADMIN_USER && pass === config.ADMIN_PASS) {
      return next();
    }
  } catch (err) {
    // Ignore
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="De Tong Admin Portal"');
  return res.status(401).send('Invalid credentials');
};

app.get('/', basicAuth, (req, res) => {
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${config.DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

  const mongoConnected = mongoose.connection.readyState === 1;
  const mongoStatusStr = mongoConnected 
    ? '<span class="text-emerald-400 font-bold">● ĐÃ KẾT NỐI (Mượt Mà)</span>' 
    : '<span class="text-rose-400 font-bold">○ CHƯA KẾT NỐI</span>';

  const redisConnected = redisClient && redisClient.isReady;
  const redisStatusStr = redisConnected
    ? '<span class="text-emerald-400 font-bold">● ĐÃ KẾT NỐI Redis</span>'
    : '<span class="text-amber-400 font-bold">○ CHƯA KẾT NỐI (Local Fallback Active)</span>';

  const discordConnected = client && client.isReady();
  const discordStatusStr = discordConnected
    ? `<span class="text-emerald-400 font-bold">● TRỰC TUYẾN (${client.user?.tag})</span>`
    : '<span class="text-rose-400 font-bold">○ NGOẠI TUYẾN</span>';

  const tokenMasked = config.DISCORD_TOKEN.length > 20
    ? `${config.DISCORD_TOKEN.substring(0, 15)}...${config.DISCORD_TOKEN.substring(config.DISCORD_TOKEN.length - 8)}`
    : 'Chưa điền hoặc quá ngắn';

  // @ts-ignore
  const loadedCommandsCount = client && client.commands ? client.commands.size : 0;

  const logsHtml = systemLogs.slice().reverse().map(log => {
    let colorClass = 'text-gray-300';
    if (log.type === 'warn') colorClass = 'text-amber-300';
    if (log.type === 'error') colorClass = 'text-rose-400 font-semibold';
    return `
    <div class="py-1.5 border-b border-gray-900 last:border-0 flex items-start gap-4">
        <span class="text-gray-500 shrink-0 font-mono text-[11px]">${log.time}</span>
        <span class="shrink-0 font-mono text-[10px] uppercase px-1.5 py-0.2 rounded ${log.type === 'error' ? 'bg-rose-500/10 text-rose-400' : log.type === 'warn' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-400'}">${log.type}</span>
        <pre class="whitespace-pre-wrap word-break-all font-mono text-xs ${colorClass}">${log.message}</pre>
    </div>
    `;
  }).join('');

  res.send(`
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đế Tông RPG Bot - Trang Quản Trị & Hướng Dẫn</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #0b0f19; }
        .heading-font { font-family: 'Space Grotesk', sans-serif; }
        .code-font { font-family: 'Fira Code', monospace; }
        .gold-glow { box-shadow: 0 0 25px rgba(212, 175, 55, 0.15); }
    </style>
</head>
<body class="text-gray-100 min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">
    <header class="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <span class="text-2xl">💮</span>
                <div>
                    <h1 class="heading-font text-lg font-bold text-amber-400 tracking-wide">ĐẾ TÔNG RPG BOT</h1>
                    <p class="text-xs text-gray-400">Trang Giám Sát & Điều Khiển Tông Môn</p>
                </div>
            </div>
            <div class="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-400 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>HỆ THỐNG MÁY CHỦ TRỰC TUYẾN</span>
            </div>
        </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-900/50 border border-gray-800 p-5 rounded-xl hover:border-gray-750 transition-all">
                <span class="text-[10px] text-gray-500 font-bold uppercase block tracking-wider mb-1">Mã Nguồn Discord Portal</span>
                <h4 class="text-white text-base font-semibold mb-2 flex items-center gap-2">🤖 Discord App Status</h4>
                <div class="text-sm space-y-1.5">
                    <div class="flex justify-between border-b border-gray-950 pb-1.5">
                        <span class="text-gray-400">Trạng thái:</span>
                        <span>${discordStatusStr}</span>
                    </div>
                    <div class="flex justify-between pt-1">
                        <span class="text-gray-400">Đã nạp:</span>
                        <span class="text-amber-400 font-semibold">${loadedCommandsCount} Mệnh lệnh RPG</span>
                    </div>
                </div>
            </div>
            <div class="bg-gray-900/50 border border-gray-800 p-5 rounded-xl hover:border-gray-750 transition-all">
                <span class="text-[10px] text-gray-500 font-bold uppercase block tracking-wider mb-1">Cơ Sở Dữ Liệu Tông Môn</span>
                <h4 class="text-white text-base font-semibold mb-2 flex items-center gap-2">🍃 MongoDB Database</h4>
                <div class="text-sm space-y-1.5">
                    <div class="flex justify-between border-b border-gray-950 pb-1.5">
                        <span class="text-gray-400">Thiết lập:</span>
                        <span>${mongoStatusStr}</span>
                    </div>
                    <div class="flex justify-between pt-1">
                        <span class="text-gray-400">Pool Connection:</span>
                        <span class="text-gray-400">OK</span>
                    </div>
                </div>
            </div>
            <div class="bg-gray-900/50 border border-gray-800 p-5 rounded-xl hover:border-gray-750 transition-all">
                <span class="text-[10px] text-gray-500 font-bold uppercase block tracking-wider mb-1">Bộ Nhớ Đệm Tối Ưu</span>
                <h4 class="text-white text-base font-semibold mb-2 flex items-center gap-2">⚡ Redis In-Memory Layer</h4>
                <div class="text-sm space-y-1.5">
                    <div class="flex justify-between border-b border-gray-950 pb-1.5">
                        <span class="text-gray-400">Kết nối:</span>
                        <span>${redisStatusStr}</span>
                    </div>
                    <div class="flex justify-between pt-1">
                        <span class="text-gray-400">Chế độ hoạt động:</span>
                        <span class="text-amber-400 font-semibold">${redisConnected ? 'Fast Cache API' : 'Local Node Memory'}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 gold-glow mb-8 overflow-hidden">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
                <div>
                    <h3 class="heading-font text-lg font-bold text-white flex items-center gap-2">
                        <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                        <span>📺 Bảng Nhật Ký Console Tông Môn (Live System Logs)</span>
                    </h3>
                </div>
                <button onclick="window.location.reload();" class="px-4 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 hover:border-gray-600 rounded text-xs font-semibold cursor-pointer transition-colors">🔄 F5 Tải Lại</button>
            </div>
            <div class="bg-slate-950/80 border border-gray-900 p-4 rounded-xl max-h-[350px] overflow-y-auto block space-y-2 code-font scrollbar-thin">
                ${logsHtml ? logsHtml : '<div class="text-center text-gray-500 text-xs py-8">Chưa có nhật ký ghi nhận.</div>'}
            </div>
        </div>
    </main>
    <footer class="border-t border-gray-800 bg-gray-950/40 text-center py-6 text-xs text-gray-500">
        <p>Đế Tông RPG Bot &copy; 2026. Phát triển dựa trên nền tảng Cloud Run siêu tốc.</p>
    </footer>
</body>
</html>
  `);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`[Express] Health check server listening on port ${PORT}`);
  });
}

// =======================================================
// 2. KHỞI TẠO DISCORD CLIENT
// =======================================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  rest: {
    timeout: 15000,
  }
});

// @ts-ignore
client.commands = new Collection();
// @ts-ignore
client.cooldowns = new Collection();

client.rest.on('rateLimited', (info) => {
  logger.warn(`[Discord REST] Bị giới hạn băng thông (Rate Limited) trên đường truyền: ${info.route}. Cần chờ ${info.timeToReset}ms để hồi phục.`);
});

// =======================================================
// 3. KHỞI TẠO REDIS CLIENT (IN-MEMORY CACHING OPTIMIZATION)
// =======================================================
export const redisClient = createClient({ url: config.REDIS_URL });
redisClient.on('error', (err) => logger.error('[Redis Core] Client Error', err));
redisClient.on('connect', () => logger.info('[Redis Core] Connected! In-memory data layer activated.'));

// =======================================================
// 4. HÀM MAIN KHỞI ĐỘNG HỆ THỐNG
// =======================================================
async function startBot() {
  try {
    logger.info('[System] Đang khởi động Đế Tông System...');

    // 4.1 Kết nối MongoDB (Mongoose)
    if (config.MONGO_URI) {
      await mongoose.connect(config.MONGO_URI);
      logger.info('[Database] Kết nối MongoDB thành công.');
      // Chạy migration seed dữ liệu cấu hình game
      await seedGameplayData();
    } else {
      logger.warn('[Database] CẢNH BÁO: Thiếu chuỗi kết nối MONGO_URI.');
    }

    // 4.2 Kết nối Redis
    if (config.REDIS_URL) {
      await redisClient.connect();
    } else {
      logger.warn('[Redis] CẢNH BÁO: Thiếu REDIS_URL, tính năng Cache có thể lỗi.');
    }

    // 4.3 Tải Handlers (Lệnh & Sự kiện)
    await loadEvents(client);
    await loadCommands(client);

    // Khởi chạy các service nghiệp vụ lắng nghe Event Bus
    questService.init();
    achievementService.init();
    economyAuditService.init();

    // 4.4 Đăng nhập Discord Bot
    if (config.DISCORD_TOKEN) {
      await client.login(config.DISCORD_TOKEN);
    } else {
      logger.error('[Discord] LỖI CHÍ MẠNG: Thiếu DISCORD_TOKEN trong file cấu hình.');
    }
  } catch (error) {
    logger.error('[System] Lỗi hệ thống nghiêm trọng xuất thế khi khởi động:', error);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startBot();
}

export default client;
