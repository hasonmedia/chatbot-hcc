import React, { useState } from 'react';
import { Eye, EyeOff, Key, Lock } from 'lucide-react';

const PasswordInput = ({ placeholder, value, onChange, tokenType, disabled = false }) => {
    const [showTokens, setShowTokens] = useState({
        geminiKey: false,
        verifyToken: false,
        pageAccessToken: false,
        zaloSecret: false,
        openaiKey: false
    });

    const toggleTokenVisibility = (tokenType) => {
        setShowTokens(prev => ({
            ...prev,
            [tokenType]: !prev[tokenType]
        }));
    };

    const getTokenIcon = (tokenType) => {
        switch (tokenType) {
            case 'geminiKey':
            case 'openaiKey':
                return '🤖';
            case 'verifyToken':
                return '🔐';
            case 'pageAccessToken':
                return '📘';
            case 'zaloSecret':
                return '💬';
            default:
                return '🔑';
        }
    };

    const getTokenColor = (tokenType) => {
        switch (tokenType) {
            case 'geminiKey':
                return 'border-blue-300 focus:border-blue-500 focus:ring-blue-500/20';
            case 'openaiKey':
                return 'border-green-300 focus:border-green-500 focus:ring-green-500/20';
            case 'verifyToken':
                return 'border-purple-300 focus:border-purple-500 focus:ring-purple-500/20';
            case 'pageAccessToken':
                return 'border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500/20';
            case 'zaloSecret':
                return 'border-orange-300 focus:border-orange-500 focus:ring-orange-500/20';
            default:
                return 'border-gray-300 focus:border-gray-500 focus:ring-gray-500/20';
        }
    };

    return (
        <div className="space-y-2">
            {/* Token Type Label */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <span className="text-lg">{getTokenIcon(tokenType)}</span>
                <span>
                    {tokenType === 'geminiKey' && 'Google Gemini API Key'}
                    {tokenType === 'openaiKey' && 'OpenAI API Key'}
                    {tokenType === 'verifyToken' && 'Webhook Verify Token'}
                    {tokenType === 'pageAccessToken' && 'Page Access Token'}
                    {tokenType === 'zaloSecret' && 'Zalo App Secret'}
                </span>
            </div>

            {/* Input Container */}
            <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        disabled 
                            ? 'bg-gray-200' 
                            : 'bg-gray-100 group-focus-within:bg-blue-100'
                    }`}>
                        <Key className={`w-4 h-4 transition-colors ${
                            disabled 
                                ? 'text-gray-400' 
                                : 'text-gray-500 group-focus-within:text-blue-600'
                        }`} />
                    </div>
                </div>

                <input
                    type={showTokens[tokenType] ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full pl-16 pr-14 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all font-mono text-sm ${
                        disabled 
                            ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
                            : `bg-gray-50 hover:bg-white ${getTokenColor(tokenType)}`
                    }`}
                />

                <button
                    type="button"
                    onClick={() => toggleTokenVisibility(tokenType)}
                    disabled={disabled}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-xl transition-colors group z-10 ${
                        disabled 
                            ? 'cursor-not-allowed opacity-50' 
                            : 'hover:bg-gray-100'
                    }`}
                    title={showTokens[tokenType] ? 'Ẩn token' : 'Hiện token'}
                >
                    {showTokens[tokenType] ? (
                        <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    ) : (
                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    )}
                </button>

                {/* Security indicator */}
                <div className="absolute -bottom-1 left-4 right-4">
                    <div className={`h-1 rounded-full transition-all ${value
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : 'bg-gray-200'
                        }`}></div>
                </div>
            </div>

            {/* Helper text */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Token được mã hóa an toàn</span>
                </div>
                {value && (
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{value.length} ký tự</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordInput;