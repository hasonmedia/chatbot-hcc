import React, { useState } from 'react';
import { Bot, Key, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import PasswordInput from '../../components/llm/PasswordInput';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const ConfigAI = ({ llmDetails }) => {
    const [selectedDetailId, setSelectedDetailId] = useState(null);
    const [apiKeys, setApiKeys] = useState({});
    const [editingKeyId, setEditingKeyId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeKeyTab, setActiveKeyTab] = useState('bot');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ name: '', key: '', type: 'bot' });

    // Load keys khi chọn detail
    React.useEffect(() => {
        if (selectedDetailId) {
            const detail = llmDetails.find(d => d.id === selectedDetailId);
            if (detail && detail.llm_keys) {
                setApiKeys(prev => ({
                    ...prev,
                    [selectedDetailId]: detail.llm_keys
                }));
            }
        }
    }, [selectedDetailId, llmDetails]);

    const selectedDetail = llmDetails.find(d => d.id === selectedDetailId);
    const currentKeys = apiKeys[selectedDetailId] || [];
    const filteredKeys = currentKeys.filter(k => k.type === activeKeyTab);

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleAddKey = () => {
        setNewKeyData({ name: '', key: '', type: activeKeyTab });
        setShowAddModal(true);
    };

    const handleCreateKey = async () => {
        if (!newKeyData.name || !newKeyData.key) {
            showMessage('Vui lòng nhập đầy đủ tên và key', 'error');
            return;
        }

        setSaving(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/llms/details/${selectedDetailId}/keys`,
                newKeyData
            );
            
            const newKey = response.data.llm_key;
            setApiKeys(prev => ({
                ...prev,
                [selectedDetailId]: [...(prev[selectedDetailId] || []), newKey]
            }));
            
            showMessage('Thêm key thành công ✅', 'success');
            setShowAddModal(false);
            setNewKeyData({ name: '', key: '', type: 'bot' });
        } catch (error) {
            console.error('Error creating key:', error);
            showMessage('Có lỗi khi thêm key ❌', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveKey = async (keyItem) => {
        if (!keyItem.name || !keyItem.key) {
            showMessage('Vui lòng nhập đầy đủ tên và key', 'error');
            return;
        }

        setSaving(true);
        try {
            await axios.put(
                `${API_BASE_URL}/llms/details/${selectedDetailId}/keys/${keyItem.id}`,
                {
                    name: keyItem.name,
                    key: keyItem.key,
                    type: keyItem.type
                }
            );
            showMessage('Cập nhật key thành công ✅', 'success');
            setEditingKeyId(null);
        } catch (error) {
            console.error('Error saving key:', error);
            showMessage('Có lỗi khi lưu key ❌', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveKey = async (keyItem) => {
        if (!window.confirm('Bạn có chắc muốn xóa key này?')) {
            return;
        }

        setSaving(true);
        try {
            await axios.delete(
                `${API_BASE_URL}/llms/details/${selectedDetailId}/keys/${keyItem.id}`
            );
            
            setApiKeys(prev => ({
                ...prev,
                [selectedDetailId]: prev[selectedDetailId].filter(k => k.id !== keyItem.id)
            }));
            
            showMessage('Xóa key thành công ✅', 'success');
        } catch (error) {
            console.error('Error deleting key:', error);
            showMessage('Có lỗi khi xóa key ❌', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleKeyChange = (keyId, field, value) => {
        setApiKeys(prev => ({
            ...prev,
            [selectedDetailId]: prev[selectedDetailId].map(k =>
                k.id === keyId ? { ...k, [field]: value } : k
            )
        }));
    };

    return (
        <div className="space-y-6">
            {/* Message Alert */}
            {message.text && (
                <div className={`flex items-center gap-2 p-3 rounded-lg border text-sm ${
                    message.type === 'success'
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Model Selector */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Chọn Model để quản lý API Keys</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {llmDetails.map((detail) => (
                        <label key={detail.id} className="cursor-pointer">
                            <div className={`border-2 rounded-lg p-4 transition-all ${
                                selectedDetailId === detail.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="model-selector"
                                        value={detail.id}
                                        checked={selectedDetailId === detail.id}
                                        onChange={() => setSelectedDetailId(detail.id)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <span className="text-xl">
                                            {detail.name === 'gemini' ? '🤖' : '⚡'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">
                                            {detail.name === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {detail.llm_keys?.length || 0} keys
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* API Keys Management - Only show when a model is selected */}
            {selectedDetailId && selectedDetail && (
                <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            {selectedDetail.name === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'} API Keys
                        </h3>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px gap-4">
                            <button
                                onClick={() => setActiveKeyTab('bot')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeKeyTab === 'bot'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Bot className="w-4 h-4" />
                                Keys cho Bot
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    activeKeyTab === 'bot' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {currentKeys.filter(k => k.type === 'bot').length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveKeyTab('embedding')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeKeyTab === 'embedding'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Key className="w-4 h-4" />
                                Keys cho Embedding
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    activeKeyTab === 'embedding' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {currentKeys.filter(k => k.type === 'embedding').length}
                                </span>
                            </button>
                        </nav>
                    </div>

                    {/* Add Key Button */}
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            {activeKeyTab === 'bot' 
                                ? '🤖 API keys dùng cho chatbot trả lời' 
                                : '📝 API keys dùng cho tạo embedding văn bản'}
                        </p>
                        <button
                            onClick={handleAddKey}
                            disabled={saving}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm Key
                        </button>
                    </div>

                    {/* Keys List */}
                    {filteredKeys.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Key className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">
                                Chưa có API key {activeKeyTab === 'bot' ? 'Bot' : 'Embedding'} nào.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredKeys.map((keyItem) => (
                                <div key={keyItem.id} className={`border rounded-lg p-4 ${
                                    editingKeyId === keyItem.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                }`}>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Tên key"
                                                value={keyItem.name}
                                                onChange={(e) => handleKeyChange(keyItem.id, 'name', e.target.value)}
                                                disabled={editingKeyId !== keyItem.id}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            />
                                            
                                            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                                keyItem.type === 'bot' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                {keyItem.type === 'bot' ? '🤖 Bot' : '📝 Embedding'}
                                            </div>
                                            
                                            <div className="flex gap-1">
                                                {editingKeyId === keyItem.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveKey(keyItem)}
                                                            disabled={saving}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                        >
                                                            {saving ? (
                                                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <Check className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingKeyId(null)}
                                                            disabled={saving}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingKeyId(keyItem.id)}
                                                            disabled={saving}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveKey(keyItem)}
                                                            disabled={saving}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <PasswordInput
                                            placeholder="Nhập API key..."
                                            value={keyItem.key}
                                            onChange={(e) => handleKeyChange(keyItem.id, 'key', e.target.value)}
                                            tokenType={selectedDetail.name === 'gemini' ? 'geminiKey' : 'openaiKey'}
                                            disabled={editingKeyId !== keyItem.id}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add Key Modal */}
            {showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Thêm {activeKeyTab === 'bot' ? 'Bot' : 'Embedding'} Key
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên Key <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="VD: Production Key 1"
                                    value={newKeyData.name}
                                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    API Key <span className="text-red-500">*</span>
                                </label>
                                <PasswordInput
                                    placeholder="Nhập API key..."
                                    value={newKeyData.key}
                                    onChange={(e) => setNewKeyData({ ...newKeyData, key: e.target.value })}
                                    tokenType={selectedDetail?.name === 'gemini' ? 'geminiKey' : 'openaiKey'}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                            <button
                                onClick={() => setShowAddModal(false)}
                                disabled={saving}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreateKey}
                                disabled={saving || !newKeyData.name || !newKeyData.key}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Thêm Key
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

export default ConfigAI;
