import React from 'react';
import { Bot, FileText, ChevronDown } from 'lucide-react';

const ModelSelector = ({ llmDetails, botModelId, embeddingModelId, onBotModelChange, onEmbeddingModelChange }) => {
    return (
        <div className="space-y-6">
            {/* Bot Model Selector */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Model cho Bot trả lời</h3>
                </div>
                <div className="relative">
                    <select
                        value={botModelId || ''}
                        onChange={(e) => onBotModelChange(parseInt(e.target.value))}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                        <option value="">-- Chọn model cho Bot --</option>
                        {llmDetails.map((detail) => (
                            <option key={detail.id} value={detail.id}>
                                {detail.name === 'gemini' ? '🤖 Google Gemini' : '⚡ OpenAI GPT'}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        🤖 Model này sẽ được sử dụng để chatbot trả lời tin nhắn của khách hàng
                    </p>
                </div>
            </div>

            {/* Embedding Model Selector */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Model cho Embedding</h3>
                </div>
                <div className="relative">
                    <select
                        value={embeddingModelId || ''}
                        onChange={(e) => onEmbeddingModelChange(parseInt(e.target.value))}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    >
                        <option value="">-- Chọn model cho Embedding --</option>
                        {llmDetails.map((detail) => (
                            <option key={detail.id} value={detail.id}>
                                {detail.name === 'gemini' ? '🤖 Google Gemini' : '⚡ OpenAI GPT'}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                        📝 Model này sẽ được sử dụng để tạo embedding từ văn bản và tìm kiếm tài liệu liên quan
                    </p>
                </div>
            </div>

            {/* Current Selection Summary */}
            {(botModelId || embeddingModelId) && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Cấu hình hiện tại:</h4>
                    <div className="space-y-2 text-sm">
                        {botModelId && (
                            <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-700">
                                    Bot: <span className="font-medium">
                                        {llmDetails.find(d => d.id === botModelId)?.name === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}
                                    </span>
                                </span>
                            </div>
                        )}
                        {embeddingModelId && (
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-600" />
                                <span className="text-gray-700">
                                    Embedding: <span className="font-medium">
                                        {llmDetails.find(d => d.id === embeddingModelId)?.name === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Examples */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">💡 Ví dụ cấu hình:</h4>
                <ul className="space-y-1 text-sm text-green-800">
                    <li>• Bot: Gemini + Embedding: Gemini (cả 2 dùng Gemini)</li>
                    <li>• Bot: GPT + Embedding: GPT (cả 2 dùng GPT)</li>
                    <li>• Bot: Gemini + Embedding: GPT (Gemini trả lời, GPT tìm kiếm)</li>
                    <li>• Bot: GPT + Embedding: Gemini (GPT trả lời, Gemini tìm kiếm)</li>
                </ul>
            </div>
        </div>
    );
};

export default ModelSelector;
