import { useState, useEffect, useRef, useCallback } from "react";
import {
  connectCustomerSocket,
  disconnectCustomer,
  createSession,
  checkSession,
  getChatHistory,
  sendMessage,
} from "@/services/chatService";
import type { MessageData } from "@/types/message";
import { useLLM } from "./useLLM";

export const useClientChat = () => {
  // --- State ---
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);

  // --- Hooks ---
  const { llmConfig } = useLLM();

  // --- Ref ---
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function để tạo tin nhắn chào mặc định
  const createSystemGreetingMessage = useCallback(
    (greeting: string): MessageData => {
      return {
        id: `greeting-${Date.now()}`,
        content: greeting,
        sender_type: "bot",
        created_at: new Date().toISOString(),
        chat_session_id: sessionId || "",
        image: null,
      };
    },
    [sessionId]
  );

  // --- Helper ---
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // --- Effects ---

  // Effect (1): Tự động cuộn khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Effect (2): Khởi tạo chat, session và WebSocket
  useEffect(() => {
    const initializeChat = async () => {
      setIsConnecting(true);
      let currentSessionId = localStorage.getItem("chatSessionId");
      console.log("Session ID từ localStorage:", currentSessionId);

      try {
        if (currentSessionId) {
          const isValid = await checkSession();
          if (!isValid) {
            currentSessionId = null; // Nếu không hợp lệ, sẽ tạo mới
          }
        }

        if (!currentSessionId) {
          // Nếu không có session ID, tạo session mới
          currentSessionId = await createSession();
          console.log("Tạo session mới với ID:", currentSessionId);
          localStorage.setItem("chatSessionId", currentSessionId);
        }

        setSessionId(currentSessionId);

        // Tải lịch sử chat
        setIsLoading(true);
        const history = await getChatHistory(currentSessionId);
        setMessages(history);
        setIsLoading(false);

        // Định nghĩa hàm callback khi có tin nhắn mới
        const handleNewMessage = (data: MessageData) => {
          // Cập nhật state tin nhắn
          setMessages((prevMessages) => [...prevMessages, data]);
        };

        // Kết nối WebSocket
        // Hàm connectCustomerSocket sẽ tự đọc "chatSessionId" từ localStorage
        connectCustomerSocket(handleNewMessage);
      } catch (error) {
        console.error("Lỗi khởi tạo chat:", error);
        setIsLoading(false);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeChat();

    // Hàm cleanup: Ngắt kết nối khi component unmount
    return () => {
      disconnectCustomer();
    };
  }, []); // Chỉ chạy 1 lần khi component mount

  // Effect (3): Thêm system greeting khi LLM config load xong và session mới
  useEffect(() => {
    if (
      llmConfig?.system_greeting &&
      sessionId &&
      !isLoading &&
      messages.length === 0
    ) {
      const greetingMessage = createSystemGreetingMessage(
        llmConfig.system_greeting
      );
      setMessages([greetingMessage]);
    }
  }, [
    llmConfig,
    sessionId,
    isLoading,
    messages.length,
    createSystemGreetingMessage,
  ]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && sessionId && !isConnecting) {
      // Gửi tin nhắn
      sendMessage(sessionId, "customer", trimmedMessage, false, null);
      setNewMessage(""); // Xóa nội dung trong ô input
    }
  }, [newMessage, sessionId, isConnecting]);

  // Xử lý nhấn Enter để gửi
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault(); // Ngăn xuống dòng
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // --- Trả về ---
  return {
    // State
    messages,
    newMessage,
    sessionId,
    isLoading,
    isConnecting,

    // State Setters
    setNewMessage,

    // Handlers
    handleSendMessage,
    handleKeyDown,

    // Ref
    messagesEndRef,
  };
};
