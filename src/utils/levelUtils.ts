import { Guild, GuildMember } from 'discord.js';
import User from '../database/models/User.js';

// RPG level names / Đấu La ranks
export const RPG_RANKS = [
  { minLevel: 999, name: 'Chí Cao Vạn Cổ Thần 👑', color: '#FFD700' }, // Vàng Hoàng Kim
  { minLevel: 50, name: 'Trưởng Lão ⚜️', color: '#9B59B6' },          // Tím Trưởng Lão
  { minLevel: 35, name: 'Thánh Tử 🔮', color: '#E91E63' },           // Hồng Cánh Sen
  { minLevel: 20, name: 'Tinh Anh ⚡', color: '#3498DB' },           // Xanh Lam Tinh Anh
  { minLevel: 10, name: 'Nội Môn ⚔️', color: '#E67E22' },            // Cam Nội Môn
  { minLevel: 5, name: 'Ngoại Môn 🛡️', color: '#1ABC9C' },           // Xanh Ngọc Ngoại Môn
  { minLevel: 1, name: 'Tân Đệ Tử 🌾', color: '#2ECC71' }            // Xanh Lá Tân Đệ Tử
];

/**
 * Tính toán XP cần thiết để lên cấp độ tiếp theo
 * Công thức Tu Tiên lũy thừa: level * level * 400 + 1000 XP (khó hơn nhiều so với cũ, tránh thăng cấp quá nhanh)
 */
export function xpToNextLevel(level: number): number {
  return level * level * 400 + 1000;
}

/**
 * Lấy danh hiệu tu tiên sạch (không có Emojis) phục vụ đổi Biệt danh tránh tràn ký tự
 */
export function getCleanRankName(level: number): string {
  if (level >= 999) return 'Cổ Thần';
  if (level >= 50) return 'Trưởng Lão';
  if (level >= 35) return 'Thánh Tử';
  if (level >= 20) return 'Tinh Anh';
  if (level >= 10) return 'Nội Môn';
  if (level >= 5) return 'Ngoại Môn';
  return 'Tân Đệ Tử';
}

/**
 * Lấy danh hiệu tu tiên dựa trên level
 */
export function getRankName(level: number): string {
  for (const rank of RPG_RANKS) {
    if (level >= rank.minLevel) {
      return rank.name;
    }
  }
  return 'Vô Danh';
}

/**
 * Kiểm tra xem một danh hiệu có phải danh hiệu đặc biệt/mua từ shop hay gacha không
 */
export function isCustomRpgTitle(title: string): boolean {
  if (!title) return false;
  return (
    title === '🏵️ Đệ Nhất Ma Tôn Hoàng Kim 🏵️' ||
    title === '🏅 Anh Hùng Hóa Hồn' ||
    title === '👑 Thần Vương Đấu La' ||
    title === '⚡ Chí Cao Vạn Cổ Thần ✨' ||
    title.startsWith('👑 VIP •') ||
    title.startsWith('🥇 Tiên Sát Thần Ma •')
  );
}

/**
 * Tạo một tiền tố danh hiệu sạch (rút gọn, không chứa Emojis thừa) để đưa vào Nickname Discord
 */
