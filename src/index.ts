import { Client, GatewayIntentBits, Collection } from 'discord.js';
import mongoose from 'mongoose';
import { createClient } from 'redis';
import express from 'express';
import dotenv from 'dotenv';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';

dotenv.config();

// =======================================================
// SYSTEM DIAGNOSTICS & LOGGING RECORDER
// =======================================================
const systemLogs: { time: string, type: 'info' | 'warn' | 'error', message: string }[] = [];
const maxLogs = 100;

function addLog(type: 'info' | 'warn' | 'error', ...args: any[]) {
    const message = args.map(arg => {
        if (arg instanceof Error) {
            return arg.stack || arg.message;
        } else if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
    
    systemLogs.push({
        time: new Date().toLocaleTimeString('vi-VN'),
        type,
        message
    });
    if (systemLogs.length > maxLogs) {
        systemLogs.shift();
    }
}

// Override original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
    originalLog(...args);
    addLog('info', ...args);
};
console.error = (...args) => {
    originalError(...args);
    addLog('error', ...args);
};
console.warn = (...args) => {
    originalWarn(...args);
    addLog('warn', ...args);
};

process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION]', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]', reason);
});

// =======================================================
// 1. CHẠY EXPRESS SERVER (Dùng để hiển thị Trang Chủ và HDSD cực kỳ đẹp mắt)
// =======================================================
const app = express();
const PORT = 3000;

// Simple custom Basic Authentication Middleware
const basicAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Bypass authentication for Render health check agents to ensure service deployment never fails
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

        const adminUser = process.env.ADMIN_USER || 'admin';
        const adminPass = process.env.ADMIN_PASS || 'Detong@2026';

        if (user === adminUser && pass === adminPass) {
            return next();
        }
    } catch (err) {
        // Fall through
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="De Tong Admin Portal"');
    return res.status(401).send('Invalid credentials');
};

