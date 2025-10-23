import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, AlertCircle } from 'lucide-react';
import TagGrid from '../../components/tag/TagGrid';
import ModelTag from './ModelTag';
import { getTag, getTagById, updateTag, createTag, deleteTag } from '../../services/tagService';
const TagManagement = () => {
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
            setError('Failed to load tags');
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
            setError('Tag name is required');
            return;
        }

        setLoading(true);
        try {
            if (editingTag) {
                await updateTag(editingTag.id, formData);
                setTags(tags.map(tag =>
                    tag.id === editingTag.id
                        ? { ...tag, ...formData }
                        : tag
                ));
            } else {
                const response = await createTag(formData);
                setTags([...tags, response.tag]);
            }
            closeModal();
            setError('');
        } catch (err) {
            setError('Failed to save tag');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };
    const handleEdit = (tag) => {
        setEditingTag(tag);
        setFormData({
            name: tag.name,
            description: tag.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có muốn xóa không?')) return;

        setLoading(true);
        try {
            const res = await deleteTag(id);
            setTags(tags.filter(tag => tag.id !== id));
        } catch (err) {
            setError('Failed to delete tag');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setEditingTag(null);
        setError('');
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
                            <p className="text-gray-600 mt-1">Manage your tags and categories</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Tag
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                            <span className="text-red-700">{error}</span>
                        </div>
                    </div>
                )}

                {/* Tags Grid */}
                <TagGrid filteredTags={filteredTags} loading={loading} handleEdit={handleEdit} handleDelete={handleDelete} />

                {/* Modal */}
                {showModal && (
                    <ModelTag editingTag={editingTag} closeModal={closeModal} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} loading={loading} />
                )}
            </div>
        </div>
    );
};

export default TagManagement;