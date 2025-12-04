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
  const [isConnecting, setIsConnecting] = useState(true);
  const [isBotActive, setisBotActive] = useState(false); // Không hiển thị typing khi vào lần đầu
  const [isWaitingBot, setIsWaitingBot] = useState(false); // Cho phép gửi tin đầu tiên

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
        let currentLlms = llms;
        if (!currentLlms) {
          try {
            currentLlms = await getAllLLMs();
            setLlms(currentLlms);
          } catch (error) {
            console.error("Error fetching LLMs:", error);
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
        setIsLoading(true);

        const history = await getChatHistory(currentSessionId);
        if (isNewSession && currentLlms?.system_greeting) {
          const welcomeMessage: MessageData = {
            id: Date.now(),
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
          console.log("Received new message via socket:", data);

          // Xử lý sự kiện cập nhật session (admin chặn/mở khóa bot)
          if ((data as any).type === "session_update") {
            console.log("Nhận sự kiện cập nhật trạng thái bot:", data);

            const sessionStatus = (data as any).session_status;

            // Nếu bot bị chặn (status = "false"), tắt typing và cho phép gửi tin
            if (sessionStatus === "false") {
              setisBotActive(false);
              setIsWaitingBot(false);

              if (botTypingTimeoutRef.current) {
                clearTimeout(botTypingTimeoutRef.current);
                botTypingTimeoutRef.current = null;
              }
            }
            // Nếu bot được mở khóa (status = "true"), không thay đổi state
            // (chỉ khi user gửi tin mới thì mới active bot)

            return; // Không thêm vào messages
          }

          if (data.sender_type === "bot") {
            setisBotActive(false);
            setIsWaitingBot(false);
            // Clear timeout nếu có
            if (botTypingTimeoutRef.current) {
              clearTimeout(botTypingTimeoutRef.current);
              botTypingTimeoutRef.current = null;
            }
          } else if (data.sender_type === "admin") {
            setisBotActive(false);
            setIsWaitingBot(false);
          } else if (data.sender_type === "customer") {
            if (data.session_status === "false") {
              setisBotActive(false);
              setIsWaitingBot(false);
              console.log("Nhận khi chặn", data);
            }
          }

          const normalizedMessage: MessageData = {
            ...data,
            created_at: data.created_at || new Date().toISOString(),
            id: data.id || Date.now(),
          };
          setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
        };

        connectCustomerSocket(handleNewMessage);
      } catch (error) {
        console.error("Lỗi khởi tạo chat:", error);
        setIsLoading(false);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeChat();

    return () => {
      disconnectCustomer();
      if (botTypingTimeoutRef.current) {
        clearTimeout(botTypingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && sessionId && !isConnecting && !isWaitingBot) {
      setIsWaitingBot(true);
      setisBotActive(true); // Hiển thị typing indicator ngay khi gửi tin

      if (botTypingTimeoutRef.current) {
        clearTimeout(botTypingTimeoutRef.current);
      }
      botTypingTimeoutRef.current = setTimeout(() => {
        setIsWaitingBot(false);
        setisBotActive(false);
      }, 30000);

      // Gửi tin nhắn
      sendMessage(sessionId, "customer", trimmedMessage, false, null);
      setNewMessage(""); // Xóa nội dung trong ô input
    }
  }, [newMessage, sessionId, isConnecting, isWaitingBot]);

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
    isBotActive,
    isWaitingBot,

    // State Setters
    setNewMessage,

    // Handlers
    handleSendMessage,
    handleKeyDown,

    // Ref
    messagesEndRef,
  };
};
