import { FileText, Trash2, Calendar, Tag, Edit, User, Clock } from "lucide-react";

// (THÊM PROP MỚI) onEditDetail
export const KnowledgeView = ({ knowledge, onDeleteFile, onEditDetail }) => {

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return '📎';
        if (fileType.toLowerCase().includes('pdf')) return '📄';
        if (fileType.toLowerCase().includes('word') || fileType.toLowerCase().includes('docx')) return '📝';
        if (fileType.toLowerCase().includes('excel') || fileType.toLowerCase().includes('xlsx')) return '📊';
        return '📎';
    };

    const handleDeleteFile = async (detailId, fileName) => {
        if (onDeleteFile) {
            await onDeleteFile(detailId);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{knowledge.title}</h1>

                <div className="flex gap-4 mb-4 text-sm text-gray-600 flex-wrap">
                    {knowledge.customer_id && (
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            <Tag className="w-3 h-3" />
                            {knowledge.customer_id}
                        </span>
                    )}
                </div>

                {knowledge.details && knowledge.details.length > 0 ? (
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Các mục kiến thức ({knowledge.details.length}):
                        </h3>
                        <div className="space-y-2">
                            {knowledge.details.map((detail) => (
                                <div
                                    key={detail.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Kiểm tra source_type */}
                                        {detail.source_type === 'RICH_TEXT' ? (
                                            <span className="text-3xl"><FileText className="w-6 h-6 text-blue-600" /></span>
                                        ) : (
                                            <span className="text-3xl">{getFileIcon(detail.file_type)}</span>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {detail.file_name}
                                                {detail.source_type === 'RICH_TEXT' && (
                                                    <span className="ml-2 text-xs font-normal text-blue-600">(Nội dung thủ công)</span>
                                                )}
                                            </p>
                                            <div className="flex flex-col gap-1 text-xs text-gray-500 mt-1">
                                                {detail.created_at && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatDateTime(detail.created_at)}</span>
                                                    </div>
                                                )}
                                                {detail.user && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        <span>{detail.user.full_name || detail.user.username}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nút Sửa (MỚI) */}
                                    {detail.source_type === 'RICH_TEXT' && (
                                        <button
                                            onClick={() => onEditDetail(detail)}
                                            className="ml-3 p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
                                            title="Sửa nội dung"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Nút Xóa */}
                                    <button
                                        onClick={() => handleDeleteFile(detail.id, detail.file_name)}
                                        className="ml-3 p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                                        title="Xóa mục này"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu kiến thức</h3>
                        <p className="text-gray-600 text-sm">Bắt đầu bằng cách thêm file hoặc nội dung kiến thức</p>
                    </div>
                )}
            </div>
        </div>
    );
};