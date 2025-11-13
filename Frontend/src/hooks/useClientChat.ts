import { useState, useEffect, useRef, useCallback } from "react";
import {
  connectCustomerSocket,
  disconnectCustomer,
  createSession, // Giả định hàm này tồn tại
  checkSession, // Giả định hàm này tồn tại và trả về boolean
  getChatHistory,
  sendMessage,
} from "@/services/chatService"; // Đảm bảo đường dẫn này đúng
import type { MessageData } from "@/types/message";

export const useClientChat = () => {
  // --- State ---
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading lịch sử
  const [isConnecting, setIsConnecting] = useState(true); // Đang kết nối/khởi tạo session

  // --- Ref ---
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      let isNewSession = false;
      try {
        if (currentSessionId) {
          const isValid = await checkSession();
          if (!isValid) {
            currentSessionId = null;
          }
        }

        if (!currentSessionId) {
          currentSessionId = await createSession();
          localStorage.setItem("chatSessionId", currentSessionId);
          isNewSession = true;
        }

        setSessionId(currentSessionId);

        // Tải lịch sử chat
        setIsLoading(true);
        const history = await getChatHistory(currentSessionId);
        if (isNewSession) {
          const welcomeMessage: MessageData = {
            id: `welcome-${Date.now()}`, // ID tạm thời, chỉ dùng ở UI
            chat_session_id: currentSessionId,
            sender_type: "bot", // Tin nhắn từ bot
            content: "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?", // Nội dung tin nhắn
            created_at: new Date().toISOString(), // Thời gian hiện tại
            image: null,
          };
          // Thêm tin nhắn chào mừng vào đầu mảng (lịch sử lúc này sẽ rỗng)
          setMessages([welcomeMessage, ...history]);
        } else {
          // Session cũ, chỉ cần tải lịch sử
          setMessages(history);
        }

        setIsLoading(false);

        // Định nghĩa hàm callback khi có tin nhắn mới
        const handleNewMessage = (data: MessageData) => {
          // Normalize dữ liệu - đảm bảo created_at luôn có giá trị hợp lệ
          const normalizedMessage: MessageData = {
            ...data,
            created_at: data.created_at || new Date().toISOString(),
            id: data.id || `msg-${Date.now()}`,
          };
          console.log("Tin nhắn sau khi normalize:", normalizedMessage);
          // Cập nhật state tin nhắn
          setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
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
