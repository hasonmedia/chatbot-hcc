import { useState, useRef, useEffect } from "react"
import Header from "./Header"
import { X } from "lucide-react"
import ConversationItem from "./ConversationItem"

const Sidebar = ({
    conversations,
    selectedConversation,
    onSelectConversation,
    formatTime,
    getPlatformIcon,
    getStatusColor,
    getStatusText,
    isLoading,
    onDeleteConversations,
    // Thêm props cho responsive
    isMobile,
    isOpen,
    onClose,
    // Thêm props cho thông báo khách hàng
    customerInfoNotifications,
    hasNewCustomerInfo,
}) => {
    const [openMenu, setOpenMenu] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [isSelectMode, setIsSelectMode] = useState(false)
    const [selectedConversationIds, setSelectedConversationIds] = useState([])
    const menuRef = useRef(null)
    const handleOpenMenu = (convId, event) => {
        if (event) {
            event.stopPropagation()
        }
        setOpenMenu(openMenu === convId ? null : convId)
    }

    const handleCloseMenu = () => {
        setOpenMenu(null)
    }

    const handleSelectModeChange = (newMode, newSelectedIds = []) => {
        setIsSelectMode(newMode)
        setSelectedConversationIds(newSelectedIds)
        if (newMode) {
            setOpenMenu(null)
        }
    }

    const handleToggleConversationSelection = (convId) => {
        console.log("🔄 Toggling conversation selection:", convId)

        const newSelected = selectedConversationIds.includes(convId)
            ? selectedConversationIds.filter((id) => id !== convId)
            : [...selectedConversationIds, convId]

        console.log("📋 New selected conversations:", newSelected)
        setSelectedConversationIds(newSelected)

        if (menuRef.current && menuRef.current.updateSelection) {
            menuRef.current.updateSelection(newSelected)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openMenu && !event.target.closest(`[data-menu-id="${openMenu}"]`)) {
                handleCloseMenu()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [openMenu])

    useEffect(() => {
        if (!isMobile || !isOpen) return

        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('[data-sidebar="true"]')
            if (sidebar && !sidebar.contains(event.target)) {
                onClose && onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isMobile, isOpen, onClose])

    const defaultFormatTime = (date) => {
        if (!date) return "Vừa xong"
        const now = new Date()
        const diff = now - new Date(date)
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Vừa xong"
        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        return `${days} ngày trước`
    }

    const timeFormatter = formatTime || defaultFormatTime

    // Responsive classes
    const sidebarClasses = `
        ${isMobile
            ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
            } w-80 max-w-[85vw]`
            : "w-full lg:w-80 max-w-sm lg:max-w-none"
        }
        bg-white border-r border-gray-200 overflow-hidden flex flex-col h-full
    `
    return (
        <>
            <style jsx>{`
                @keyframes pulse-notification {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                .notification-pulse {
                    animation: pulse-notification 1.5s infinite;
                }
                .notification-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: #ef4444;
                    border: 2px solid white;
                    border-radius: 50%;
                    animation: pulse-notification 2s infinite;
                }
            `}</style>

            {/* Overlay cho mobile */}
            {isMobile && isOpen && <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />}

            <div className={sidebarClasses} data-sidebar="true">
                {/* Close button cho mobile - đặt ở góc trên phải */}
                {isMobile && (
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            aria-label="Đóng sidebar"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                )}

                {/* Header với padding để tránh đè lên nút close */}
                <div className={isMobile ? "pr-16" : ""}>
                    <Header
                        conversations={conversations}
                        searchTerm={searchTerm}
                        selectedCategory={selectedCategory}
                        setSearchTerm={setSearchTerm}
                        setSelectedCategory={setSelectedCategory}
                        onDeleteConversations={onDeleteConversations}
                        ref={menuRef}
                        onSelectModeChange={handleSelectModeChange}
                        isSelectMode={isSelectMode}
                        selectedConversationIds={selectedConversationIds}
                        isMobile={isMobile}
                    />
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        <div>
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse border-b border-gray-100 p-3">
                                    <div className="flex space-x-3">
                                        <div className="rounded-full bg-gray-300 w-12 h-12"></div>
                                        <div className="flex-1 space-y-2 py-1">
                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                            <div className="flex gap-1 mt-2">
                                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="text-right py-1">
                                            <div className="h-3 bg-gray-300 rounded w-12"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-12 px-4 text-gray-500">
                            <div className="text-4xl mb-3">💬</div>
                            <p className="text-sm">Chưa có cuộc hội thoại nào</p>
                        </div>
                    ) : (
                        conversations.map((conv, index) => {
                            const convId = conv.session_id || conv.id || index
                            const isSelected = selectedConversation?.session_id === conv.session_id
                            const isMenuOpen = openMenu === convId

                            const isSelectedForDeletion = isSelectMode && selectedConversationIds.includes(convId)

                            const hasCustomerNotification = customerInfoNotifications && customerInfoNotifications.has(conv.session_id)

                            return (
                                <div
                                    key={convId}
                                    className={`relative ${hasCustomerNotification ? 'notification-pulse' : ''
                                        }`}
                                    style={{
                                        backgroundColor: hasCustomerNotification ? '#fef2f2' : 'transparent'
                                    }}
                                >
                                    {hasCustomerNotification && (
                                        <div className="notification-dot"></div>
                                    )}

                                    <ConversationItem
                                        conv={conv}
                                        convId={convId}
                                        index={index}
                                        isSelected={isSelected}
                                        isSelectMode={isSelectMode}
                                        timeFormatter={timeFormatter}
                                        isSelectedForDeletion={isSelectedForDeletion}
                                        isMenuOpen={isMenuOpen}
                                        onSelectConversation={onSelectConversation}
                                        handleToggleConversationSelection={handleToggleConversationSelection}
                                        handleOpenMenu={handleOpenMenu}
                                        handleCloseMenu={handleCloseMenu}
                                        isMobile={isMobile}
                                        conversations={conversations}
                                        hasCustomerNotification={hasCustomerNotification}
                                    />
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </>
    )
}

export default Sidebar
