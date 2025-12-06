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

            // Xử lý sự kiện cập nhật session (từ admin khác)
            if (data.type === "session_update") {
                console.log("Nhận sự kiện cập nhật session:", data);

                setChatSessions((prevSessions) => {
                    const sessionId = Number(data.chat_session_id);
                    const sessionIndex = prevSessions.findIndex(
                        (s) => s.chat_session_id === sessionId
                    );

                    if (sessionIndex > -1) {
                        const updatedSession: ChatSession = {
                            ...prevSessions[sessionIndex],
                            status: data.session_status,
                            current_receiver: data.current_receiver,
                            previous_receiver: data.previous_receiver,
                            time: data.time,
                        };
                        const newSessionsList = [...prevSessions];
                        newSessionsList[sessionIndex] = updatedSession;
                        return newSessionsList;
                    }

                    return prevSessions;
                });

                return;
            }

            // Xử lý sự kiện xóa session
            if (data.type === "session_deleted") {
                console.log("Nhận sự kiện xóa session:", data);
                
                const deletedIds = data.deleted_ids || [data.chat_session_id];
                
                setChatSessions((prevSessions) => {
                    return prevSessions.filter(
                        (session) => !deletedIds.includes(session.chat_session_id)
                    );
                });

                // Nếu session đang xem bị xóa, reset về null
                if (deletedIds.includes(currentSessionIdRef.current || -1)) {
                    setCurrentSessionId(null);
                    setMessages([]);
                }

                return;
            }

            // Xử lý sự kiện xóa messages
            if (data.type === "messages_deleted_from_session") {
                console.log("Nhận sự kiện xóa messages:", data);
                
                const deletedMessageIds = data.deleted_message_ids || [];
                const sessionId = Number(data.chat_session_id);

                // Cập nhật messages nếu đang xem session này
                if (sessionId === currentSessionIdRef.current) {
                    setMessages((prevMessages) => {
                        const filtered = prevMessages.filter(
                            (message) => !deletedMessageIds.includes(message.id)
                        );
                        
                        // Cập nhật last_message của session ngay trong callback này
                        setChatSessions((prevSessions) => {
                            return prevSessions.map((session) => {
                                if (session.chat_session_id === sessionId) {
                                    if (filtered.length > 0) {
                                        const lastMsg = filtered[filtered.length - 1];
                                        return {
                                            ...session,
                                            last_message: lastMsg.content,
                                            last_updated: lastMsg.created_at,
                                        };
                                    } else {
                                        return {
                                            ...session,
                                            last_message: "",
                                        };
                                    }
                                }
                                return session;
                            });
                        });
                        
                        return filtered;
                    });
                } else {
                    // Nếu không đang xem session này, chỉ cập nhật session list
                    setChatSessions((prevSessions) => {
                        return prevSessions.map((session) => {
                            if (session.chat_session_id === sessionId) {
                                // Giữ nguyên last_message hoặc để trống nếu cần
                                return { ...session };
                            }
                            return session;
                        });
                    });
                }

                return;
            }

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
                        image: data.image && data.image.length > 0 ? data.image[0] : null,
                    };

                    // Kiểm tra tin nhắn đã tồn tại chưa để tránh duplicate
                    setMessages((prevMessages) => {
                        const exists = prevMessages.some(
                            (msg) =>
                                msg.id === messageData.id ||
                                (msg.content === messageData.content &&
                                    msg.sender_type === messageData.sender_type &&
                                    Math.abs(
                                        new Date(msg.created_at).getTime() -
                                        new Date(messageData.created_at).getTime()
                                    ) < 1000)
                        );

                        if (!exists) {
                            console.log("Đã thêm tin nhắn vào UI:", messageData);
                            return [...prevMessages, messageData];
                        }

                        return prevMessages;
                    });
                }
            }
            // Xử lý format cũ: data có session_id (từ getAllHistory format)
            else if (data.session_id !== undefined) {
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

                    // Cập nhật messages: xóa optimistic message và thêm message thật
                    setMessages((prevMessages) => {
                        // Xóa optimistic message nếu có (cùng content và sender_type)
                        const withoutOptimistic = prevMessages.filter(
                            (msg) =>
                                !(
                                    msg.isOptimistic &&
                                    msg.content === messageData.content &&
                                    msg.sender_type === messageData.sender_type
                                )
                        );

                        // Kiểm tra tin nhắn thật đã tồn tại chưa để tránh duplicate
                        const exists = withoutOptimistic.some(
                            (msg) =>
                                msg.content === messageData.content &&
                                msg.sender_type === messageData.sender_type &&
                                Math.abs(
                                    new Date(msg.created_at).getTime() -
                                    new Date(messageData.created_at).getTime()
                                ) < 1000
                        );

                        if (!exists) {
                            return [...withoutOptimistic, messageData];
                        }

                        return withoutOptimistic;
                    });
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
            const optimisticMessage = {
                id: Date.now(),
                chat_session_id: String(currentSessionId),
                sender_type: "admin" as const,
                content: trimmedMessage,
                created_at: new Date().toISOString(),
                image: imageUrls.length > 0 ? imageUrls : null,
                isOptimistic: true, // Flag để đánh dấu tin nhắn tạm thời
            };

            // Thêm tin nhắn tạm thời vào danh sách
            setMessages((prev) => [...prev, optimisticMessage]);

            // Scroll xuống để thấy tin nhắn mới
            setTimeout(() => scrollToBottom(), 100);

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

            // Cleanup URL objects sau một thời gian để tránh memory leak
            setTimeout(() => {
                imageUrls.forEach((url) => {
                    try {
                        URL.revokeObjectURL(url);
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                });
            }, 30000); // 30 giây
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
        [handleSendMessage]
    );

    const updateChatSessionStatus = async (
        sessionId: number,
        status: string,
        time: string
    ) => {
        try {
            // Chỉ gọi API, không cập nhật state trực tiếp
            // Socket event sẽ tự động cập nhật UI cho tất cả admin
            const res = await updateChatSession(String(sessionId), { status, time });
            return res;
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái phiên chat:", error);
            throw error;
        }
    };
    const deleteChatSessions = async (sessionIds: number[]) => {
        try {
            // Chỉ gọi API, socket event sẽ tự động cập nhật UI
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

    
    const deleteMessages = async (messageIds: number[]) => {
        if (!currentSessionId) {
            return { success: false, error: "Không có phiên chat được chọn!" };
        }

        try {
            // Chỉ gọi API, socket event sẽ tự động cập nhật UI
            const response = await deleteMess(messageIds, currentSessionId);
            if (response.status === 200) {
                return { success: true, count: messageIds.length };
            } else {
                return { success: false, error: "Xóa tin nhắn thất bại!" };
            }
        } catch (error) {
            console.error("Lỗi khi xóa tin nhắn:", error);
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
