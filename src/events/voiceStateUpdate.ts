import { VoiceState } from 'discord.js';

export default {
  name: 'voiceStateUpdate',
  async execute(oldState: VoiceState, newState: VoiceState) {
    // Sự kiện theo dõi Thần thức đệ tử di chuyển qua các thiền đường voice chat
    try {
      const member = newState.member || oldState.member;
      if (!member || member.user.bot) return;

      const userTag = member.user.tag;
      const oldChannel = oldState.channel;
      const newChannel = newState.channel;

      if (!oldChannel && newChannel) {
        // Đệ tử gia nhập Thiền đường
        console.log(`[Voice Log] Đệ tử ${userTag} đã nhập thiền đường: ${newChannel.name}`);
      } else if (oldChannel && !newChannel) {
        // Đệ tử rời Thiền đường
        console.log(`[Voice Log] Đệ tử ${userTag} đã xuất thiền đường: ${oldChannel.name}`);
      } else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
        // Đệ tử di chuyển thiền đường
        console.log(`[Voice Log] Đệ tử ${userTag} chuyển thiền phòng từ ${oldChannel.name} sang ${newChannel.name}`);
      }
    } catch (error) {
      console.error('[Event voiceStateUpdate] Lỗi bẫy vết voice chat:', error);
    }
  }
};
