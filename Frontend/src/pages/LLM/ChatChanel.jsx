import { useState } from "react";
import { MessageCircle, Bot, Edit3, Check, X, RotateCcw, Eye } from "lucide-react";
import { get_all_llms } from "../../services/llmService"

const ChatChanel = ({ greetingMessage, setGreetingMessage, botName, setBotName }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(botName);
    const handleSave = () => {
        if (tempName.trim()) {
            setBotName(tempName.trim());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setTempName(botName);
        setIsEditing(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };
    const handleGreetingMessageChange = (e) => {
        setGreetingMessage(e.target.value);
    };

    const resetToDefault = () => {
        const defaultGreeting = `Em là nhân viên tư vấn của hệ thống đào tạo tiếng Trung THANHMAIHSK. Em rất vui được hỗ trợ anh/chị!
            Trung tâm THANHMAIHSK chuyên đào tạo:
            - Tiếng Trung HSK (các cấp độ)
            - Tiếng Trung giao tiếp
            - Tiếng Trung doanh nghiệp
            - Luyện thi tiếng Trung

            Anh/chị muốn tìm hiểu về khóa học nào ạ? Em sẽ tư vấn chi tiết giúp anh/chị!
            `;
        setGreetingMessage(defaultGreeting);
    };

    return (
        <div className="space-y-6">
            {/* Greeting Message Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Lời chào mặc định</h2>
                            <p className="text-gray-600 text-sm">Tin nhắn đầu tiên khách hàng sẽ thấy khi bắt đầu trò chuyện</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Input */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">Nội dung lời chào</h3>
                                <button
                                    onClick={resetToDefault}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Khôi phục mặc định
                                </button>
                            </div>

                            <textarea
                                value={greetingMessage}
                                onChange={handleGreetingMessageChange}
                                rows={12}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Nhập lời chào mặc định..."
                            />

                            <div className="text-sm text-gray-500 text-right">
                                {greetingMessage?.length || 0} ký tự
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-gray-600" />
                                <h3 className="font-medium text-gray-900">Xem trước</h3>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[300px]">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm max-w-full">
                                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                            {greetingMessage || "Nhập nội dung lời chào để xem trước..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bot Name Section */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Tên chatbot</h2>
                            <p className="text-gray-600 text-sm">Tùy chỉnh tên hiển thị của trợ lý AI</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="max-w-md mx-auto text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                            <Bot className="w-8 h-8 text-blue-600" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-3">Tên hiện tại của chatbot:</p>

                            {!isEditing ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-lg">
                                        {botName}
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Chỉnh sửa tên"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 max-w-sm mx-auto">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nhập tên chatbot..."
                                        autoFocus
                                        maxLength={50}
                                    />
                                    <button
                                        onClick={handleSave}
                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Lưu"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hủy"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-gray-500">
                            {isEditing ? tempName.length : botName.length}/50 ký tự
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">💡</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-800 text-sm mb-2">Gợi ý đặt tên:</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Chọn tên ngắn gọn, dễ nhớ</li>
                                    <li>• Tránh sử dụng ký tự đặc biệt</li>
                                    <li>• Tên nên phản ánh tính cách của chatbot</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatChanel;
