import { Client, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Xử lý Load Slash Commands
 * Hỗ trợ khả năng quét và map toàn bộ sub-folders (rpg, admin,...)
 */
export async function loadCommands(client: Client) {
    const commandsArray = [];
    const commandsPath = path.join(__dirname, '../commands');
    
    // Tự động tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(commandsPath)) {
        fs.mkdirSync(commandsPath, { recursive: true });
        console.log('[Command Handler] Đã tạo thư mục commands/');
        return;
    }

    // Quét toàn bộ thư mục con (ví dụ: /rpg, /economy)
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        // Bỏ qua nếu không phải thư mục
        if (!fs.lstatSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            const fileUrl = pathToFileURL(filePath).href;
            
            try {
                const commandModule = await import(fileUrl);
                const command = commandModule.default || commandModule;

                // Kiểm tra định dạng chuẩn của / slash command
                if ('data' in command && 'execute' in command) {
                    // @ts-ignore Set cache command collection
                    client.commands.set(command.data.name, command);
                    commandsArray.push(command.data.toJSON());
                } else {
                    console.log(`[CẢNH BÁO Handler] Lệnh tại ${filePath} thiếu field 'data' hoặc 'execute' bắt buộc.`);
                }
            } catch (error) {
                console.error(`[Lỗi Handler] Load lệnh ${file} thất bại:`, error);
            }
        }
    }

    // Gọi Discord API để làm mới Slash Commands
    if (process.env.DISCORD_TOKEN && process.env.DISCORD_CLIENT_ID) {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            console.log(`[Command Handler] Bắt đầu refresh ${commandsArray.length} slash commands...`);

            // Dev Mode: Đẩy vô thẳng Guild (Cập nhật cực nhanh - Khuyên dùng)
            // Prod Mode: Đẩy vô Global Application (Mất tối đa 1 giờ cập nhật)
            const route = process.env.DISCORD_GUILD_ID 
                    ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID)
                    : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID);

            const data: any = await rest.put(route, { body: commandsArray });

            console.log(`[Command Handler] Refresh thành công ${data.length} mệnh lệnh!`);
        } catch (error) {
            console.error('[Command Handler] Lỗi khi refresh API commands lên Discord:', error);
        }
    }
}
