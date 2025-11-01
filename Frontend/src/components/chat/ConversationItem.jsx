import { useEffect } from "react"
import { Plus, Tag } from "lucide-react"
const getChannelColor = (channel) => {
    switch (channel) {
        case "web":
            return "bg-gradient-to-br from-green-400 to-green-500 group-hover:from-green-500 group-hover:to-green-600";
        case "facebook":
            return "bg-gradient-to-br from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-600";
        case "zalo":
            return "bg-gradient-to-br from-sky-400 to-sky-500 group-hover:from-sky-500 group-hover:to-sky-600";
        case "telegram":
            return "bg-gradient-to-br from-indigo-400 to-indigo-500 group-hover:from-indigo-500 group-hover:to-indigo-600";
        default:
            return "bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-gray-500 group-hover:to-gray-600";
    }
};

const ConversationAvatar = ({ conv, isSelected, hasCustomerNotification }) => (
    <div className="relative flex-shrink-0">
        <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-base transition-all shadow-sm ${hasCustomerNotification
                ? "bg-gradient-to-br from-red-400 to-red-500 group-hover:from-red-500 group-hover:to-red-600"
                : getChannelColor(conv.channel, isSelected)
                }`}
        >
            {(conv.name || conv.full_name || "K")?.charAt(0)?.toUpperCase() || "?"}
        </div>
    </div>
);

const SelectModeCheckbox = ({ isSelectedForDeletion, onToggle }) => (
    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
        <div
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${isSelectedForDeletion
                ? "bg-red-500 border-red-500 text-white scale-110"
                : "border-gray-300 hover:border-red-400 bg-white"
                }`}
            onClick={(e) => {
                e.stopPropagation()
                onToggle()
            }}
        >
            {isSelectedForDeletion && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
    </div>
)

const ConversationContent = ({
    conv,
    isSelectMode,
    isSelectedForDeletion,
    isSelected,
    timeFormatter,
    displayConversations,
    hasCustomerNotification
}) => {
    const getTextColor = () => {
        if (isSelectMode) {
            return isSelectedForDeletion ? "text-red-900" : "text-gray-900"
        }
        return isSelected ? "text-blue-900 font-semibold" : "text-gray-900"
    }

    const getMessageColor = () => {
        if (isSelectMode) {
            return isSelectedForDeletion ? "text-red-600" : "text-gray-600"
        }
        return isSelected ? "text-blue-700" : "text-gray-600"
    }

    const getTimeColor = () => {
        if (isSelectMode) {
            return isSelectedForDeletion ? "text-red-500" : "text-gray-500"
        }
        return isSelected ? "text-blue-600" : "text-gray-500"
    }
    return (
        <div className="flex-1 min-w-0 relative">
            {/* Header - Name with customer info indicator */}
            <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 flex-1">
                    <h3
                        className={`font-medium truncate text-base transition-colors ${getTextColor()}`}
                    >
                        {conv.name || conv.full_name || "Khách hàng"}
                    </h3>
                    {/* Indicator thông tin khách hàng mới */}
                    {hasCustomerNotification && (
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                                📋 Info
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="mb-2">
                <p className={`text-sm transition-colors ${getMessageColor()}`}>
                    {(() => {
                        // Parse JSON nếu là bot message
                        if (conv.content) {
                            try {
                                const data = JSON.parse(conv.content);
                                const message = data.message || conv.content;
                                return message.length > 50
                                    ? message.slice(0, 50) + "..."
                                    : message;
                            } catch (e) {
                                // Fallback nếu không parse được JSON
                                return conv.content.length > 50
                                    ? conv.content.slice(0, 50) + "..."
                                    : conv.content;
                            }
                        }
                        return "Chưa có tin nhắn";
                    })()}
                </p>
            </div>

            {/* Selected status in select mode */}
            {isSelectMode && isSelectedForDeletion && (
                <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></div>
                        Đã chọn
                    </span>
                </div>
            )}

            <div className="absolute bottom-0 right-0 text-right">
                <span className={`text-xs transition-colors ${getTimeColor()}`}>
                    {timeFormatter(conv.created_at)}
                </span>
            </div>
        </div>
    )
}

// Main Component
const ConversationItem = ({
    conv,
    convId,
    index,
    isSelected,
    isSelectMode,
    isSelectedForDeletion,
    isMenuOpen,
    timeFormatter,
    onSelectConversation,
    handleToggleConversationSelection,
    handleOpenMenu,
    handleCloseMenu,
    displayConversations,
    hasCustomerNotification
}) => {
    const getCardStyles = () => {
        const baseStyles = "relative group transition-all duration-200 cursor-pointer border-b border-gray-100 "
        const zIndex = isMenuOpen ? "z-[10000]" : "z-10"

        let backgroundStyles
        if (isSelectMode) {
            backgroundStyles = isSelectedForDeletion ? "bg-red-50 hover:bg-red-100" : "bg-white hover:bg-gray-50"
        } else {
            backgroundStyles = isSelected ? "bg-blue-50 border-blue-100" : "bg-white hover:bg-gray-50"
        }

        return `${baseStyles} ${zIndex} ${backgroundStyles}`
    }
    const handleClick = () => {
        if (isSelectMode) {
            handleToggleConversationSelection(convId)
        } else {
            onSelectConversation?.(conv)
        }
    }

    const handleOpenMenuClick = (e) => {
        e.stopPropagation()
        handleOpenMenu(convId, e)
    }

    return (
        <div key={convId} data-menu-id={convId} className={getCardStyles()} style={{ animationDelay: `${index * 30}ms` }}>
            {/* Main Content Area - Zalo Style */}
            <div className="relative p-4" onClick={handleClick}>
                <div className="flex items-start space-x-3">
                    {/* Left Side - Avatar or Checkbox */}
                    {isSelectMode ? (
                        <SelectModeCheckbox
                            isSelectedForDeletion={isSelectedForDeletion}
                            onToggle={() => handleToggleConversationSelection(convId)}
                        />
                    ) : (
                        <ConversationAvatar conv={conv} isSelected={isSelected} hasCustomerNotification={hasCustomerNotification} />
                    )}

                    {/* Content */}
                    <ConversationContent
                        conv={conv}
                        isSelectMode={isSelectMode}
                        isSelectedForDeletion={isSelectedForDeletion}
                        isSelected={isSelected}
                        timeFormatter={timeFormatter}
                        displayConversations={displayConversations}
                        hasCustomerNotification={hasCustomerNotification}
                    />
                </div>
            </div>
        </div>
    )
}

export default ConversationItem