app.get('/', basicAuth, (req, res) => {
    const botClientId = process.env.DISCORD_CLIENT_ID || '1511708402676666608';
    const guildId = process.env.DISCORD_GUILD_ID || '1511647892711018588';
    
    // Tạo link mời chuẩn chỉ với scopes & Administrator permissions
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${botClientId}&permissions=8&scope=bot%20applications.commands`;

    // Trạng thái thành phần
    const mongoConnected = mongoose.connection.readyState === 1;
    const mongoStatusStr = mongoConnected 
        ? '<span class="text-emerald-400 font-bold">● ĐÃ KẾT NỐI (Mượt Mà)</span>' 
        : '<span class="text-rose-400 font-bold">○ CHƯA KẾT NỐI (Vui lòng kiểm tra MONGO_URI)</span>';

    const redisConnected = redisClient && redisClient.isReady;
    const redisStatusStr = redisConnected
        ? '<span class="text-emerald-400 font-bold">● ĐÃ KẾT NỐI Redis</span>'
        : '<span class="text-amber-400 font-bold">○ CHƯA KẾT NỐI (Đã kích hoạt Bộ Nhớ Fallback tự động)</span>';

    const discordConnected = client && client.isReady();
    const discordStatusStr = discordConnected
        ? `<span class="text-emerald-400 font-bold">● TRỰC TUYẾN (${client.user?.tag})</span>`
        : '<span class="text-rose-400 font-bold">○ NGOẠI TUYẾN (Đang chờ đăng nhập hoặc lỗi Token)</span>';

    const tokenRaw = process.env.DISCORD_TOKEN || '';
    const tokenMasked = tokenRaw.length > 20
        ? `${tokenRaw.substring(0, 15)}...${tokenRaw.substring(tokenRaw.length - 8)}`
        : 'Chưa điền hoặc quá ngắn';

    // Đếm số lệnh đã load
    // @ts-ignore
    const loadedCommandsCount = client && client.commands ? client.commands.size : 0;

    // Build logs HTML
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
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0b0f19;
        }
        .heading-font {
            font-family: 'Space Grotesk', sans-serif;
        }
        .code-font {
            font-family: 'Fira Code', monospace;
        }
        .gold-glow {
            box-shadow: 0 0 25px rgba(212, 175, 55, 0.15);
        }
        .gold-border {
            border-color: rgba(212, 175, 55, 0.3);
        }
    </style>
</head>
<body class="text-gray-100 min-h-screen flex flex-col justify-between selection:bg-amber-500 selection:text-black">

    <!-- Header / Nav -->
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

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 py-8 flex-grow w-full">
        
        <!-- Live Status Metrics Panel -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gray-900/50 border border-gray-800 p-5 rounded-xl hover:border-gray-750 transition-all">
                <span class="text-[10px] text-gray-500 font-bold uppercase block tracking-wider mb-1">Mã Nguồn Discord Portal</span>
                <h4 class="text-white text-base font-semibold mb-2 flex items-center gap-2">
                    <span>🤖</span> Discord App Status
                </h4>
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
                <h4 class="text-white text-base font-semibold mb-2 flex items-center gap-2">
                    <span>🍃</span> MongoDB Database
                </h4>
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
                <h4 class="text-white text-base font-semibold mb-2 flex items-center gap-2">
                    <span>⚡</span> Redis In-Memory Layer
                </h4>
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

        <!-- System Logs Console Panel -->
        <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 gold-glow mb-8 overflow-hidden">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4 mb-4">
                <div>
                    <h3 class="heading-font text-lg font-bold text-white flex items-center gap-2">
                        <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                        <span>📺 Bảng Nhật Ký Console Tông Môn (Live System Logs)</span>
                    </h3>
                    <p class="text-xs text-gray-400">Xem trực tiếp lỗi kết nối của Bot Discord để căn chỉnh tức thì</p>
                </div>
                <button onclick="window.location.reload();" class="px-4 py-2 bg-gray-900 border border-gray-700 hover:bg-gray-800 hover:border-gray-600 rounded text-xs font-semibold cursor-pointer transition-colors">
                    🔄 F5 Tải Lại Nhật Ký
                </button>
            </div>
            
            <div class="bg-slate-950/80 border border-gray-900 p-4 rounded-xl max-h-[350px] overflow-y-auto block space-y-2 code-font scrollbar-thin">
                ${logsHtml ? logsHtml : '<div class="text-center text-gray-500 text-xs py-8">Chưa có nhật ký ghi nhận từ hệ thống.</div>'}
            </div>
        </div>

        <!-- Explanations & Setup Guide -->
        <h3 class="heading-font text-xl font-bold mb-6 text-amber-400 flex items-center gap-2">
            <span>⚔️</span> Cẩm Nang Khắc Phục Lỗi Nếu Bot Vẫn Chưa Hiện Lên
        </h3>
        
        <div class="grid md:grid-cols-2 gap-6">
            <!-- Step Check Token -->
            <div class="bg-purple-950/10 border border-purple-800/20 rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">KIỂM TRA TOKEN</span>
                    <span class="text-gray-500 text-xs font-mono">Bảo mật</span>
                </div>
                <h4 class="font-bold text-base text-white mb-2">Token Hiện Tại Trùng Khớp?</h4>
                <p class="text-xs text-gray-400 leading-relaxed mb-4">
                    Token hiện tại đang được nạp vào máy chủ: <code class="bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded text-xs select-all">${tokenMasked}</code>
                </p>
                <p class="text-xs text-gray-300 leading-relaxed">
                    Nếu trang Nhật Ký ở trên xuất hiện lỗi <code class="text-rose-400">An invalid token was provided</code> hoặc <code class="text-rose-400">[Discord] LỖI CHÍ MẠNG</code>, vui lòng kiểm tra lại Token Discord Bot của huynh. Hãy chắc chắn copy đúng mục <strong class="text-amber-400">RESET TOKEN</strong> trong phần Bot chứ không phải Client Secret!
                </p>
            </div>

            <!-- Step Check Invitation & Permissions -->
            <div class="bg-cyan-950/10 border border-cyan-800/20 rounded-xl p-6 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">MỜI BOT HOÀN CHỈNH</span>
                        <span class="text-emerald-400 text-xs font-mono">Admin ready</span>
                    </div>
                    <h4 class="font-bold text-base text-white mb-2">Sử Dụng Đúng Thư Mời Đặc Quyền</h4>
                    <p class="text-xs text-gray-400 leading-relaxed mb-4">
                        Nếu các Intent đã bật xanh mà gõ <code class="text-amber-300">/dangky</code> vẫn không ra lệnh, hẵng click bên dưới để mời lại Bot có chứa đẩy đủ quyền hạn <strong class="text-cyan-300">Administrator</strong> và quyền <strong class="text-cyan-300">applications.commands</strong>.
                    </p>
                </div>
                <a href="${inviteUrl}" target="_blank" class="text-center block px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold rounded text-xs transition-colors shadow shadow-cyan-500/10 mt-2">
                    🔗 Click Để Tái Mời Bot Vào Server
                </a>
            </div>
        </div>

    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-800 bg-gray-950/40 text-center py-6 text-xs text-gray-500">
        <div class="max-w-6xl mx-auto px-4">
            <p>Đế Tông RPG Bot &copy; 2026. Phát triển dựa trên nền tảng Cloud Run siêu tốc.</p>
        </div>
    </footer>

</body>
</html>
    `);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express] Health check server listening on port ${PORT}`);
});

// =======================================================
// 2. KHỞI TẠO DISCORD CLIENT
// Cấp tất cả các Intents cần thiết cho siêu Server RPG
// =======================================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers, // Yêu cầu Bật Server Members Intent trên Discord Developer Portal
    ],
    rest: {
        timeout: 15000, // Thêm timeout 15s tránh treo request vĩnh viễn trên Render
    }
});

// Mở rộng Client để lưu trữ Collections
// @ts-ignore - Bỏ qua lỗi type để set thuộc tính động
client.commands = new Collection();
// @ts-ignore
client.cooldowns = new Collection();

// Theo dõi sự kiện Rate Limit của Discord API
client.rest.on('rateLimited', (info) => {
    console.warn(`[Discord REST] Bị giới hạn băng thông (Rate Limited) trên đường truyền: ${info.route}. Cần chờ ${info.timeToReset}ms để hồi phục.`);
});

// =======================================================
// 3. KHỞI TẠO REDIS CLIENT (IN-MEMORY CACHING OPTIMIZATION)
// Dùng lưu trữ tạm thời số point, chống sập DB khi concurrent write cao
// =======================================================
export const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('[Redis Core] Client Error', err));
redisClient.on('connect', () => console.log('[Redis Core] Connected! In-memory data layer activated.'));

// =======================================================
// 4. HÀM MAIN KHỞI ĐỘNG HỆ THỐNG
// =======================================================
async function startBot() {
    try {
        console.log('[System] Đang khởi động Đế Tông System...');

        // 4.1 Kết nối MongoDB (Mongoose)
        if (process.env.MONGO_URI) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('[Database] Kết nối MongoDB thành công.');
        } else {
            console.warn('[Database] CẢNH BÁO: Thiếu chuỗi kết nối MONGO_URI.');
        }

        // 4.2 Kết nối Redis
        if (process.env.REDIS_URL) {
            await redisClient.connect();
        } else {
            console.warn('[Redis] CẢNH BÁO: Thiếu REDIS_URL, tính năng Cache có thể lỗi.');
        }

        // 4.3 Tải Handlers (Lệnh & Sự kiện)
        await loadEvents(client);
        await loadCommands(client);

        // 4.4 Đăng nhập Discord Bot
        if (process.env.DISCORD_TOKEN) {
            await client.login(process.env.DISCORD_TOKEN);
        } else {
            console.error('[Discord] LỖI CHÍ MẠNG: Thiếu DISCORD_TOKEN trong file cấu hình.');
        }
    } catch (error) {
        console.error('[System] Lỗi hệ thống nghiêm trọng xuất hiện khi khởi động:', error);
    }
}

// Bắt đầu khởi chạy
startBot();

export default client;
