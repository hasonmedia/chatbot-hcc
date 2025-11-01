import { useState, useEffect, useRef } from "react";
import {
    sendMessage,
    getChatHistory,
    getAllChatHistory,
    connectAdminSocket,
    disconnectAdmin,
} from "../../services/messengerService";
import Sidebar from "../../components/chat/Sidebar";
import MainChat from "../../components/chat/MainChat";
import { RightPanel } from "../../components/chat/RightPanel";
import { Menu, X, Info } from "lucide-react";

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [imagePreview, setImagePreview] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State cho pagination
    const [page, setPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    // State cho thông báo khách hàng - lấy từ database
    const [customerInfoNotifications, setCustomerInfoNotifications] = useState(new Set());
    const [hasNewCustomerInfo, setHasNewCustomerInfo] = useState(false);

    // Simplified responsive state
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);

    const selectedConversationRef = useRef(null);
    const formatTime = (date) => {
        if (!date) return "";
        const now = new Date();
        const messageTime = new Date(date);
        const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

        if (diffInMinutes < 1) return "Vừa xong";
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
    };

    const formatMessageTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Screen size detection
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);

            // Auto close panels on mobile when screen becomes desktop
            if (!mobile) {
                setSidebarOpen(false);
                setRightPanelOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Panel handlers
    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
        // Close right panel when opening sidebar on mobile
        if (!sidebarOpen && isMobile) {
            setRightPanelOpen(false);
        }
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
    };

    const handleToggleRightPanel = () => {
        setRightPanelOpen(!rightPanelOpen);
        // Close sidebar when opening right panel on mobile
        if (!rightPanelOpen && isMobile) {
            setSidebarOpen(false);
        }
    };

    const handleCloseRightPanel = () => {
        setRightPanelOpen(false);
    };

    const handleSelectConversationWithClose = async (conv) => {
        await handleSelectConversation(conv);
        console.log("🔍 DEBUG: Chọn conversation:", conv.session_id);
        if (isMobile) {
            setSidebarOpen(false);
            setRightPanelOpen(false);
        }
    };    // ✅ Hàm xử lý thông báo khách hàng (gọi từ MainChat)
    const handleProcessCustomerNotification = async (conversationId) => {
        console.log("🗑️ Xử lý thông báo cho conversation:", conversationId);

        if (customerInfoNotifications.has(conversationId)) {
            try {
                // ✅ Cập nhật database trước
                const { updateAlertStatus } = await import("../../services/messengerService");
                await updateAlertStatus(conversationId, false);

                // ✅ Sau đó cập nhật UI
                setCustomerInfoNotifications(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(conversationId);
                    console.log("🔔 customerInfoNotifications sau khi xử lý:", newSet);

                    // Cập nhật hasNewCustomerInfo dựa trên newSet
                    setHasNewCustomerInfo(newSet.size > 0);

                    return newSet;
                });

                // Xóa flag hasNewInfo khỏi conversation và cập nhật alert trong local state
                setConversations(prev =>
                    prev.map(c =>
                        c.session_id === conversationId
                            ? { ...c, hasNewInfo: false, alert: "false" }
                            : c
                    )
                );

                console.log("✅ Đã xử lý thông báo thành công cho conversation:", conversationId);
            } catch (error) {
                console.error("❌ Lỗi khi cập nhật alert status:", error);
                alert("Có lỗi xảy ra khi xử lý thông báo!");
            }
        }
    };

    // ✅ Hàm riêng để handle messages update (chỉ cập nhật messages)
    const handleMessagesUpdate = (updatedMessages) => {
        console.log("📝 Updating messages:", updatedMessages.length);
        setMessages(updatedMessages);

        // Cập nhật số lượng tin nhắn trong conversations nếu cần
        if (selectedConversation) {
            setConversations(prev =>
                prev.map(conv =>
                    conv.session_id === selectedConversation.session_id
                        ? { ...conv, messageCount: updatedMessages.length }
                        : conv
                )
            );
        }
    };

    // ✅ Hàm riêng để handle conversations update
    const handleConversationsUpdate = (updatedConversations) => {
        console.log("📋 Updating conversations:", updatedConversations.length);
        setConversations(updatedConversations);
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                setIsLoading(true);
                const data = await getAllChatHistory();
                setConversations(Array.isArray(data) ? data : []);

                // ✅ Khởi tạo thông báo từ database
                const alertConversations = data.filter(conv => conv.alert === "true" || conv.alert === true);
                const alertSessionIds = new Set(alertConversations.map(conv => conv.session_id));
                setCustomerInfoNotifications(alertSessionIds);
                setHasNewCustomerInfo(alertSessionIds.size > 0);

                console.log("🔔 Loaded conversations with alerts:", alertSessionIds);
            } catch (err) {
                setError("Không thể tải danh sách cuộc trò chuyện");
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, []);

    useEffect(() => {
        connectAdminSocket((msg) => {
            console.log("🔍 DEBUG: Nhận message từ WebSocket:", {
                type: msg.type,
                chat_session_id: msg.chat_session_id,
                content: msg.content,
                customer_data: !!msg.customer_data
            });

            // ✅ Xử lý sự kiện cập nhật thông tin khách hàng
            if (msg.type === 'customer_info_update') {

                setCustomerInfoNotifications(prevNotifications => {
                    const newSet = new Set([...prevNotifications, msg.chat_session_id]);
                    console.log('🔔 Updated customerInfoNotifications:', newSet);
                    return newSet;
                });
                setHasNewCustomerInfo(true);

                // ✅ Cập nhật conversation với customer_data và alert
                setConversations(prev => {
                    const existingConv = prev.find(conv => conv.session_id === msg.chat_session_id);

                    if (existingConv) {
                        return prev.map(conv =>
                            conv.session_id === msg.chat_session_id
                                ? {
                                    ...conv,
                                    customer_data: msg.customer_data,
                                    alert: "true",
                                    hasNewInfo: true
                                }
                                : conv
                        );
                    } else {
                        console.log('ℹ️ Conversation mới - thêm vào danh sách');
                        const newConversation = {
                            session_id: msg.chat_session_id,
                            customer_data: msg.customer_data,
                            alert: "true",
                            hasNewInfo: true,
                            created_at: new Date(),
                            name: msg.session_name || "Khách hàng mới",
                            status: "false",
                            platform: msg.platform || "web"
                        };
                        return [newConversation, ...prev];
                    }
                });

                return; // Dừng xử lý ở đây
            }

            setConversations((prev) => {

                let exists = false;
                let updated = prev.map((conv) => {
                    if (conv.session_id === msg.chat_session_id) {
                        exists = true;

                        // ✅ CHỈ cập nhật customer_data mà KHÔNG set hasNewInfo
                        if (msg.customer_data && !msg.content) {
                            console.log("📝 Cập nhật customer_data cho conversation:", msg.chat_session_id);
                            return {
                                ...conv,
                                customer_data: msg.customer_data,
                                // ❌ Bỏ dòng này: hasNewInfo: true
                            };
                        } else {
                            // ✅ Tin nhắn thông thường - KHÔNG set hasNewInfo
                            console.log("💬 Cập nhật tin nhắn thông thường cho conversation:", msg.chat_session_id);
                            return {
                                ...conv,
                                content: msg.content || prev.content,
                                created_at: new Date() || prev.created_at,
                                sender_type: msg.sender_type || prev.sender_type,
                                status: msg.session_status,
                                current_receiver: msg.current_receiver,
                                previous_receiver: msg.previous_receiver,
                                time: msg.time,
                                image: msg.image || []
                            };
                        }
                    }
                    return conv;
                });

                // Nếu chưa có conversation này thì thêm mới
                if (!exists) {
                    const newConversation = {
                        session_id: msg.chat_session_id,
                        content: msg.content,
                        created_at: new Date(),
                        name: msg.session_name,
                        status: msg.session_status,
                        platform: msg.platform || "web"
                        // ❌ KHÔNG thêm hasNewInfo: true cho conversation mới
                    };
                    updated = [newConversation, ...updated];
                }

                // Sort theo thời gian mới nhất lên đầu
                const sorted = updated.sort(
                    (a, b) => new Date(b.updatedAt || b.created_at) - new Date(a.updatedAt || a.created_at)
                );

                return sorted;
            });

            // --- Cập nhật MainChat ---
            if (msg.content) {
                setMessages((prev) => {
                    // ✅ Kiểm tra lại conversation_id để tránh race condition
                    if (selectedConversationRef.current?.session_id !== msg.chat_session_id) {
                        console.log(`⚠️ Bỏ qua message cho conversation ${msg.chat_session_id}, đang xem ${selectedConversationRef.current?.session_id}`);
                        return prev;
                    }

                    // ✅ Kiểm tra duplicate với các tin nhắn gần đây (2-3 tin nhắn cuối)
                    const recentMessages = prev.slice(-3);
                    const isDuplicate = recentMessages.some(existingMsg => {
                        // So sánh content và sender_type
                        if (existingMsg.content !== msg.content || existingMsg.sender_type !== msg.sender_type) {
                            return false;
                        }

                        // So sánh thời gian (cho phép chênh lệch < 2 giây)
                        const existingTime = new Date(existingMsg.created_at).getTime();
                        const msgTime = new Date(msg.created_at).getTime();
                        const timeDiff = Math.abs(existingTime - msgTime);

                        return timeDiff < 2000; // 2 giây
                    });

                    if (isDuplicate) {
                        console.log("⚠️ Bỏ qua tin nhắn duplicate:", msg.content?.substring(0, 30));
                        return prev;
                    }

                    // ✅ Push message và scroll xuống
                    console.log(`✅ Thêm message vào conversation ${msg.chat_session_id}`);
                    setShouldScrollToBottom(true);
                    return [...prev, msg];
                });
            }
        });

        return () => disconnectAdmin();
    }, []);

    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    useEffect(() => {
        if (selectedConversation) {
            const updatedConversation = conversations.find(
                (conv) => conv.session_id === selectedConversation.session_id
            );

            if (updatedConversation) {
                setSelectedConversation(updatedConversation);
            }
        }
    }, [conversations]);

    const handleSelectConversation = async (conv) => {
        try {
            console.log("🔍 Selecting conversation:", conv);
            setSelectedConversation(conv);
            setIsLoading(true);
            setError(null);

            const convId = conv.session_id;
            if (!convId) return;

            // ✅ Reset messages ngay lập tức để tránh hiển thị tin nhắn cũ
            setMessages([]);

            // ✅ Reset imagePreview để tránh hiển thị ảnh của conversation cũ
            setImagePreview([]);

            // ✅ Reset input nếu đang soạn tin nhắn
            setInput("");

            // Reset pagination states
            setPage(1);
            setHasMoreMessages(true);
            setIsLoadingMore(false);

            // Load chỉ 10 tin nhắn gần nhất
            const data = await getChatHistory(convId, 1, 10);
            setMessages(Array.isArray(data) ? data : []);

            // Kiểm tra xem còn tin nhắn cũ hơn không
            if (Array.isArray(data)) {
                setHasMoreMessages(data.length === 10);
            }

            // Cuộn xuống dưới khi chọn conversation mới
            setShouldScrollToBottom(true);

            console.log("✅ Loaded messages for conversation:", data.length);
        } catch (err) {
            setError("Không thể tải lịch sử chat");
            console.error("Error selecting conversation:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const newMessage = {
            id: Date.now(),
            content: input.trim(),
            image: [...imagePreview],
            sender_type: "admin",
            created_at: new Date(),
        };

        // Hiển thị tạm thời trong UI
        setMessages((prev) => [...prev, newMessage]);
        setShouldScrollToBottom(true);

        const messageContent = input.trim();
        const messageImage = imagePreview;
        setInput("");
        setImagePreview([]);

        try {
            await sendMessage(
                selectedConversation.session_id,
                "admin",
                messageContent,
                true,
                messageImage
            );
        } catch (err) {
            // rollback nếu lỗi
            setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id));
            setError("Không thể gửi tin nhắn");
            console.error("Error sending message:", err);

            // trả lại input và preview nếu fail
            setInput(messageContent);
            setImagePreview(messageImage);
        }
    };

    // ✅ Function để xóa multiple conversations
    const handleDeleteConversations = async (conversationIds) => {
        try {
            console.log("🗑️ Deleting conversations:", conversationIds);

            const { deleteSessionChat } = await import("../../services/messengerService");

            await deleteSessionChat(conversationIds);

            setConversations(prev =>
                prev.filter(conv => !conversationIds.includes(conv.session_id || conv.id))
            );

            if (
                selectedConversation &&
                conversationIds.includes(selectedConversation.session_id || selectedConversation.id)
            ) {
                setSelectedConversation(null);
                setMessages([]);
            }

            console.log("✅ Deleted conversations successfully");
        } catch (error) {
            console.error("❌ Error deleting conversations:", error);
            throw error;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 relative">
            {/* Error notification */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50 shadow-lg max-w-xs">
                    <div className="text-sm">{error}</div>
                    <button
                        onClick={() => setError(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Mobile Controls */}
            {isMobile && (
                <>
                    {!sidebarOpen && (
                        <div className="fixed top-4 left-4 z-50">
                            <button
                                onClick={handleToggleSidebar}
                                className="p-3 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                                aria-label="Mở danh sách"
                            >
                                <Menu size={20} className="text-gray-700" />
                            </button>
                        </div>
                    )}

                    {/* Info button for Right Panel */}
                    {selectedConversation && (
                        <div className="fixed top-4 right-4 z-50">
                            <button
                                onClick={handleToggleRightPanel}
                                className="p-3 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
                                aria-label={rightPanelOpen ? "Đóng thông tin" : "Xem thông tin"}
                            >
                                {rightPanelOpen ? (
                                    <X size={20} className="text-gray-700" />
                                ) : (
                                    <Info size={20} className="text-gray-700" />
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Overlay for mobile */}
            {isMobile && (sidebarOpen || rightPanelOpen) && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => {
                        setSidebarOpen(false);
                        setRightPanelOpen(false);
                    }}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    ${isMobile
                        ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out'
                        : 'relative'
                    }
                    ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
                    ${isMobile ? 'w-80 max-w-[85vw]' : 'w-auto'}
                `}
            >
                <Sidebar
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversationWithClose}
                    formatTime={formatTime}
                    getPlatformIcon={() => null}
                    getStatusColor={() => "gray"}
                    getStatusText={() => ""}
                    isLoading={isLoading}
                    onDeleteConversations={handleDeleteConversations}
                    // Pass responsive props
                    isMobile={isMobile}
                    isOpen={isMobile ? sidebarOpen : true}
                    onClose={handleCloseSidebar}
                    // Thêm props cho thông báo khách hàng
                    customerInfoNotifications={customerInfoNotifications}
                    hasNewCustomerInfo={hasNewCustomerInfo}
                />
            </div>

            {/* Main Chat */}
            <div className={`flex-1 min-w-0 ${isMobile ? 'w-full' : ''}`}>
                <MainChat
                    selectedConversation={selectedConversation}
                    onUpdateConversation={setSelectedConversation}
                    messages={messages}
                    input={input}
                    setInput={setInput}
                    imagePreview={imagePreview}
                    setImagePreview={setImagePreview}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    formatMessageTime={formatMessageTime}
                    onMessagesUpdate={handleMessagesUpdate}
                    onConversationsUpdate={handleConversationsUpdate}
                    isMobile={isMobile}
                    // Props cho pagination
                    page={page}
                    setPage={setPage}
                    hasMoreMessages={hasMoreMessages}
                    setHasMoreMessages={setHasMoreMessages}
                    isLoadingMore={isLoadingMore}
                    setIsLoadingMore={setIsLoadingMore}
                    shouldScrollToBottom={shouldScrollToBottom}
                    setShouldScrollToBottom={setShouldScrollToBottom}
                    // Prop cho xử lý thông báo
                    onProcessCustomerNotification={handleProcessCustomerNotification}
                />
            </div>

            {/* Right Panel */}
            {selectedConversation && (
                <div
                    className={`
                        ${isMobile
                            ? 'fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out'
                            : 'relative'
                        }
                        ${isMobile && !rightPanelOpen ? 'translate-x-full' : 'translate-x-0'}
                        ${isMobile ? 'w-80 max-w-[85vw]' : 'w-auto'}
                    `}
                >
                    <RightPanel
                        selectedConversation={selectedConversation}
                        isMobile={isMobile}
                        isOpen={isMobile ? rightPanelOpen : true}
                        onClose={handleCloseRightPanel}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatPage;