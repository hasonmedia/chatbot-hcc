import { FileText, Trash2, Calendar, Tag } from "lucide-react";

export const KnowledgeView = ({ knowledge, onDeleteFile }) => {
    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return '📎';
        if (fileType.toLowerCase().includes('pdf')) return '📄';
        if (fileType.toLowerCase().includes('word') || fileType.toLowerCase().includes('docx')) return '📝';
        if (fileType.toLowerCase().includes('excel') || fileType.toLowerCase().includes('xlsx')) return '📊';
        return '📎';
    };

    const handleDeleteFile = async (detailId, fileName) => {
        if (window.confirm(`Bạn có chắc muốn xóa file "${fileName}"?`)) {
            if (onDeleteFile) {
                await onDeleteFile(detailId);
            }
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

                {/* Hiển thị danh sách files nếu có */}
                {knowledge.details && knowledge.details.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Files đã upload ({knowledge.details.length}):
                        </h3>
                        <div className="space-y-2">
                            {knowledge.details.map((detail) => (
                                <div
                                    key={detail.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-3xl">{getFileIcon(detail.file_type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {detail.file_name}
                                            </p>
                                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                {detail.created_at && (
                                                    <span>{new Date(detail.created_at).toLocaleDateString('vi-VN')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteFile(detail.id, detail.file_name)}
                                        className="ml-3 p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors"
                                        title="Xóa file"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-6 pt-4 border-t">
                    <Calendar className="w-4 h-4" />
                    <span>
                        Tạo lúc: {knowledge.created_at ? new Date(knowledge.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                    {knowledge.updated_at && knowledge.updated_at !== knowledge.created_at && (
                        <>
                            <span className="mx-2">•</span>
                            <span>
                                Cập nhật: {new Date(knowledge.updated_at).toLocaleDateString('vi-VN')}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};