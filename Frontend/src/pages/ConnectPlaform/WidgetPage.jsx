import { useState, useEffect } from "react";
import { Code, Copy, Check, Globe, Settings, Eye } from "lucide-react";

const WidgetPage = () => {
    const [copied, setCopied] = useState(false);
    const [apiUrl, setApiUrl] = useState("https://chatbotbe.a2alab.vn");
    const [wsUrl, setWsUrl] = useState("wss://chatbotbe.a2alab.vn");
    const [showPreview, setShowPreview] = useState(false);

    const widgetCode = `<!-- Chatbot Widget - Nhúng vào trang web của bạn -->
<script 
    src="${window.location.origin}/widget.js"
    data-api-url="${apiUrl}"
    data-ws-url="${wsUrl}"
></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(widgetCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTestWidget = () => {
        setShowPreview(true);
        // Load widget script dynamically for preview
        const script = document.createElement('script');
        script.src = '/widget.js';
        script.setAttribute('data-api-url', apiUrl);
        script.setAttribute('data-ws-url', wsUrl);
        document.body.appendChild(script);
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <Code className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Widget Chatbot</h2>
                        <p className="text-purple-100">Nhúng chatbot vào website của bạn chỉ với một dòng code</p>
                    </div>
                </div>
            </div>

            {/* Configuration Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Cấu hình Widget</h3>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backend API URL
                        </label>
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="https://chatbotbe.a2alab.vn"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            WebSocket URL
                        </label>
                        <input
                            type="text"
                            value={wsUrl}
                            onChange={(e) => setWsUrl(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="wss://chatbotbe.a2alab.vn"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            💡 Thường cùng domain với Backend API URL. Nếu API là https:// thì WS là wss://
                        </p>
                    </div>
                </div>
            </div>

            {/* Installation Code Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Mã nhúng</h3>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Đã sao chép!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                <span>Sao chép mã</span>
                            </>
                        )}
                    </button>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm font-mono">
                        <code>{widgetCode}</code>
                    </pre>
                </div>
            </div>

            {/* Troubleshooting Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Xử lý lỗi WebSocket</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <strong>Lỗi "WebSocket connection failed":</strong>
                            </p>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>Đảm bảo WebSocket URL và API URL cùng domain (ví dụ: cả hai đều là chatbotbe.a2alab.vn)</li>
                                <li>Nếu API là <code className="bg-yellow-100 px-1 rounded">https://</code> thì WebSocket phải là <code className="bg-yellow-100 px-1 rounded">wss://</code></li>
                                <li>Nếu API là <code className="bg-yellow-100 px-1 rounded">http://</code> thì WebSocket phải là <code className="bg-yellow-100 px-1 rounded">ws://</code></li>
                                <li>Kiểm tra backend server đã bật WebSocket support chưa</li>
                                <li>Kiểm tra CORS settings trong backend cho phép WebSocket</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Hướng dẫn cài đặt</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                            1
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Sao chép mã nhúng</h4>
                            <p className="text-gray-600 text-sm">
                                Click vào nút "Sao chép mã" để copy đoạn code widget vào clipboard
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                            2
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Dán vào website</h4>
                            <p className="text-gray-600 text-sm">
                                Mở file HTML của website, dán đoạn code vào trước thẻ đóng <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                            3
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Hoàn tất</h4>
                            <p className="text-gray-600 text-sm">
                                Lưu file và reload trang web. Chatbot widget sẽ xuất hiện ở góc dưới bên phải màn hình
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tính năng Widget</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            💬
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Chat realtime</h4>
                            <p className="text-sm text-gray-600">
                                Kết nối WebSocket để chat trực tiếp với AI bot
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            💾
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Lưu lịch sử</h4>
                            <p className="text-sm text-gray-600">
                                Tự động lưu cuộc hội thoại trên trình duyệt
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            🎨
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Giao diện đẹp</h4>
                            <p className="text-sm text-gray-600">
                                Thiết kế hiện đại, responsive và dễ sử dụng
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                        <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            ⚡
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Nhẹ và nhanh</h4>
                            <p className="text-sm text-gray-600">
                                Không ảnh hưởng đến hiệu suất website
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Widget Button */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            Kiểm tra Widget
                        </h3>
                        <p className="text-sm text-gray-600">
                            Xem trước widget hoạt động như thế nào trên trang này
                        </p>
                    </div>
                    <button
                        onClick={handleTestWidget}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <Eye className="w-5 h-5" />
                        <span>Xem trước</span>
                    </button>
                </div>
                {showPreview && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                            ✅ Widget đã được kích hoạt! Kiểm tra góc dưới bên phải màn hình.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WidgetPage;
