import React, { useEffect, useState } from 'react';
import { Bot, Key, FileText, Plus, Trash2, Save, X, Edit2, Check } from 'lucide-react';
import PasswordInput from '../../components/llm/PasswordInput';
import { get_llm_by_id, create_llm_key, update_llm_key, delete_llm_key } from '../../services/llmService';

const ConfigAI = ({ llmId, selectedAI, setSelectedAI, apiKey, setApiKey, systemPrompt, setSystemPrompt, showPrompt = true, apiKeys, setApiKeys }) => {
    const [editingKeyId, setEditingKeyId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [activeKeyTab, setActiveKeyTab] = useState('bot'); // Tab cho key: 'bot' hoặc 'embedding'
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKeyData, setNewKeyData] = useState({ name: '', key: '', type: 'bot' });

    // Load thông tin LLM khi component mount
    useEffect(() => {
        const fetchLLM = async () => {
            try {
                const llm = await get_llm_by_id(llmId);
                if (llm) {
                    setSystemPrompt(llm.prompt || '');
                    // Load danh sách API keys
                    if (llm.llm_keys && llm.llm_keys.length > 0) {
                        setApiKeys(llm.llm_keys.map(k => ({
                            id: k.id,
                            name: k.name,
                            key: k.key,
                            type: k.type || 'bot'
                        })));
                    }
                }
            } catch (error) {
                console.error("Không thể tải thông tin LLM:", error);
            }
        };
        fetchLLM();
    }, [llmId, setSystemPrompt, setApiKeys]);

    const aiProviders = [
        {
            id: 'gemini',
            name: 'Google Gemini',
            icon: '🤖',
            description: 'AI mạnh mẽ từ Google với khả năng hiểu ngữ cảnh tốt'
        },
        {
            id: 'openai',
            name: 'OpenAI',
            icon: '⚡',
            description: 'GPT models với khả năng xử lý ngôn ngữ tự nhiên vượt trội'
        }
    ];

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleAddKey = () => {
        // Mở modal và set type theo tab đang active
        setNewKeyData({ name: '', key: '', type: activeKeyTab });
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setNewKeyData({ name: '', key: '', type: 'bot' });
    };

    const handleCreateKey = async () => {
        if (!newKeyData.name || !newKeyData.key) {
            showMessage('Vui lòng nhập đầy đủ tên và key', 'error');
            return;
        }

        setSaving(true);
        try {
            const newKey = await create_llm_key(llmId, {
                name: newKeyData.name,
                key: newKeyData.key,
                type: newKeyData.type
            });
            
            // Thêm key mới vào state
            setApiKeys([...apiKeys, {
                id: newKey.id,
                name: newKey.name,
                key: newKey.key,
                type: newKey.type
            }]);
            
            showMessage('Thêm key thành công ✅', 'success');
            handleCloseModal();
        } catch (error) {
            console.error('Error creating key:', error);
            showMessage('Có lỗi khi thêm key ❌', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveKey = async (keyItem, index) => {
        if (!keyItem.name || !keyItem.key) {
            showMessage('Vui lòng nhập đầy đủ tên và key', 'error');
            return;
        }

        setSaving(true);
        try {
            // Cập nhật key hiện có
            await update_llm_key(llmId, keyItem.id, {
                name: keyItem.name,
                key: keyItem.key,
                type: keyItem.type
            });
            showMessage('Cập nhật key thành công ✅', 'success');
            setEditingKeyId(null);
        } catch (error) {
            console.error('Error saving key:', error);
            showMessage('Có lỗi khi lưu key ❌', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingKeyId(null);
    };

    const handleRemoveKey = async (keyItem, index) => {
        if (!window.confirm('Bạn có chắc muốn xóa key này?')) {
            return;
        }

        setSaving(true);
        try {
            await delete_llm_key(llmId, keyItem.id);
            setApiKeys(apiKeys.filter((_, i) => i !== index));
            showMessage('Xóa key thành công ✅', 'success');
        } catch (error) {
            console.error('Error deleting key:', error);
            showMessage('Có lỗi khi xóa key ❌', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleKeyChange = (index, field, value) => {
        const newKeys = [...apiKeys];
        newKeys[index][field] = value;
        setApiKeys(newKeys);
    };

    const isEditing = (keyId) => editingKeyId === keyId;

    // Lọc keys theo type
    const filteredKeys = apiKeys.filter(k => k.type === activeKeyTab);

    return (
        <div className="space-y-6">
            {/* AI Provider Selection */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Nhà cung cấp AI</h3>
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiProviders.map((provider) => (
                            <label key={provider.id} className="cursor-pointer">
                                <div className={`border-2 rounded-lg p-4 transition-all ${selectedAI === provider.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="ai-provider"
                                            value={provider.id}
                                            checked={selectedAI === provider.id}
                                            onChange={(e) => setSelectedAI(e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                            <span className="text-xl">{provider.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* API Keys Management */}
                <div className="space-y-3">
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

                    <div className="flex items-center gap-2 mb-4">
                        <Key className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            {selectedAI === 'gemini' ? 'Google Gemini' : 'OpenAI'} API Keys
                        </h3>
                    </div>

                    {/* Tab Navigation cho Bot/Embedding Keys */}
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="flex -mb-px gap-4">
                            <button
                                onClick={() => setActiveKeyTab('bot')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeKeyTab === 'bot'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Bot className="w-4 h-4" />
                                Keys cho Bot
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    activeKeyTab === 'bot' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {apiKeys.filter(k => k.type === 'bot').length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveKeyTab('embedding')}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeKeyTab === 'embedding'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                Keys cho Embedding
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                    activeKeyTab === 'embedding' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {apiKeys.filter(k => k.type === 'embedding').length}
                                </span>
                            </button>
                        </nav>
                    </div>

                    {/* Nút thêm key */}
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-sm text-gray-600">
                            {activeKeyTab === 'bot' 
                                ? '🤖 API keys dùng cho chatbot trả lời' 
                                : '📝 API keys dùng cho tạo embedding văn bản'}
                        </p>
                        <button
                            onClick={handleAddKey}
                            disabled={saving || apiKeys.some(k => k.isNew && editingKeyId)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm Key
                        </button>
                    </div>

                    {/* Add Key Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative border-2 border-gray-200 pointer-events-auto">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-blue-600" />
                                        Thêm {activeKeyTab === 'bot' ? 'Bot' : 'Embedding'} Key
                                    </h3>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="px-6 py-4 space-y-4">
                                    {/* Type Badge */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Loại key:</span>
                                        <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                            newKeyData.type === 'bot' 
                                                ? 'bg-blue-100 text-blue-700' 
                                                : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {newKeyData.type === 'bot' ? '🤖 Bot' : '📝 Embedding'}
                                        </div>
                                    </div>

                                    {/* Key Name Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tên Key <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="VD: Production Key 1, Test Key..."
                                            value={newKeyData.name}
                                            onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            autoFocus
                                        />
                                    </div>

                                    {/* API Key Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            API Key <span className="text-red-500">*</span>
                                        </label>
                                        <PasswordInput
                                            placeholder="Nhập API key..."
                                            value={newKeyData.key}
                                            onChange={(e) => setNewKeyData({ ...newKeyData, key: e.target.value })}
                                            tokenType={selectedAI === 'gemini' ? 'geminiKey' : 'openaiKey'}
                                        />
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">
                                            {newKeyData.type === 'bot' 
                                                ? '🤖 Key này sẽ được sử dụng cho chatbot trả lời tin nhắn'
                                                : '📝 Key này sẽ được sử dụng cho việc tạo embedding văn bản'}
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <button
                                        onClick={handleCloseModal}
                                        disabled={saving}
                                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleCreateKey}
                                        disabled={saving || !newKeyData.name || !newKeyData.key}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    
                    {filteredKeys.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Key className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">
                                Chưa có API key {activeKeyTab === 'bot' ? 'Bot' : 'Embedding'} nào. Nhấn "Thêm Key" để bắt đầu.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredKeys.map((keyItem, index) => {
                                // Tìm index thực tế trong mảng apiKeys gốc
                                const actualIndex = apiKeys.findIndex(k => k.id === keyItem.id);
                                return (
                                    <div key={keyItem.id || actualIndex} className={`border rounded-lg p-4 ${
                                        isEditing(keyItem.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                                    }`}>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tên key (vd: Key 1, Production, Test...)"
                                                value={keyItem.name}
                                                onChange={(e) => handleKeyChange(actualIndex, 'name', e.target.value)}
                                                disabled={!isEditing(keyItem.id)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                />
                                                
                                                {/* Badge hiển thị type - không cho edit */}
                                                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                                    keyItem.type === 'bot' 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                    {keyItem.type === 'bot' ? '🤖 Bot' : '📝 Embedding'}
                                                </div>
                                                
                                                <div className="flex gap-1">
                                                    {isEditing(keyItem.id) ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleSaveKey(keyItem, actualIndex)}
                                                                disabled={saving}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Lưu"
                                                            >
                                                                {saving ? (
                                                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <Check className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                disabled={saving}
                                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Hủy"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingKeyId(keyItem.id)}
                                                                disabled={saving || editingKeyId !== null}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Sửa"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveKey(keyItem, actualIndex)}
                                                                disabled={saving || editingKeyId !== null}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Xóa"
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
                                                onChange={(e) => handleKeyChange(actualIndex, 'key', e.target.value)}
                                                tokenType={selectedAI === 'gemini' ? 'geminiKey' : 'openaiKey'}
                                                disabled={!isEditing(keyItem.id)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <p className="text-sm text-gray-500">
                        💡 Nhấn nút <Edit2 className="w-3 h-3 inline" /> để chỉnh sửa từng key riêng biệt.
                    </p>
                </div>

                {/* System Prompt - chỉ hiển thị khi showPrompt = true */}
                {showPrompt && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Custom Prompt</h3>
                        </div>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            rows={6}
                            placeholder="Nhập custom prompt cho AI..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <p className="text-sm text-gray-500">
                            Custom prompt sẽ định hướng cách AI phản hồi và hành xử
                        </p>
                    </div>
                )}
        </div>
    );
};

export default ConfigAI;
