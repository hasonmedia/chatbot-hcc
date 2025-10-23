import { FaEdit, FaTrash } from "react-icons/fa";

const FacebookPageTable = ({ data, onEdit, onDelete, onToggleStatus }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📋</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Danh sách Fanpages</h2>
                        <p className="text-gray-600 text-sm">Quản lý và cấu hình các fanpage Facebook</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                                Fanpage
                            </th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">
                                Bật/Tắt
                            </th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">
                                Trạng thái
                            </th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">
                                Cập nhật
                            </th>
                            <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.map((page, index) => (
                            <tr key={page.id} className="hover:bg-gray-50 transition-colors duration-200">
                                {/* Fanpage Info */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {page.page_name?.charAt(0) || "F"}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                                                {page.page_name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border">
                                                ID: {page.page_id}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {page.category}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Toggle Status Button */}
                                <td className="py-4 px-4 text-center">
                                    <button
                                        onClick={() => onToggleStatus(page.id)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                            page.is_active
                                                ? 'bg-green-500 focus:ring-green-500'
                                                : 'bg-gray-300 focus:ring-gray-400'
                                        }`}
                                        title={page.is_active ? 'Tắt nền tảng' : 'Bật nền tảng'}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                page.is_active ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </td>

                                {/* Status */}
                                <td className="py-4 px-4 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div>
                                            {page.is_active ? (
                                                <span className="bg-green-100 text-green-700 py-1 px-2 rounded text-xs font-medium border border-green-200">
                                                    Hoạt động
                                                </span>
                                            ) : (
                                                <span className="bg-red-100 text-red-700 py-1 px-2 rounded text-xs font-medium border border-red-200">
                                                    Tạm dừng
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            {page.auto_response_enabled ? (
                                                <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded text-xs font-medium border border-blue-200">
                                                    Auto Reply
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-700 py-1 px-2 rounded text-xs font-medium border border-gray-200">
                                                    Manual
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Updated Time */}
                                <td className="py-4 px-4 text-center">
                                    <div className="text-xs text-gray-500">
                                        <div>
                                            {new Date(page.updated_at).toLocaleDateString('vi-VN')}
                                        </div>
                                        <div className="text-gray-400">
                                            {new Date(page.updated_at).toLocaleTimeString('vi-VN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(page)}
                                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(page.id)}
                                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Empty State */}
                {data.length === 0 && (
                    <div className="text-center py-16 px-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">📭</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Chưa có fanpage nào</h3>
                        <p className="text-gray-500 mb-6">Thêm fanpage đầu tiên để bắt đầu nhận tin nhắn</p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
                            <span>💡</span>
                            <span className="font-medium">Nhấn nút "Thêm Fanpage" để bắt đầu</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacebookPageTable;