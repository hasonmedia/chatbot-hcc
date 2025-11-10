import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { MessageData } from "@/types/message";
import {
  connectAdminSocket,
  disconnectAdmin,
  getChatHistory,
  sendMessage,
  getAllChatHistory, // (1) Thêm hàm này vào import
} from "@/services/chatService";

// Type này từ file gốc của bạn
export type ChatSession = {
  chat_session_id: string;
  customer_name: string;
  last_message: string;
  last_updated: string;
};

export const useAdminChat = () => {
  // --- State ---
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // (2) Sửa lỗi Stale State: Dùng state và ref
  const [currentSessionId, _setCurrentSessionId] = useState<string | null>(
    null
  );
  const currentSessionIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // --- Ref ---
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // (2) Hàm wrapper để set cả state và ref
  const setCurrentSessionId = (id: string | null) => {
    _setCurrentSessionId(id);
    currentSessionIdRef.current = id;
  };

  // --- Effects ---

  // Effect (1): Tải session ban đầu và kết nối WebSocket
  useEffect(() => {
    const fetchChatSessions = async () => {
      setIsLoadingSessions(true);
      try {
        // (3) Sửa tên hàm
        const sessions = await getAllChatHistory();
        sessions.sort(
          (a, b) =>
            new Date(b.last_updated).getTime() -
            new Date(a.last_updated).getTime()
        );
        setChatSessions(sessions || []); // Đảm bảo là mảng
      } catch (error) {
        console.error("Lỗi tải danh sách phiên chat:", error);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    // Hàm callback khi có tin nhắn mới từ BẤT KỲ ai
    const handleNewMessage = (data: any) => {
      console.log("Admin nhận tin nhắn:", data);

      // Nếu data là BackendSessionData (từ getAllHistory format)
      if (data.session_id !== undefined) {
        // Cập nhật danh sách session với format mới
        setChatSessions((prevSessions) => {
          const sessionId = String(data.session_id);
          const sessionIndex = prevSessions.findIndex(
            (s) => s.chat_session_id === sessionId
          );

          const lastMessage =
            typeof data.content === "string"
              ? data.content
              : data.content
              ? JSON.parse(data.content).message || ""
              : "";

          let updatedSession: ChatSession;
          let newSessionsList = [...prevSessions];

          if (sessionIndex > -1) {
            updatedSession = {
              ...prevSessions[sessionIndex],
              last_message: lastMessage,
              last_updated: data.created_at,
            };
            newSessionsList.splice(sessionIndex, 1);
          } else {
            updatedSession = {
              chat_session_id: sessionId,
              customer_name: data.name || `Session-${data.session_id}`,
              last_message: lastMessage,
              last_updated: data.created_at,
            };
          }
          return [updatedSession, ...newSessionsList];
        });

        // Nếu tin nhắn thuộc phiên đang xem, cập nhật UI chat
        if (String(data.session_id) === currentSessionIdRef.current) {
          const messageData: MessageData = {
            id: String(Date.now()),
            chat_session_id: String(data.session_id),
            sender_type: data.sender_type,
            content:
              typeof data.content === "string"
                ? data.content
                : data.content
                ? JSON.parse(data.content).message || ""
                : "",
            created_at: data.created_at,
            image: data.image && data.image.length > 0 ? data.image[0] : null,
          };
          setMessages((prevMessages) => [...prevMessages, messageData]);
        }
      }
      // Nếu data là MessageData format (từ WebSocket trực tiếp)
      else if (data.chat_session_id !== undefined) {
        // Cập nhật danh sách session (cột 1) - logic cũ
        setChatSessions((prevSessions) => {
          const sessionIndex = prevSessions.findIndex(
            (s) => s.chat_session_id === data.chat_session_id
          );

          let updatedSession: ChatSession;
          let newSessionsList = [...prevSessions];

          if (sessionIndex > -1) {
            updatedSession = {
              ...prevSessions[sessionIndex],
              last_message: data.content,
              last_updated: data.created_at,
            };
            newSessionsList.splice(sessionIndex, 1);
          } else {
            updatedSession = {
              chat_session_id: data.chat_session_id,
              customer_name: "Khách mới",
              last_message: data.content,
              last_updated: data.created_at,
            };
          }
          return [updatedSession, ...newSessionsList];
        });

        // Nếu tin nhắn thuộc phiên đang xem, cập nhật UI (cột 2)
        if (data.chat_session_id === currentSessionIdRef.current) {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      }
    };

    fetchChatSessions();
    connectAdminSocket(handleNewMessage);

    // Cleanup
    return () => {
      disconnectAdmin();
    };

    // (4) Sửa dependency array: Bỏ currentSessionId
    // Chỉ chạy 1 lần duy nhất
  }, []);

  // Effect (2): Tải lịch sử tin nhắn khi chọn session mới
  useEffect(() => {
    // ... (existing code) ...
    const fetchMessageHistory = async () => {
      if (!currentSessionId) return;

      setIsLoadingMessages(true);
      setMessages([]); // Xóa tin nhắn cũ
      try {
        const history = await getChatHistory(currentSessionId);
        setMessages(history || []); // Đảm bảo là mảng
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessageHistory();
  }, [currentSessionId]);

  // Effect (3): Tự động cuộn khi có tin nhắn mới
  // ... (existing code) ...
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Memoized Values ---

  // Lọc danh sách session dựa trên searchTerm
  // ... (existing code) ...
  const filteredSessions = useMemo(() => {
    return chatSessions.filter(
      (session) =>
        session.customer_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        session.chat_session_id
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        session.last_message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chatSessions, searchTerm]);

  // Lấy thông tin session đang chọn
  // ... (existing code) ...
  const currentSessionInfo = useMemo(() => {
    return chatSessions.find((s) => s.chat_session_id === currentSessionId);
  }, [chatSessions, currentSessionId]);

  // --- Event Handlers (dùng useCallback để ổn định) ---

  // Xử lý khi chọn một phiên chat
  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === currentSessionId) return; // Không chọn lại

      // (2) Sửa lỗi Stale State: Dùng hàm wrapper
      setCurrentSessionId(sessionId);
    },
    [currentSessionId]
  );

  // Xử lý gửi tin nhắn (Admin gửi)
  const handleSendMessage = useCallback(() => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && currentSessionId) {
      // (5) Thêm Optimistic UI
      const optimisticMessage: MessageData = {
        id: String(Date.now()),
        chat_session_id: currentSessionId,
        sender_type: "admin",
        content: trimmedMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      // Gửi tin nhắn qua WebSocket
      sendMessage(currentSessionId, "admin", trimmedMessage, true, null);

      // Cập nhật session list với tin nhắn mới
      setChatSessions((prevSessions) => {
        const sessionIndex = prevSessions.findIndex(
          (s) => s.chat_session_id === currentSessionId
        );

        if (sessionIndex > -1) {
          const updatedSession = {
            ...prevSessions[sessionIndex],
            last_message: trimmedMessage,
            last_updated: new Date().toISOString(),
          };
          const newSessionsList = [...prevSessions];
          newSessionsList.splice(sessionIndex, 1);
          return [updatedSession, ...newSessionsList];
        }
        return prevSessions;
      });

      setNewMessage(""); // Xóa nội dung trong ô input
    }
  }, [newMessage, currentSessionId]); // Phụ thuộc 2 giá trị này

  // Xử lý nhấn Enter
  // ... (existing code) ...
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage] // Phụ thuộc vào hàm handleSendMessage
  );

  // --- Trả về ---
  return {
    // ... (existing code) ...
    // State & Values
    isLoadingSessions,
    isLoadingMessages,
    filteredSessions,
    currentSessionId,
    currentSessionInfo,
    messages,
    newMessage,
    searchTerm,

    // State Setters
    setNewMessage,
    setSearchTerm,

    // Handlers
    handleSelectSession,
    handleSendMessage,
    handleKeyDown,

    // Ref
    messagesEndRef,
  };
};
