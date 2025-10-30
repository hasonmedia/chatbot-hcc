import React, { useState, useEffect, useRef } from "react";
import ManualModeModal from "../ManualModeModal";
import { updateStatus, deleteMess } from "../../services/messengerService";
import { ImageIcon, XIcon } from "lucide-react";
import normalizeCustomer from "../../utils/normalizeCustomer";
const MainChat = ({
    selectedConversation,
    onUpdateConversation,
    messages,
    input,
    setInput,
    onSendMessage,
    isLoading,
    formatMessageTime,
    onMessagesUpdate,
    imagePreview,
    setImagePreview,
    // Props cho pagination
    page,
    setPage,
    hasMoreMessages,
    setHasMoreMessages,
    isLoadingMore,
    setIsLoadingMore,
    shouldScrollToBottom,
    setShouldScrollToBottom,
    // Prop cho xử lý thông báo
    onProcessCustomerNotification
}) => {
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const [mode, setMode] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSelectMode, setIsSelectMode] = useState(false);
    // Modal phóng to ảnh
    const [zoomImage, setZoomImage] = useState(null);

    // Cuộn xuống dưới chỉ khi cần thiết (tin nhắn mới hoặc lần đầu load)
    useEffect(() => {
        if (shouldScrollToBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            setShouldScrollToBottom(false);
        }
    }, [messages, shouldScrollToBottom, setShouldScrollToBottom]);

    // Load thêm tin nhắn khi scroll lên đầu
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container || !selectedConversation) return;

        const handleScroll = async () => {
            if (container.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
                setIsLoadingMore(true);
                const prevScrollHeight = container.scrollHeight;

                try {
                    const newPage = page + 1;
                    const { getChatHistory } = await import("../../services/messengerService");
                    const olderMessages = await getChatHistory(selectedConversation.session_id, newPage, 10);

                    if (olderMessages && olderMessages.length > 0) {
                        // ✅ Sử dụng functional update để tránh stale closure
                        onMessagesUpdate((prevMessages) => [...olderMessages, ...prevMessages]);
                        setPage(newPage);

                        // Kiểm tra xem còn tin nhắn cũ hơn không
                        if (olderMessages.length < 10) {
                            setHasMoreMessages(false);
                        }

                        // Giữ vị trí scroll
                        setTimeout(() => {
                            const newScrollHeight = container.scrollHeight;
                            container.scrollTop = newScrollHeight - prevScrollHeight;
                        }, 50);
                    } else {
                        setHasMoreMessages(false);
                    }
                } catch (error) {
                    console.error("Error loading more messages:", error);
                } finally {
                    setIsLoadingMore(false);
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [selectedConversation, page, hasMoreMessages, isLoadingMore, onMessagesUpdate, setPage, setHasMoreMessages, setIsLoadingMore]); // ✅ Bỏ messages khỏi dependency để tránh re-register listener

    // Reset selection when conversation changes (but keep conversation selected)
    useEffect(() => {
        setSelectedIds([]);
        setIsSelectMode(false);
        setMode(null); // ✅ Reset mode
        setZoomImage(null); // ✅ Đóng modal ảnh nếu đang mở
        // Don't reset imagePreview here - it's handled by parent component
        // Don't reset mode when conversation changes - only reset selection states
    }, [selectedConversation?.id]);

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedIds(prev =>
            prev.length === messages.length ? [] : messages.map(msg => msg.id)
        );
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return;

        const confirmed = window.confirm(
            `Bạn có chắc chắn muốn xóa ${selectedIds.length} tin nhắn đã chọn?`
        );

        if (!confirmed) return;

        try {
            await deleteMess(selectedIds, selectedConversation.session_id);

            // Reset selection state BEFORE calling parent update
            setSelectedIds([]);
            setIsSelectMode(false);

            // Update parent component with filtered messages
            const updatedMessages = messages.filter(msg => !selectedIds.includes(msg.id));
            onMessagesUpdate(updatedMessages);

            alert("Đã xóa tin nhắn thành công!");
        } catch (error) {
            console.error("Error deleting messages:", error);
            alert("Có lỗi xảy ra khi xóa tin nhắn!");
        }
    };

    const cancelSelectMode = () => {
        setIsSelectMode(false);
        setSelectedIds([]);
    };

    const handleModeChange = async (newMode) => {
        try {
            let config;

            if (newMode === "bot") {
                config = { status: "true" };
                setMode("bot");
            } else {
                // Manual mode
                const minutes = newMode === 'manual-only' ? 0 :
                    newMode === '1-hour' ? 60 :
                        newMode === '4-hour' ? 240 :
                            newMode === '8am-tomorrow'
                                ? Math.max(0, Math.ceil((new Date(new Date().setHours(8, 0, 0, 0) + 24 * 60 * 60 * 1000) - new Date()) / 60000))
                                : 30;

                const targetTime = new Date();
                targetTime.setMinutes(targetTime.getMinutes() + minutes);

                config = {
                    status: "false",
                    time: targetTime.toLocaleString()
                };
                setMode("manual");
            }

            await updateStatus(selectedConversation.session_id, config);

            onUpdateConversation({
                ...selectedConversation,
                status: config.status.toString(),
                time: config.time
            });

            alert(`Đã chuyển sang chế độ ${newMode === "bot" ? "tự động" : "thủ công"}`);
        } catch (error) {
            console.error("Error updating mode:", error);
            alert("Có lỗi xảy ra khi thay đổi chế độ!");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessageCustom();
        }
        // Shift+Enter để xuống dòng - không cần xử lý gì thêm, để textarea tự xử lý
    };

    // Auto-resize textarea
    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
        }
    };

    // Handle input change with auto-resize
    const handleInputChange = (e) => {
        setInput(e.target.value);
        adjustTextareaHeight();
    };

    // Logic gửi tin nhắn theo 3 trường hợp
    const handleSendMessageCustom = () => {
        // Nếu chỉ có ảnh, không có text
        if (imagePreview.length > 0 && !input.trim()) {
            onSendMessage();
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = '42px';
            }
            return;
        }
        // Nếu chỉ có text, không có ảnh
        if (input.trim() && imagePreview.length === 0) {
            onSendMessage();
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = '42px';
            }
            return;
        }
        // Nếu có cả ảnh và text
        if (input.trim() && imagePreview.length > 0) {
            onSendMessage();
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = '42px';
            }
            return;
        }
    };

    // Send Image
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newPreviews = [];

        files.forEach((file) => {
            if (file && file.type.startsWith("image/")) {

                if (file.size > 500 * 1024) {
                    alert(`Ảnh "${file.name}" vượt quá 500KB!`);
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result);

                    if (newPreviews.length === files.length) {
                        setImagePreview((prev) => [...prev, ...newPreviews]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    };

    const removeImage = (index) => {
        setImagePreview((prev) => prev.filter((_, i) => i !== index));
        if (fileInputRef.current && imagePreview.length === 1) {
            fileInputRef.current.value = "";
        }
    };


    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Chọn một cuộc trò chuyện
                    </h3>
                    <p className="text-sm text-gray-600">
                        Chọn cuộc trò chuyện từ sidebar để bắt đầu chat với khách hàng
                    </p>
                </div>
            </div>
        );
    }
    const customer = normalizeCustomer(selectedConversation.customer_data);
    return (
        <div className="flex-1 flex flex-col bg-white h-full">
            {/* Chat Header */}
            <header className="bg-white border-b border-gray-200 p-4">
                <div className="flex justify-between gap-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                            {selectedConversation.name?.charAt(0).toUpperCase() || "?"}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 text-base truncate">
                                {selectedConversation.name || "Khách hàng"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Tên khách hàng: {customer?.name || "Chưa có thông tin"}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        {!isSelectMode ? (
                            <>
                                <button
                                    onClick={() => setMode("manual")}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === "manual"
                                        ? "bg-yellow-500 text-white"
                                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                        }`}
                                >
                                    Thủ công
                                </button>
                                <button
                                    onClick={() => handleModeChange("bot")}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${mode === "bot"
                                        ? "bg-green-500 text-white"
                                        : "bg-green-100 text-green-700 hover:bg-green-200"
                                        }`}
                                >
                                    Bot
                                </button>
                                <button
                                    onClick={() => setIsSelectMode(true)}
                                    disabled={messages.length === 0}
                                    className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Xóa tin nhắn
                                </button>
                                <button
                                    onClick={() => {
                                        const confirmed = window.confirm("Bạn có chắc chắn đã tiếp nhận xong thông tin khách hàng này chưa?");
                                        if (confirmed && onProcessCustomerNotification) {
                                            onProcessCustomerNotification(selectedConversation.session_id);
                                        }
                                    }}
                                    disabled={messages.length === 0}
                                    className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Tiếp nhận
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 flex-wrap w-full">
                                <span className="text-sm text-gray-600">
                                    Đã chọn: {selectedIds.length}/{messages.length}
                                </span>
                                <div className="flex gap-2 ml-auto">
                                    <button
                                        onClick={selectAll}
                                        className="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm transition-colors"
                                    >
                                        {selectedIds.length === messages.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={selectedIds.length === 0}
                                        className="px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 rounded text-sm transition-colors disabled:opacity-50"
                                    >
                                        Xóa ({selectedIds.length})
                                    </button>
                                    <button
                                        onClick={cancelSelectMode}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {mode === "manual" && (
                        <ManualModeModal
                            onClose={() => setMode(null)}
                            onConfirm={handleModeChange}
                        />
                    )}

                </div>

            </header>

            {/* Select Mode Banner */}
            {
                isSelectMode && (
                    <div className="bg-red-50 border-b border-red-200 p-2">
                        <p className="text-sm text-red-700 text-center">
                            Chế độ xóa tin nhắn - Nhấp vào tin nhắn để chọn
                        </p>
                    </div>
                )
            }

            {/* Messages Area */}
            <main ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-gray-50 p-4">
                {/* Loading More Messages */}
                {isLoadingMore && (
                    <div className="flex justify-center py-2 mb-4">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-gray-500">Đang tải thêm tin nhắn...</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                            <span className="text-gray-600 text-sm">Đang tải tin nhắn...</span>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">💬</span>
                        </div>
                        <h4 className="text-lg font-semibold mb-2 text-gray-700">Chưa có tin nhắn nào</h4>
                        <p className="text-gray-500 text-center text-sm">
                            Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-4xl mx-auto">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === "admin" || msg.sender_type === "bot"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div className="flex items-end gap-2 max-w-xs sm:max-w-md lg:max-w-lg">
                                    {/* Customer Avatar */}
                                    {msg.sender_type !== "admin" && (
                                        <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 text-white">
                                            👤
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div
                                        className={`relative px-3 py-2 rounded-lg transition-colors ${msg.sender_type === "admin"
                                            ? "bg-blue-500 text-white"
                                            : "bg-white text-gray-800 border border-gray-200"
                                            } ${isSelectMode
                                                ? "cursor-pointer hover:ring-2 hover:ring-red-300"
                                                : ""
                                            } ${selectedIds.includes(msg.id)
                                                ? "ring-2 ring-red-500 bg-red-50 border-red-500"
                                                : ""
                                            }`}
                                        onClick={() => isSelectMode && toggleSelect(msg.id)}
                                    >
                                        {/* Selection Checkbox */}
                                        {isSelectMode && (
                                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-red-500 rounded flex items-center justify-center">
                                                {selectedIds.includes(msg.id) ? (
                                                    <span className="text-red-500 text-xs">✓</span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">○</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Sender Label */}
                                        <p className={`text-xs mb-1 ${selectedIds.includes(msg.id)
                                            ? "text-red-600"
                                            : msg.sender_type === "admin"
                                                ? "text-blue-100"
                                                : "text-gray-500"
                                            }`}>
                                            {msg.sender_type === "admin" ? "Admin" :
                                                msg.sender_type === "bot" ? "Bot" : "Khách hàng"}
                                        </p>
                                        {/* Image Display */}
                                        {msg.image && msg.image.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {msg.image.map((img, index) => (
                                                    <img
                                                        key={index}
                                                        src={img}
                                                        alt={`msg-img-${index}`}
                                                        className="w-32 h-32 object-cover rounded border cursor-pointer"
                                                        onClick={() => setZoomImage(img)}
                                                        onError={(e) => {
                                                            e.target.style.display = "none";
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {/* Message Content */}
                                        {(() => {
                                            // Parse JSON nếu là bot message
                                            if (msg.sender_type === 'bot' && msg.content) {
                                                try {
                                                    const data = JSON.parse(msg.content);
                                                    return (
                                                        <>
                                                            <p className={`text-sm break-words whitespace-pre-line ${selectedIds.includes(msg.id)
                                                                ? "text-red-800"
                                                                : "text-gray-800"
                                                                }`}>
                                                                {data.message}
                                                            </p>
                                                            {data.links && data.links.length > 0 && (
                                                                <div className="mt-2 space-y-1.5">
                                                                    {data.links.map((link, idx) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={link}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-xs text-blue-600 hover:text-blue-700 border border-blue-200"
                                                                        >
                                                                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                            </svg>
                                                                            <span className="truncate font-medium">{link}</span>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                } catch (e) {
                                                    // Fallback nếu không parse được JSON
                                                    return (
                                                        <p className={`text-sm break-words ${selectedIds.includes(msg.id)
                                                            ? "text-red-800"
                                                            : "text-gray-800"
                                                            }`}>
                                                            {msg.content}
                                                        </p>
                                                    );
                                                }
                                            }
                                            // Message thông thường (customer, admin)
                                            return (
                                                <p className={`text-sm break-words whitespace-pre-line ${selectedIds.includes(msg.id)
                                                    ? "text-red-800"
                                                    : msg.sender_type === "admin"
                                                        ? "text-white"
                                                        : "text-gray-800"
                                                    }`}>
                                                    {msg.content}
                                                </p>
                                            );
                                        })()}

                                        {/* Timestamp */}
                                        <p className={`text-xs mt-1 ${selectedIds.includes(msg.id)
                                            ? "text-red-600"
                                            : msg.sender_type === "admin"
                                                ? "text-blue-100"
                                                : "text-gray-500"
                                            }`}>
                                            {formatMessageTime(msg.created_at)}
                                        </p>
                                    </div>

                                    {/* Admin Avatar */}
                                    {msg.sender_type === "admin" && (
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                                            👨‍💼
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Input Area */}
            <footer className="bg-white border-t border-gray-200 p-4">
                {imagePreview.length > 0 && (
                    <div className="max-w-4xl mx-auto mb-3 flex gap-2 flex-wrap">
                        {imagePreview.map((img, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={img}
                                    alt={`Preview ${index}`}
                                    className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer"
                                    onClick={() => setZoomImage(img)}
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded bg-red-500 flex items-center justify-center text-white hover:bg-red-600"
                                    type="button"
                                >
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 max-w-4xl mx-auto items-end">
                    <div className="flex-1">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyPress}
                            placeholder="Nhập tin nhắn... (Shift+Enter để xuống dòng)"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-500 text-sm resize-none min-h-[42px] max-h-32 overflow-y-auto"
                            disabled={isLoading || isSelectMode}
                            rows={1}
                            style={{
                                height: 'auto',
                                minHeight: '42px',
                            }}
                        />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        multiple
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        disabled={isSelectMode}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleSendMessageCustom}
                        disabled={isLoading || (!input.trim() && imagePreview.length === 0) || isSelectMode}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="text-sm">Gửi</span>
                    </button>
                </div>
                {/* Modal phóng to ảnh */}
                {zoomImage && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                        onClick={() => setZoomImage(null)}
                    >
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src={zoomImage}
                                alt="Zoom"
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                                onClick={() => setZoomImage(null)}
                            >
                                <XIcon className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                    </div>
                )}
            </footer>
        </div >
    );
};

export default MainChat;