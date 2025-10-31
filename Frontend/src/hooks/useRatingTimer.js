import { useEffect, useRef, useState } from 'react';

/**
 * Hook để theo dõi thời gian không hoạt động và trigger rating prompt
 * @param {Array} messages - Danh sách tin nhắn
 * @param {boolean} hasRated - Đã đánh giá chưa
 * @param {number} timeoutSeconds - Thời gian chờ (giây) - MẶC ĐỊNH 300 giây (5 phút)
 * @returns {boolean} - Có nên hiển thị rating prompt không
 */
export const useRatingTimer = (messages, hasRated, timeoutSeconds = 300) => {
    const [showRatingPrompt, setShowRatingPrompt] = useState(false);
    const timerRef = useRef(null);
    const lastBotMessageTimeRef = useRef(null);

    useEffect(() => {
        console.log('🔍 useRatingTimer - Check:', {
            messagesLength: messages?.length,
            hasRated,
            timeoutSeconds,
            lastMessage: messages?.[messages.length - 1]
        });

        // Nếu đã đánh giá rồi thì không hiển thị nữa
        if (hasRated) {
            console.log('✅ Đã đánh giá - không hiển thị prompt');
            setShowRatingPrompt(false);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // Không có tin nhắn thì không làm gì
        if (!messages || messages.length === 0) {
            console.log('⚠️ Không có tin nhắn');
            setShowRatingPrompt(false);
            return;
        }

        // Lấy tin nhắn cuối cùng
        const lastMessage = messages[messages.length - 1];
        console.log('📝 Tin nhắn cuối:', {
            sender_type: lastMessage.sender_type,
            content: lastMessage.content?.substring(0, 30),
            created_at: lastMessage.created_at
        });
        
        // Kiểm tra xem tin nhắn cuối có phải từ bot không
        if (lastMessage.sender_type === 'bot' || lastMessage.sender_type === 'admin') {
            const messageTime = new Date(lastMessage.created_at).getTime();
            
            // Nếu là tin nhắn mới từ bot, reset timer
            if (lastBotMessageTimeRef.current !== messageTime) {
                console.log('🤖 Tin nhắn từ bot/admin - bắt đầu timer');
                lastBotMessageTimeRef.current = messageTime;
                setShowRatingPrompt(false);
                
                // Clear timer cũ nếu có
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                
                // Tạo timer mới - SỬ DỤNG GIÂY thay vì phút
                timerRef.current = setTimeout(() => {
                    console.log(`⏰ ${timeoutSeconds} giây không hoạt động - HIỂN THỊ rating prompt`);
                    setShowRatingPrompt(true);
                }, timeoutSeconds * 1000); // Convert giây sang milliseconds
            }
        } else {
            // Nếu customer gửi tin nhắn mới, ẩn rating prompt và clear timer
            console.log('👤 Tin nhắn từ customer - ẩn prompt và clear timer');
            setShowRatingPrompt(false);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            lastBotMessageTimeRef.current = null;
        }

        // Cleanup khi unmount
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [messages, hasRated, timeoutSeconds]);

    return showRatingPrompt;
};
