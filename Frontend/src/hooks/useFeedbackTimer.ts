// @/hooks/useFeedbackTimer.ts

import { useState, useEffect, useRef, useCallback } from "react";
import type { MessageData } from "@/types/message";
import { checkRating } from "@/services/ratingService";

interface UseFeedbackTimerProps {
  messages: MessageData[];
  sessionId: string | null;
}

interface UseFeedbackTimerReturn {
  showFeedbackModal: boolean;
  closeFeedbackModal: () => void;
}

const FEEDBACK_DELAY = 5 * 60 * 1000; // 5 phút = 300,000ms

export const useFeedbackTimer = ({
  messages,
  sessionId,
}: UseFeedbackTimerProps): UseFeedbackTimerReturn => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastBotMessageTimeRef = useRef<number | null>(null);

  // Kiểm tra xem session đã được đánh giá chưa
  useEffect(() => {
    const checkIfRated = async () => {
      if (!sessionId) return;

      try {
        const response = await checkRating(sessionId);
        if (response.is_rated) {
          setHasRated(true);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra rating:", error);
      }
    };

    checkIfRated();
  }, [sessionId]);

  // Reset timer khi có tin nhắn mới
  const resetTimer = useCallback(() => {
    // Xóa timer cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Nếu đã đánh giá rồi thì không cần tạo timer mới
    if (hasRated) return;

    // Tạo timer mới để hiển thị modal sau 5 phút
    timerRef.current = setTimeout(() => {
      console.log("5 phút không có tin nhắn mới - hiển thị modal đánh giá");
      setShowFeedbackModal(true);
    }, FEEDBACK_DELAY);
  }, [hasRated]);

  // Theo dõi tin nhắn cuối cùng từ bot
  useEffect(() => {
    if (messages.length === 0 || hasRated) return;

    // Tìm tin nhắn cuối cùng từ bot
    const lastBotMessage = [...messages]
      .reverse()
      .find((msg) => msg.sender_type === "bot");

    if (!lastBotMessage) return;

    // Lấy thời gian của tin nhắn bot cuối cùng
    const botMessageTime = new Date(lastBotMessage.created_at).getTime();

    // Nếu là tin nhắn bot mới (khác với lần trước)
    if (lastBotMessageTimeRef.current !== botMessageTime) {
      console.log("Phát hiện tin nhắn mới từ bot, reset timer 5 phút");
      lastBotMessageTimeRef.current = botMessageTime;
      resetTimer();
    }

    // Cleanup: Xóa timer khi component unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [messages, hasRated, resetTimer]);

  // Kiểm tra khi có tin nhắn mới từ customer (reset timer)
  useEffect(() => {
    if (messages.length === 0 || hasRated) return;

    const lastMessage = messages[messages.length - 1];

    // Nếu tin nhắn cuối là từ customer, reset timer
    if (lastMessage.sender_type === "customer") {
      console.log("Người dùng vừa gửi tin nhắn - reset timer");
      // Xóa timer hiện tại vì người dùng đang tương tác
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [messages, hasRated]);

  const closeFeedbackModal = useCallback(() => {
    setShowFeedbackModal(false);
    setHasRated(true); // Đánh dấu đã đánh giá để không hiện modal nữa

    // Xóa timer nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    showFeedbackModal,
    closeFeedbackModal,
  };
};
