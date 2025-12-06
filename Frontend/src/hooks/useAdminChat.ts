import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { MessageData } from "@/types/message";
import {
  connectAdminSocket,
  disconnectAdmin,
  getChatHistory,
  sendMessage,
  getAllChatHistory,
  updateChatSession,
  deleteSessionChat,
  deleteMess,
} from "@/services/chatService";

// Type này từ file gốc của bạn
export type ChatSession = {
  chat_session_id: number; // Đổi từ string sang number để đồng nhất với backend
  customer_name: string;
  last_message: string;
  last_updated: string;
  status?: string;
  sender_type?: string;
  time?: string;
  channel?: string;
  current_receiver?: string;
  previous_receiver?: string;
};

export const useAdminChat = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const [currentSessionId, _setCurrentSessionId] = useState<number | null>(
    null
  );
  const currentSessionIdRef = useRef<number | null>(null);

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
  const setCurrentSessionId = (id: number | null) => {
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
      if (data.type === "sessions_deleted") {
        console.log("Nhận sự kiện xóa sessions:", data);

        setChatSessions((prevSessions) => {
          // Lọc bỏ các session đã bị xóa
          const updatedSessions = prevSessions.filter(
            (session) =>
              !data.deleted_session_ids.includes(session.chat_session_id)
          );

          return updatedSessions;
        });

        // Nếu session hiện tại bị xóa, reset về null
        if (data.deleted_session_ids.includes(currentSessionIdRef.current)) {
          setCurrentSessionId(null);
          setMessages([]);
        }

        return; // Không xử lý thêm
      }

      if (data.type === "messages_deleted") {
        console.log("🗑️ Nhận sự kiện xóa messages:", data);

        const sessionId = Number(data.chat_session_id);

        // Nếu đang xem session này, cập nhật messages
        if (sessionId === currentSessionIdRef.current) {
          console.log("📍 Current session ID matches:", sessionId);

          setMessages((prevMessages) => {
            console.log("📝 Messages trước khi xóa:", prevMessages.length);
            console.log("🎯 IDs cần xóa:", data.deleted_message_ids);
            console.log(
              "📋 Chi tiết messages:",
              prevMessages.map((m) => ({
                id: m.id,
                type: typeof m.id,
                content: m.content?.substring(0, 30),
              }))
            );

            const updatedMessages = prevMessages.filter((message) => {
              // Kiểm tra message.id tồn tại trước khi so sánh
              if (!message.id) {
                console.log("⚠️ Message không có ID, giữ lại");
                return true;
              }

              // Đảm bảo so sánh đúng kiểu dữ liệu
              const messageId = Number(message.id);
              const shouldDelete = data.deleted_message_ids.includes(messageId);

              console.log(
                `📨 Message ID ${messageId} (${typeof messageId}): ${
                  shouldDelete ? "XÓA" : "GIỮ"
                }`
              );

              return !shouldDelete;
            });

            console.log("✅ Messages sau khi xóa:", updatedMessages.length);
            return updatedMessages;
          });
        } else {
          console.log("❌ Session ID không khớp:", {
            sessionId,
            current: currentSessionIdRef.current,
          });
        }

        // Cập nhật last_message của session trong danh sách
        setChatSessions((prevSessions) => {
          return prevSessions.map((session) => {
            if (session.chat_session_id === sessionId) {
              return {
                ...session,
                last_message: "Một số tin nhắn đã bị xóa",
                last_updated: new Date().toISOString(),
              };
            }
            return session;
          });
        });

        return; // Không xử lý thêm
      }

      // Xử lý format mới: data có chat_session_id (từ socket admin/customer)
      if (data.chat_session_id !== undefined) {
        const sessionId = Number(data.chat_session_id);

        setChatSessions((prevSessions) => {
          const sessionIndex = prevSessions.findIndex(
            (s) => s.chat_session_id === sessionId
          );

          // Nếu session ĐÃ TỒN TẠI - cập nhật
          if (sessionIndex > -1) {
            const updatedSession: ChatSession = {
              ...prevSessions[sessionIndex],
              last_message: data.content || "",
              last_updated: data.created_at || new Date().toISOString(),
            };
            const newSessionsList = [...prevSessions];
            newSessionsList.splice(sessionIndex, 1);
            return [updatedSession, ...newSessionsList];
          }

          // Nếu session CHƯA TỒN TẠI - tạo mới
          const newSession: ChatSession = {
            chat_session_id: sessionId,
            customer_name: data.session_name || `Session-${sessionId}`,
            last_message: data.content || "",
            last_updated: data.created_at || new Date().toISOString(),
            status: data.status,
            sender_type: data.sender_type,
            channel: data.channel,
          };
          console.log("Tạo session mới:", newSession);
          return [newSession, ...prevSessions];
        });

        // Nếu tin nhắn thuộc phiên đang xem, cập nhật UI (cột 2)
        if (sessionId === currentSessionIdRef.current) {
          const messageData: MessageData = {
            id: data.id || String(Date.now()),
            chat_session_id: String(data.chat_session_id),
            sender_type: data.sender_type,
            content: data.content || "",
            created_at: data.created_at || new Date().toISOString(),
            image:
              data.image && Array.isArray(data.image) && data.image.length > 0
                ? data.image
                : null,
          };

          setMessages((prevMessages) => {
            const isOwnMessage =
              messageData.sender_type === "admin" &&
              (window as any).lastSentMessageTimestamp &&
              Math.abs(
                new Date(messageData.created_at).getTime() -
                  (window as any).lastSentMessageTimestamp
              ) < 5000;

            let removedOptimistic = false;
            const withoutOptimistic = prevMessages.filter((msg) => {
              if (!msg.isOptimistic) return true;

              if (
                isOwnMessage &&
                msg.optimisticId === (window as any).lastOptimisticId
              ) {
                console.log("🗑️ Removing optimistic message by ID:", msg);
                removedOptimistic = true;
                delete (window as any).lastSentMessageTimestamp;
                delete (window as any).lastOptimisticId;
                return false;
              }

              const isMatch =
                msg.content === messageData.content &&
                msg.sender_type === messageData.sender_type;

              if (isMatch) {
                removedOptimistic = true;
                return false;
              }

              return true;
            });

            const exists = withoutOptimistic.some(
              (msg) =>
                !msg.isOptimistic &&
                (msg.id === messageData.id ||
                  (msg.content === messageData.content &&
                    msg.sender_type === messageData.sender_type &&
                    Math.abs(
                      new Date(msg.created_at).getTime() -
                        new Date(messageData.created_at).getTime()
                    ) < 2000))
            );

            if (!exists) {
              console.log("✅ Adding real message:", messageData);
              return [...withoutOptimistic, messageData];
            }

            console.log("⚠️ Message already exists, skipping");
            return withoutOptimistic;
          });
        }
      } else if (data.session_id !== undefined) {
        setChatSessions((prevSessions) => {
          const sessionId = Number(data.session_id);
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
            // Tạo session mới cho format cũ
            updatedSession = {
              chat_session_id: sessionId,
              customer_name: data.name || `Session-${data.session_id}`,
              last_message: lastMessage,
              last_updated: data.created_at,
            };
          }
          return [updatedSession, ...newSessionsList];
        });

        if (Number(data.session_id) === currentSessionIdRef.current) {
          const messageData: MessageData = {
            id: Number(Date.now()),
            chat_session_id: String(data.session_id),
            sender_type: data.sender_type,
            content:
              typeof data.content === "string"
                ? data.content
                : data.content
                ? JSON.parse(data.content).message || ""
                : "",
            created_at: data.created_at,
            image:
              data.image && Array.isArray(data.image) && data.image.length > 0
                ? data.image
                : null,
          };
        }
      }
    };

    fetchChatSessions();
    connectAdminSocket(handleNewMessage);

    // Cleanup
    return () => {
      disconnectAdmin();
    };
  }, []);

  useEffect(() => {
    const fetchMessageHistory = async () => {
      if (!currentSessionId) return;

      setIsLoadingMessages(true);
      setMessages([]); // Xóa tin nhắn cũ
      try {
        const history = await getChatHistory(String(currentSessionId));
        setMessages(history || []); // Đảm bảo là mảng
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessageHistory();
  }, [currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const filteredSessions = useMemo(() => {
    return chatSessions.filter(
      (session) =>
        session.customer_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(session.chat_session_id).includes(searchTerm.toLowerCase()) ||
        session.last_message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chatSessions, searchTerm]);

  const currentSessionInfo = useMemo(() => {
    return chatSessions.find((s) => s.chat_session_id === currentSessionId);
  }, [chatSessions, currentSessionId]);

  // --- Event Handlers (dùng useCallback để ổn định) ---

  // Xử lý khi chọn một phiên chat
  const handleSelectSession = useCallback(
    (sessionId: number | null) => {
      if (sessionId === currentSessionId) return; // Không chọn lại

      // (2) Sửa lỗi Stale State: Dùng hàm wrapper
      setCurrentSessionId(sessionId);
    },
    [currentSessionId]
  );

  // Xử lý gửi tin nhắn (Admin gửi)
  const handleSendMessage = useCallback(
    async (images?: File[], resetImages?: () => void) => {
      const trimmedMessage = newMessage.trim();
      if (
        (!trimmedMessage && (!images || images.length === 0)) ||
        !currentSessionId
      ) {
        return;
      }

      let imageBase64: string[] = [];

      // Chuyển đổi ảnh thành base64 nếu có và tạo URL preview cho optimistic UI
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        try {
          // Tạo URL preview cho optimistic UI
          imageUrls = images.map((file) => URL.createObjectURL(file));

          // Chuyển đổi thành base64 để gửi
          imageBase64 = await Promise.all(
            images.map((file) => {
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  // Loại bỏ prefix "data:image/...;base64," để chỉ giữ lại phần base64
                  const base64Data = result.split(",")[1];
                  resolve(base64Data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            })
          );
        } catch (error) {
          console.error("Error converting images to base64:", error);
          return;
        }
      }

      // Tạo optimistic message để hiển thị ngay lập tức
      const optimisticId = `optimistic_${Date.now()}_${Math.random()}`;
      const optimisticMessage = {
        id: Date.now(),
        chat_session_id: String(currentSessionId),
        sender_type: "admin" as const,
        content: trimmedMessage,
        created_at: new Date().toISOString(),
        image: imageUrls.length > 0 ? imageUrls : null,
        isOptimistic: true, // Flag để đánh dấu tin nhắn tạm thời
        optimisticId, // Unique ID để match với real message
      };

      console.log("🚀 Creating optimistic message:", optimisticMessage);

      // Thêm tin nhắn tạm thời vào danh sách
      setMessages((prev) => [...prev, optimisticMessage]);

      // Scroll xuống để thấy tin nhắn mới
      setTimeout(() => scrollToBottom(), 100);

      // Lưu timestamp để match với response
      const sendTimestamp = Date.now();
      (window as any).lastSentMessageTimestamp = sendTimestamp;
      (window as any).lastOptimisticId = optimisticId;

      // Gửi tin nhắn qua WebSocket
      sendMessage(
        String(currentSessionId),
        "admin",
        trimmedMessage,
        true,
        imageBase64.length > 0 ? imageBase64 : null
      );

      // Cập nhật session list với tin nhắn mới
      setChatSessions((prevSessions) => {
        const sessionIndex = prevSessions.findIndex(
          (s) => s.chat_session_id === currentSessionId
        );

        if (sessionIndex > -1) {
          const updatedSession = {
            ...prevSessions[sessionIndex],
            last_message: trimmedMessage || "Đã gửi ảnh",
            last_updated: new Date().toISOString(),
          };
          const newSessionsList = [...prevSessions];
          newSessionsList.splice(sessionIndex, 1);
          return [updatedSession, ...newSessionsList];
        }
        return prevSessions;
      });

      setNewMessage(""); // Xóa nội dung trong ô input
      if (resetImages) {
        resetImages(); // Reset ảnh đã chọn
      }

      // Cleanup URL objects sau khi server response hoặc sau một thời gian để tránh memory leak
      const cleanupUrls = () => {
        imageUrls.forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            // Ignore cleanup errors
          }
        });
      };

      // Cleanup sau 10 giây (server thường response nhanh)
      setTimeout(cleanupUrls, 10000);

      // Timeout để remove optimistic message nếu server không response
      setTimeout(() => {
        if ((window as any).lastOptimisticId === optimisticId) {
          console.log("⏰ Timeout - removing stuck optimistic message");
          setMessages((prev) =>
            prev.filter((msg) => msg.optimisticId !== optimisticId)
          );
          delete (window as any).lastSentMessageTimestamp;
          delete (window as any).lastOptimisticId;
        }
      }, 15000); // 15 giây timeout
    },
    [newMessage, currentSessionId]
  ); // Phụ thuộc 2 giá trị này

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage] // Phụ thuộc vào hàm handleSendMessage
  );

  const updateChatSessionStatus = async (
    sessionId: number,
    status: string,
    time: string
  ) => {
    try {
      const res = await updateChatSession(String(sessionId), { status, time });
      await getAllChatHistory();
      setChatSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.chat_session_id === sessionId
            ? {
                ...session,
                status: res.id.status,
                time: res.id.time,
              }
            : session
        )
      );
      return res;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái phiên chat:", error);
    }
  };
  const deleteChatSessions = async (sessionIds: number[]) => {
    try {
      const response = await deleteSessionChat(sessionIds);
      if (response.status === 200) {
        return { success: true, count: sessionIds.length };
      } else {
        return { success: false, error: "Xóa phiên chat thất bại!" };
      }
    } catch (error) {
      console.error("Lỗi khi xóa phiên chat:", error);
      return { success: false, error: "Có lỗi xảy ra khi xóa phiên chat!" };
    }
  };

  // Xóa tin nhắn trong phiên hiện tại
  const deleteMessages = async (messageIds: number[]) => {
    if (!currentSessionId) {
      return { success: false, error: "Không có phiên chat được chọn!" };
    }

    console.log("🚀 Bắt đầu xóa messages:", { messageIds, currentSessionId });

    try {
      const response = await deleteMess(messageIds, currentSessionId);
      console.log("📤 Response từ backend:", response);

      if (response.status === 200) {
        return { success: true, count: messageIds.length };
      } else {
        return { success: false, error: "Xóa tin nhắn thất bại!" };
      }
    } catch (error) {
      console.error("❌ Lỗi khi xóa tin nhắn:", error);
      return { success: false, error: "Có lỗi xảy ra khi xóa tin nhắn!" };
    }
  };
  // --- Trả về ---
  return {
    isLoadingSessions,
    isLoadingMessages,
    filteredSessions,
    currentSessionId,
    currentSessionInfo,
    messages,
    newMessage,
    searchTerm,
    updateChatSessionStatus,

    // State Setters
    setNewMessage,
    setSearchTerm,

    // Handlers
    handleSelectSession,
    handleSendMessage,
    handleKeyDown,
    deleteChatSessions,
    deleteMessages,
    // Ref
    messagesEndRef,
  };
};
