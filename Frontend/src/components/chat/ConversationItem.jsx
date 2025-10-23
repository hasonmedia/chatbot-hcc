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
    tags,
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

    // Lấy thông tin tag theo tên
    const getTagInfoByName = (tagName) => {
        return tags?.find((tag) => tag.name === tagName) || null
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
                    {conv.content && conv.content.length > 30
                        ? conv.content.slice(0, 30) + "..."
                        : conv.content || "Chưa có tin nhắn"}
                </p>
            </div>

            {/* Tags - Zalo style chấm màu + tooltip */}
            {!isSelectMode && conv.tag_names && conv.tag_names.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {conv.tag_names.map((tagName, index) => {
                        const tagInfo = getTagInfoByName(tagName)
                        if (!tagInfo) return null

                        return (
                            <div key={index} className="relative group/tag">
                                <div
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg relative z-10"
                                    style={{ backgroundColor: tagInfo.color }}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/tag:opacity-100 transition-all duration-300 whitespace-nowrap z-[200] pointer-events-none shadow-lg">
                                    {tagInfo.name}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

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

const TagButton = ({ isMenuOpen, onOpenMenu }) => (
    <div className="flex-shrink-0 flex items-center justify-center">
        <button
            onClick={onOpenMenu}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 ${isMenuOpen
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 hover:shadow-sm"
                }`}
        >
            <Plus className={`w-4 h-4 transition-transform ${isMenuOpen ? "rotate-45" : ""}`} />
        </button>
    </div>
)

const TagSection = ({ isSelectMode, isMenuOpen, onOpenMenu }) => {
    if (isSelectMode) return null

    return <TagButton isMenuOpen={isMenuOpen} onOpenMenu={onOpenMenu} />
}

const TagDropdown = ({ isMenuOpen, tags, conv, onTagSelect, onCloseMenu }) => {
    if (!isMenuOpen) return null

    return (
        <div className="absolute top-full left-0 right-0 z-[9999] mt-2 pointer-events-auto">
            <div className="mx-4 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-800 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-500" />
                            Gắn thẻ
                        </h4>
                        <button
                            onClick={onCloseMenu}
                            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tags List */}
                <div className="max-h-60 overflow-y-auto">
                    {tags && tags.length > 0 ? (
                        <div className="p-2">
                            {tags.map((tag, index) => {
                                const isTagApplied =
                                    conv.tag_names && conv.tag_names.includes(tag.name)
                                const tagColor = tag.color

                                return (
                                    <div
                                        key={tag.id}
                                        className={`px-3 py-2.5 cursor-pointer text-sm transition-all duration-200 flex items-center gap-3 rounded-lg mb-1 last:mb-0 ${isTagApplied
                                            ? "bg-blue-50 text-blue-800 border border-blue-200 shadow-sm"
                                            : "hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-200"
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onTagSelect?.(conv, tag)
                                        }}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div
                                                className="w-4 h-4 rounded-full border border-white shadow-sm"
                                                style={{ backgroundColor: tagColor }}
                                            />
                                            <span className="font-medium text-sm">{tag.name}</span>
                                        </div>

                                        <div className="flex items-center">
                                            {isTagApplied && (
                                                <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center">
                                                    <svg
                                                        className="w-2.5 h-2.5 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={3}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="px-3 py-6 text-center text-gray-500">
                            <div className="text-2xl mb-2">🏷️</div>
                            <p className="text-sm">Chưa có thẻ nào</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onCloseMenu}
                        className="w-full py-1.5 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                    >
                        Đóng
                    </button>
                </div>
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
    tags,
    timeFormatter,
    onSelectConversation,
    onTagSelect,
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
                        tags={tags}
                        displayConversations={displayConversations}
                        hasCustomerNotification={hasCustomerNotification}
                    />

                    {/* Tag Button */}
                    <TagSection
                        conv={conv}
                        isSelectMode={isSelectMode}
                        isMenuOpen={isMenuOpen}
                        onOpenMenu={handleOpenMenuClick}
                    />
                </div>
            </div>

            {/* Tag Dropdown - Only show when not in select mode */}
            {!isSelectMode && (
                <TagDropdown
                    isMenuOpen={isMenuOpen}
                    tags={tags}
                    conv={conv}
                    onTagSelect={onTagSelect}
                    onCloseMenu={handleCloseMenu}
                />
            )}
        </div>
    )
}

export default ConversationItem
