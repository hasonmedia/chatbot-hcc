import { useState, forwardRef, useImperativeHandle } from "react"
import { Search, MoreVertical, Trash2, X, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useRoleBasedRoute } from "../../utils/useRoleBasedRoute";
const Header = forwardRef(
    (
        {
            searchTerm,
            selectedCategory,
            tags,
            setSearchTerm,
            setSelectedCategory,
            onDeleteConversations,
            onSelectModeChange,
            isSelectMode = false,
            selectedConversationIds = [],
            isMobile = false,
        },
        ref,
    ) => {
        const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

        useImperativeHandle(ref, () => ({
            updateSelection: (newSelectedIds) => {
                // This method can be called from parent to update selection
            },
        }))
        const navigate = useNavigate();
        const { homeRoute } = useRoleBasedRoute();
        const handleSelectModeToggle = () => {
            const newMode = !isSelectMode
            onSelectModeChange(newMode, [])
            if (!newMode) {
                setShowDeleteConfirm(false)
            }
        }

        const handleDeleteClick = () => {
            if (selectedConversationIds.length > 0) {
                setShowDeleteConfirm(true)
            }
        }

        const handleConfirmDelete = () => {
            onDeleteConversations(selectedConversationIds)
            onSelectModeChange(false, [])
            setShowDeleteConfirm(false)
        }

        const handleCancelDelete = () => {
            setShowDeleteConfirm(false)
        }

        return (
            <div className="bg-blue-600 text-white p-4 border-b border-blue-700">
                <div className="flex items-center justify-between mb-4">
                    <ArrowLeft
                        onClick={() => navigate(homeRoute)}
                        className="cursor-pointer text-white w-6 h-6"
                    />
                    <h1 className="text-xl font-semibold">Tin nhắn</h1>
                    <div className="flex items-center gap-2">
                        {isSelectMode ? (
                            <>
                                <span className="text-sm">{selectedConversationIds.length} đã chọn</span>
                                {selectedConversationIds.length > 0 && (
                                    <button onClick={handleDeleteClick} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button onClick={handleSelectModeToggle} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </>
                        ) : (
                            <button onClick={handleSelectModeToggle} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm cuộc hội thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedCategory === "all" ? "bg-white text-blue-600" : "bg-blue-700 text-white hover:bg-blue-800"
                            }`}
                    >
                        Tất cả
                    </button>
                    {tags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => setSelectedCategory(tag.name)}
                            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedCategory === tag.name ? "bg-white text-blue-600" : "bg-blue-700 text-white hover:bg-blue-800"
                                }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                            <p className="text-gray-600 mb-4">
                                Bạn có chắc chắn muốn xóa {selectedConversationIds.length} cuộc hội thoại đã chọn?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    },
)

Header.displayName = "Header"

export default Header
