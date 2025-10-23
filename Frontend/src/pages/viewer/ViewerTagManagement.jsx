import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, AlertCircle, Tag } from 'lucide-react';
import { getTag, getTagById, updateTag, createTag, deleteTag } from '../../services/tagService';

const ViewerTagManagement = () => {
    const [tags, setTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTag, setEditingTag] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: ''
    });

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        setLoading(true);
        try {
            const data = await getTag();
            setTags(data);
            setFilteredTags(data);
        } catch (err) {
            setError('Không thể tải danh sách tag');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filtered = tags.filter(tag =>
            tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredTags(filtered);
    }, [searchTerm, tags]);

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Tên tag là bắt buộc');
            return;
        }

        try {
            setLoading(true);
            if (editingTag) {
                await updateTag(editingTag.id, formData);
            } else {
                await createTag(formData);
            }

            setShowModal(false);
            setEditingTag(null);
            setFormData({ name: '', description: '', color: '' });
            setError('');
            await loadTags();
        } catch (err) {
            setError('Có lỗi xảy ra khi lưu tag');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (tag) => {
        setEditingTag(tag);
        setFormData({
            name: tag.name,
            description: tag.description || '',
            color: tag.color || ''
        });
        setShowModal(true);
        setError('');
    };

    const handleCreate = () => {
        setEditingTag(null);
        setFormData({ name: '', description: '', color: '' });
        setShowModal(true);
        setError('');
    };

    const handleDelete = async (tagId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tag này?')) {
            try {
                setLoading(true);
                await deleteTag(tagId);
                await loadTags();
            } catch (err) {
                setError('Không thể xóa tag');
            } finally {
                setLoading(false);
            }
        }
    };

    const colorOptions = [
        { value: '#3B82F6', label: 'Xanh dương', class: 'bg-blue-500' },
        { value: '#EF4444', label: 'Đỏ', class: 'bg-red-500' },
        { value: '#10B981', label: 'Xanh lá', class: 'bg-green-500' },
        { value: '#F59E0B', label: 'Vàng', class: 'bg-yellow-500' },
        { value: '#8B5CF6', label: 'Tím', class: 'bg-purple-500' },
        { value: '#EC4899', label: 'Hồng', class: 'bg-pink-500' },
        { value: '#6B7280', label: 'Xám', class: 'bg-gray-500' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Tag className="h-6 w-6 text-purple-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Quản lý Tag</h1>
                                <p className="text-gray-600">Tạo và quản lý các tag để phân loại khách hàng</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Tạo tag mới
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tag theo tên hoặc mô tả..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Tags Grid */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Danh sách Tag ({filteredTags.length})
                    </h2>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải...</p>
                        </div>
                    ) : filteredTags.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>{searchTerm ? 'Không tìm thấy tag nào' : 'Chưa có tag nào'}</p>
                            {!searchTerm && (
                                <button
                                    onClick={handleCreate}
                                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Tạo tag đầu tiên
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: tag.color || '#6B7280' }}
                                            ></div>
                                            <h3 className="font-medium text-gray-900">{tag.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleEdit(tag)}
                                                className="p-1 text-gray-500 hover:text-blue-600 rounded"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
                                                className="p-1 text-gray-500 hover:text-red-600 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {tag.description && (
                                        <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        ID: {tag.id}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingTag ? 'Chỉnh sửa Tag' : 'Tạo Tag mới'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên tag *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên tag"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Nhập mô tả cho tag (tùy chọn)"
                                    rows="3"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Màu sắc
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            className={`h-10 w-full rounded-lg border-2 transition-all ${formData.color === color.value
                                                    ? 'border-gray-800 scale-105'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                } ${color.class}`}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                                {formData.color && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: formData.color }}
                                        ></div>
                                        <span>Màu đã chọn</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.name.trim()}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {editingTag ? 'Cập nhật' : 'Tạo mới'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewerTagManagement;