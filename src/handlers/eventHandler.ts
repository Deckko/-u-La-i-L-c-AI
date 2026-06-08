import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Xử lý Tải Event Listener tự động (ready, interactionCreate, messageCreate, v.v)
 */
export async function loadEvents(client: Client) {
    const eventsPath = path.join(__dirname, '../events');
    
    // Tự động tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(eventsPath)) {
        fs.mkdirSync(eventsPath, { recursive: true });
        console.log('[Event Handler] Đã tạo thư mục events/');
        return;
    }

    // Quét file events trực tiếp
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const fileUrl = pathToFileURL(filePath).href;
        
        try {
            const eventModule = await import(fileUrl);
            const event = eventModule.default || eventModule;

            // Xử lý nạp Event vào Client
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log(`[Event Handler] Bật event watcher: ${event.name}`);
        } catch (error) {
            console.error(`[Lỗi Event Handler] Thất bại khi nạp event listener ${file}:`, error);
        }
    }
}
