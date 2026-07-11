import { useState, useCallback } from 'react';
import { useTranslation } from '@/context/LanguageContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useAIChat() {
  const { language, setLanguage } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: language === 'vi' 
        ? 'Chào mừng bạn đến với trải nghiệm mua sắm xa xỉ DECKKO. Tôi có thể giúp gì cho bạn hôm nay?' 
        : 'Welcome to the DECKKO luxury shopping experience. How can I assist you today?',
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async (content: string, context?: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    try {
      const assistantId = `assistant-${Date.now()}`;
      let streamingContent = '';

      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Simple client-side rule engine responding dynamically to user commands
      const lowerContent = content.toLowerCase();
      let responseText = '';

      if (lowerContent.includes('tiếng anh') || lowerContent.includes('english') || lowerContent.includes('change to english')) {
        setLanguage('en');
        responseText = 'Sure! I have successfully updated the website language to English. The interface, titles, and checkout fields are now in English.';
      } else if (lowerContent.includes('tiếng việt') || lowerContent.includes('vietnamese') || lowerContent.includes('chuyển sang tiếng việt')) {
        setLanguage('vi');
        responseText = 'Dạ, tôi đã chuyển đổi ngôn ngữ hiển thị của toàn bộ trang web sang Tiếng Việt thành công.';
      } else if (lowerContent.includes('khuyến mãi') || lowerContent.includes('voucher') || lowerContent.includes('giảm giá') || lowerContent.includes('discount')) {
        responseText = language === 'vi'
          ? 'Hiện tại chúng tôi có mã giảm giá LUXURY50 (giảm 50.000 đ) khi thanh toán. Ngoài ra, đơn hàng từ 1.500.000 đ sẽ được miễn phí vận chuyển toàn quốc.'
          : 'We currently have a discount code LUXURY50 (50,000 VND off) at checkout. In addition, orders from 1,500,000 VND qualify for free nationwide shipping.';
      } else if (lowerContent.includes('size') || lowerContent.includes('kích thước') || lowerContent.includes('fit') || lowerContent.includes('chọn size')) {
        responseText = language === 'vi'
          ? 'Sản phẩm áo khoác bomber bên tôi thiết kế phom Regular Fit ôm nhẹ. Bạn có thể cho tôi biết chiều cao và cân nặng để tôi tư vấn cỡ chuẩn nhất nhé!'
          : 'Our bomber jackets fit slightly slim. Could you please share your height and weight so I can recommend the perfect size for you?';
      } else {
        try {
          const systemPrompt = language === 'vi' 
            ? "Bạn là nhân viên tư vấn bán hàng của DECKKO, một thương hiệu thời trang cao cấp. Hãy trả lời thật ngắn gọn, lịch sự, thuyết phục bằng Tiếng Việt. Tuyệt đối không xưng tôi, hãy xưng là 'DECKKO'." 
            : "You are a sales consultant for DECKKO, a luxury fashion brand. Answer concisely and politely in English. Call yourself 'DECKKO'.";
          
          const fullPrompt = `${systemPrompt} Khách hàng nói: "${content}"`;
          const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`);
          
          if (response.ok) {
            responseText = await response.text();
          } else {
            throw new Error('API Failed');
          }
        } catch (e) {
          responseText = language === 'vi'
            ? `Cảm ơn bạn đã quan tâm. Hiện tại đường truyền đến bộ não AI đang bị nghẽn, bạn vui lòng sử dụng mã giảm giá LUXURY50 nhé!`
            : `Thank you for your interest. Our AI brain is currently experiencing high traffic, please use the discount code LUXURY50 in the meantime!`;
        }
      }

      // Emulate streaming output chunks
      const words = responseText.split(' ');
      let currentString = '';
      
      for (let i = 0; i < words.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        currentString += (i === 0 ? '' : ' ') + words[i];
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: currentString } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsSending(false);
    }
  }, [language, setLanguage]);

  return { messages, isSending, sendMessage };
}
