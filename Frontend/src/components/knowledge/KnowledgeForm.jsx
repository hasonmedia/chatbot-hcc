import { Upload, FileText, X, File, Eye } from "lucide-react";
import { useState } from "react";

export const KnowledgeForm = ({ formData, handleChange, handleSubmit, handleCancel, loading, isEdit }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'file'
    const [previewFile, setPreviewFile] = useState(null);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        handleChange({ target: { name, value: checked } });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            
            const validFiles = files.filter(file => allowedTypes.includes(file.type));
            const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
            
            if (invalidFiles.length > 0) {
                alert(`Các file sau không được hỗ trợ: ${invalidFiles.map(f => f.name).join(', ')}`);
            }
            
            if (validFiles.length > 0) {
                // Thêm file mới vào danh sách, tránh trùng lặp
                setSelectedFiles(prev => {
                    const existingNames = prev.map(f => f.name);
                    const newFiles = validFiles.filter(f => !existingNames.includes(f.name));
                    return [...prev, ...newFiles];
                });
            }
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
        return '📎';
    };

    const handlePreview = (file) => {
        setPreviewFile(file);
    };

    const closePreview = () => {
        setPreviewFile(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">
                {isEdit ? "Sửa kiến thức" : "Thêm kiến thức mới"}
            </h2>

            <div className="space-y-4">
                {/* Chọn chế độ nhập liệu */}
                <div className="border-b border-gray-200 pb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Chế độ nhập liệu
                    </label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setUploadMode('manual')}
                            className={`flex-1 py-2 px-4 rounded-md border transition-colors ${
                                uploadMode === 'manual'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <FileText className="w-4 h-4 inline mr-2" />
                            Nhập thủ công
                        </button>
                        <button
                            type="button"
                            onClick={() => setUploadMode('file')}
                            className={`flex-1 py-2 px-4 rounded-md border transition-colors ${
                                uploadMode === 'file'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Upload file
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tiêu đề..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer ID
                    </label>
                    <input
                        type="text"
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập customer ID..."
                    />
                </div>

                {/* Hiển thị theo chế độ */}
                {uploadMode === 'file' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload files *
                        </label>
                        
                        {/* Drag & Drop Area */}
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                            <div className="space-y-1 text-center w-full">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                                    >
                                        <span>Chọn files</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            onChange={handleFileChange}
                                            multiple
                                        />
                                    </label>
                                    <p className="pl-1">hoặc kéo thả</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    PDF, WORD, EXCEL (có thể chọn nhiều file)
                                </p>
                            </div>
                        </div>

                        {/* Danh sách files đã chọn */}
                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-gray-700">
                                    Đã chọn {selectedFiles.length} file(s):
                                </p>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <span className="text-2xl">{getFileIcon(file.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handlePreview(file)}
                                                    className="p-1 rounded-full hover:bg-blue-50 text-blue-500"
                                                    title="Xem thông tin"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-1 rounded-full hover:bg-red-50 text-red-500"
                                                    title="Xóa file"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Chọn chế độ "Upload file" để tải lên tài liệu</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        onClick={(e) => handleSubmit(e, selectedFiles, uploadMode)}
                        disabled={loading || (uploadMode === 'file' && selectedFiles.length === 0)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Đang xử lý..." : (isEdit ? "Cập nhật" : "Tạo mới")}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold">Thông tin file</h3>
                            <button
                                onClick={closePreview}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">Tên file:</p>
                                <p className="text-sm font-medium break-all">{previewFile.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Kích thước:</p>
                                <p className="text-sm font-medium">{formatFileSize(previewFile.size)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Loại file:</p>
                                <p className="text-sm font-medium">{previewFile.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Ngày sửa đổi:</p>
                                <p className="text-sm font-medium">
                                    {new Date(previewFile.lastModified).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closePreview}
                            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};