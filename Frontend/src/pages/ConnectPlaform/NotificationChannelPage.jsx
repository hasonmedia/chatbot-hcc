import { useState } from "react";
import { Bell, Plus, Settings } from "lucide-react";

const NotificationChannelPage = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-6">
            {/* Empty State */}
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Quản lý Kênh Thông báo
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Thiết lập và quản lý các kênh thông báo tự động cho khách hàng. 
                    Gửi thông báo về đơn hàng, khuyến mãi, và cập nhật quan trọng.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Settings className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-medium text-blue-900 mb-2">Tính năng đang phát triển</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                                <p>• Thông báo đơn hàng qua Email, SMS, Zalo OA</p>
                                <p>• Chiến dịch marketing tự động</p>
                                <p>• Thông báo khuyến mãi theo phân khúc khách hàng</p>
                                <p>• Tích hợp với CRM và hệ thống bán hàng</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    disabled
                    className="mt-6 flex items-center gap-2 bg-gray-300 text-gray-500 px-6 py-3 rounded-lg cursor-not-allowed"
                >
                    <Plus className="w-4 h-4" />
                    Thêm kênh thông báo (Sắp có)
                </button>
            </div>

            {/* Future Features Preview */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-green-600 text-xl">📧</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Email Marketing</h3>
                    <p className="text-sm text-gray-600">
                        Gửi newsletter, thông báo đơn hàng và chiến dịch email tự động
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-blue-600 text-xl">💬</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">SMS Gateway</h3>
                    <p className="text-sm text-gray-600">
                        Thông báo SMS cho đơn hàng, OTP và các thông tin quan trọng
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <span className="text-purple-600 text-xl">🔔</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Push Notification</h3>
                    <p className="text-sm text-gray-600">
                        Thông báo đẩy qua app mobile và web browser
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotificationChannelPage;