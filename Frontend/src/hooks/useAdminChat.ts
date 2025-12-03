import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { MessageData } from "@/types/message";
import {
    connectAdminSocket,
    disconnectAdmin,
    getChatHistory,
    sendMessage,
    getAllChatHistory,
    updateChatSession,
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

                // Nếu đang xem session này, cập nhật currentSessionInfo
                // (currentSessionInfo sẽ tự động cập nhật qua useMemo)
                return; // Không xử lý thêm cho session_update
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
                        image: data.image && data.image.length > 0 ? data.image[0] : null,
                    };
                    setMessages((prevMessages) => [...prevMessages, messageData]);
                    console.log("Đã thêm tin nhắn vào UI:", messageData);
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
                String(session.chat_session_id)
                    .includes(searchTerm.toLowerCase()) ||
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
    const handleSendMessage = useCallback(() => {
        const trimmedMessage = newMessage.trim();
        if (trimmedMessage && currentSessionId) {
            // (5) Thêm Optimistic UI
            const optimisticMessage: MessageData = {
                id: String(Date.now()),
                chat_session_id: String(currentSessionId),
                sender_type: "admin",
                content: trimmedMessage,
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, optimisticMessage]);

            // Gửi tin nhắn qua WebSocket
            sendMessage(String(currentSessionId), "admin", trimmedMessage, true, null);

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
        updateChatSessionStatus,

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