export function getCleanNicknamePrefix(title: string, level: number): string {
  const emojiRegex = /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g;
  
  if (!title) return getCleanRankName(level);
  
  // Kiểm tra nếu là danh hiệu VIP
  if (title.startsWith('👑 VIP •')) {
    const rankPart = title.replace('👑 VIP •', '').trim();
    // Làm sạch rankPart
    const cleanRank = rankPart.replace(emojiRegex, '').trim()
                              .replace(/^[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+|[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+$/g, '').trim();
    return `VIP • ${cleanRank}`;
  }

  // Các danh hiệu đặc biệt rút gọn để vừa nickname 32 ký tự
  if (title.includes('Đệ Nhất Ma Tôn Hoàng Kim')) return 'Ma Tôn';
  if (title.includes('Tiên Sát Thần Ma')) return 'Sát Thần';
  if (title.includes('Thần Vương Đấu La')) return 'Thần Vương';
  if (title.includes('Chí Cao Vạn Cổ Thần')) return 'Cổ Thần';
  if (title.includes('Anh Hùng Hóa Hồn')) return 'Anh Hùng';

  // Lọc bỏ ký tự đặc biệt/emoji
  let clean = title.replace(emojiRegex, '').trim();
  clean = clean.replace(/^[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+|[•·*#\s🥇🥈🥉🏅👑🏵️⚡✨🔮⚜️🛡️🌾⚔️]+$/g, '').trim();

  const standardRankNames = ['Tân Nhân', 'Vô Danh', ...RPG_RANKS.map(r => r.name)];
  if (!clean || standardRankNames.includes(title)) {
    return getCleanRankName(level);
  }

  return clean.substring(0, 12);
}

/**
 * Tự động cập nhật chức nghiệp (Auto-Role) trên Guild Discord
 * Gỡ bỏ role cũ và gán role mới tương ứng với level/danh hiệu của Đệ Tử
 */
export async function updateGuildMemberRole(member: GuildMember, level: number) {
  try {
    const guild = member.guild;
    const currentRank = getRankName(level);

    // Tìm tất cả các roles thuộc hệ thống RPG Đấu La trong Server
    const allRanksNames = RPG_RANKS.map(r => r.name);

    // Lấy thông tin user trong DB để lấy title hiện tại của họ
    const userDoc = await User.findOne({ discordId: member.id });
    const currentTitle = userDoc?.title || currentRank;

    // Xác định màu của role
    let roleColor = '#99AAB5';
    for (const rank of RPG_RANKS) {
      if (currentTitle.includes(rank.name) || currentTitle.includes(getCleanRankName(level))) {
        roleColor = rank.color;
        break;
      }
    }
    
    if (currentTitle.includes('Ma Tôn')) {
      roleColor = '#FF4500'; // Đỏ cam đặc biệt cho Ma Tôn
    } else if (currentTitle.includes('Tiên Sát Thần Ma')) {
      roleColor = '#FF0000'; // Đỏ sát thần
    } else if (currentTitle.includes('Chí Cao Vạn Cổ Thần')) {
      roleColor = '#FFD700'; // Vàng hoàng kim
    } else if (currentTitle.includes('VIP')) {
      roleColor = '#FFD700'; // Vàng hoàng kim
    }

    // Lấy hoặc tạo vai trò tương ứng trên Guild
    let targetRole = guild.roles.cache.find(r => r.name === currentTitle);
    if (!targetRole) {
      try {
        targetRole = await guild.roles.create({
          name: currentTitle,
          color: roleColor as any,
          reason: 'Hệ thống RPG Tự Động Tạo Danh Hiệu Đấu La',
          permissions: []
        });
        console.log(`[Level System] Tự tạo thành công role: ${currentTitle} với màu ${roleColor}`);
      } catch (err) {
        console.warn(`[Level System] Không thể tự tạo role: ${currentTitle}. Có thể thiếu permission.`);
        return;
      }
    } else {
      // Nếu vai trò đã tồn tại nhưng sai màu sắc, tự động cập nhật màu sắc
      try {
        if (targetRole.hexColor !== roleColor.toLowerCase()) {
          await targetRole.setColor(roleColor as any, 'Đồng bộ màu sắc vai trò theo danh hiệu');
          console.log(`[Level System] Đã cập nhật màu sắc vai trò ${currentTitle} thành ${roleColor}`);
        }
      } catch (colorErr: any) {
        console.warn(`[Level System] Không thể cập nhật màu sắc vai trò cho role: ${currentTitle} - ${colorErr.message}`);
      }
    }

    if (!targetRole) return;

    // Nếu member đã có sẵn role đúng, không cần add lại
    const isJoined = member.roles.cache.has(targetRole.id);

    // Gỡ các role RPG cũ khác và các role danh hiệu cũ ra trước để tránh bị chồng chéo
    const rolesToRemove = member.roles.cache.filter(role => {
      const isDifferentStandardRank = allRanksNames.includes(role.name) && role.name !== currentTitle;
      const isDifferentCustomTitle = isCustomRpgTitle(role.name) && role.name !== currentTitle;
      return (isDifferentStandardRank || isDifferentCustomTitle) && role.id !== targetRole?.id;
    });

    if (rolesToRemove.size > 0) {
      await member.roles.remove(rolesToRemove, 'Cập nhật danh hiệu Đấu La - Gỡ danh vị cũ');
    }

    if (!isJoined) {
      // Thêm role mới
      await member.roles.add(targetRole, 'Cập nhật danh hiệu Đấu La - Nhậm danh vị mới');
      console.log(`[Level System] Đã nhậm vai trò cho ${member.displayName} -> ${currentTitle}`);
    }

    // Tự động đồng bộ Biệt danh (Nickname): [Danh hiệu] Tên_Nhân_Vật
    try {
      const charName = userDoc?.characterName || member.user.username;
      const cleanPrefix = getCleanNicknamePrefix(currentTitle, level);
      
      const rawNickname = `[${cleanPrefix}] ${charName}`;
      const cleanNickname = rawNickname.substring(0, 32); // Giới hạn 32 ký tự của Discord

      if (member.nickname !== cleanNickname) {
        await member.setNickname(cleanNickname, 'Đồng bộ chức vị và danh hiệu Đấu La');
        console.log(`[Level System] Cập nhật biệt danh cho ${member.user.username} -> ${cleanNickname}`);
      }
    } catch (nickError: any) {
      console.warn(`[Level System] Không thể cập nhật biệt danh cho ${member.user.username}: ${nickError.message}`);
    }
  } catch (error) {
    console.error(`[Level System] Gặp lỗi khi đồng bộ Role cho Member ${member.id}:`, error);
  }
}

export interface ILevelUpResult {
  leveledUp: boolean;
  oldLevel?: number;
  newLevel?: number;
  powerGained?: number;
  oldRank?: string;
  newRank?: string;
  msg?: string;
}

/**
 * Kiểm tra xem người dùng có đủ điều kiện nâng cấp cảnh giới hay không và tự động thực hiện
 */
export async function checkLevelUp(userDoc: any, member: GuildMember | null = null): Promise<ILevelUpResult> {
  let leveledUp = false;
  const oldLevel = userDoc.level;

  while (userDoc.exp >= xpToNextLevel(userDoc.level)) {
    userDoc.level += 1;
    leveledUp = true;
  }

  if (leveledUp) {
    const levelsGained = userDoc.level - oldLevel;
    let totalPowerGained = 0;
    for (let i = 0; i < levelsGained; i++) {
      totalPowerGained += Math.floor(Math.random() * 201) + 100; // 100 -> 300 lực chiến mỗi cấp
    }
    userDoc.combatPower += totalPowerGained;

    // Cập nhật title khi lên cấp mà không đè lên custom title
    const oldTitle = userDoc.title || '';
    if (oldTitle.startsWith('👑 VIP •')) {
      // Nếu là VIP, giữ tiền tố VIP và cập nhật rank mới
      const newRank = getRankName(userDoc.level);
      userDoc.title = `👑 VIP • ${newRank}`;
    } else if (isCustomRpgTitle(oldTitle)) {
      // Nếu là các danh hiệu đặc biệt khác, GIỮ NGUYÊN danh hiệu đã mua/đạt được, không overwrite!
      // (Không thay đổi userDoc.title)
    } else {
      // Nếu là danh hiệu thường (hoặc chưa có), cập nhật danh hiệu theo level mới
      userDoc.title = getRankName(userDoc.level);
    }

    if (member) {
      await updateGuildMemberRole(member, userDoc.level);
    }

    const newRank = userDoc.title;
    const oldRank = getRankName(oldLevel);

    return {
      leveledUp: true,
      oldLevel,
      newLevel: userDoc.level,
      powerGained: totalPowerGained,
      oldRank,
      newRank,
      msg: `\n🎉 **TU VI ĐỘT PHÁ**: Chúc mừng đệ tử đã đột phá cảnh giới từ **${oldRank}** lên **${newRank}**! Nhận thêm **+${totalPowerGained.toLocaleString()} Lực chiến**.`
    };
  }

  return { leveledUp: false };
}
