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
import { getAllLLMs } from "@/services/llmService";
import type { LLMData } from "@/types/llm";
export const useClientChat = () => {
  // --- State ---
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true); // Đang kết nối/khởi tạo session
  const [isBotTyping, setIsBotTyping] = useState(false); // Bot đang trả lời
  const [llms, setLlms] = useState<LLMData>();
  // --- Ref ---
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const botTypingTimeoutRef = useRef<number | null>(null);

  // --- Helper ---
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // --- Effects ---

  // Effect (1): Tự động cuộn khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  useEffect(() => {
    const initializeChat = async () => {
      setIsConnecting(true);

      try {
        // Đầu tiên, load LLMs nếu chưa có
        let currentLlms = llms;
        if (!currentLlms) {
          try {
            currentLlms = await getAllLLMs();
            setLlms(currentLlms);
          } catch (error) {
            console.error("Error fetching LLMs:", error);
            // Tiếp tục với giá trị mặc định nếu không load được LLMs
          }
        }

        let currentSessionId = localStorage.getItem("chatSessionId");
        let isNewSession = false;

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
        if (isNewSession && currentLlms?.system_greeting) {
          const welcomeMessage: MessageData = {
            id: `welcome-${Date.now()}`, // ID tạm thời, chỉ dùng ở UI
            chat_session_id: currentSessionId,
            sender_type: "bot", // Tin nhắn từ bot
            content: currentLlms.system_greeting, // Nội dung tin nhắn
            created_at: new Date().toISOString(), // Thời gian hiện tại
            image: null,
          };

          // Thêm tin nhắn chào mừng vào đầu mảng (lịch sử lúc này sẽ rỗng)
          setMessages([welcomeMessage, ...history]);
        } else {
          // Session cũ hoặc không có system_greeting, chỉ cần tải lịch sử
          setMessages(history);
        }

        setIsLoading(false);

        // Định nghĩa hàm callback khi có tin nhắn mới
        const handleNewMessage = (data: MessageData) => {
          // Tắt trạng thái bot đang typing khi nhận được phản hồi
          if (data.sender_type === "bot") {
            setIsBotTyping(false);
            // Clear timeout nếu có
            if (botTypingTimeoutRef.current) {
              clearTimeout(botTypingTimeoutRef.current);
              botTypingTimeoutRef.current = null;
            }
          }

          // Normalize dữ liệu - đảm bảo created_at luôn có giá trị hợp lệ
          const normalizedMessage: MessageData = {
            ...data,
            created_at: data.created_at || new Date().toISOString(),
            id: data.id || `msg-${Date.now()}`,
          };
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
      // Clear timeout nếu có
      if (botTypingTimeoutRef.current) {
        clearTimeout(botTypingTimeoutRef.current);
      }
    };
  }, []); // Chỉ chạy 1 lần khi component mount

  // Xử lý gửi tin nhắn
  const handleSendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && sessionId && !isConnecting && !isBotTyping) {
      // Hiển thị trạng thái bot đang typing
      setIsBotTyping(true);

      // Tự động tắt typing indicator sau 30 giây nếu không có phản hồi
      if (botTypingTimeoutRef.current) {
        clearTimeout(botTypingTimeoutRef.current);
      }
      botTypingTimeoutRef.current = setTimeout(() => {
        setIsBotTyping(false);
      }, 30000);

      // Gửi tin nhắn
      sendMessage(sessionId, "customer", trimmedMessage, false, null);
      setNewMessage(""); // Xóa nội dung trong ô input
    }
  }, [newMessage, sessionId, isConnecting, isBotTyping]);

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
    isBotTyping,

    // State Setters
    setNewMessage,

    // Handlers
    handleSendMessage,
    handleKeyDown,

    // Ref
    messagesEndRef,
  };
};
