import React from 'react'
import { Settings, MessageSquare, Database, Users, TestTube, BarChart3, Bell, FileSpreadsheet, Bot, Key, UserCheck, Search, Facebook, MessageCircle } from 'lucide-react';

const Guide = () => {
    const setupSteps = [
        {
            step: 1,
            icon: <Settings className="w-5 h-5" />,
            title: 'Cài đặt cơ bản',
            text: 'Điền thông tin công ty và kết nối dịch vụ cần thiết',
            description: 'Thiết lập thông tin doanh nghiệp và các tài khoản dịch vụ',
            tasks: [
                'Nhập tên công ty, logo và thông tin liên hệ',
                'Kết nối tài khoản Google (để lưu dữ liệu vào Google Sheets)',
                'Nhập API key ChatGPT hoặc Claude (để chatbot hoạt động)',
                'Cài đặt email nhận thông báo khi có khách hàng mới',
                'Chọn múi giờ và ngôn ngữ hiển thị'
            ],
        },
        {
            step: 2,
            icon: <Bot className="w-5 h-5" />,
            title: 'Thiết kế chatbot',
            text: 'Tạo tính cách, lời chào và cách trả lời của chatbot',
            description: 'Tùy chỉnh hành vi và phong cách giao tiếp phù hợp với thương hiệu',
            tasks: [
                'Viết lời chào đầu tiên của chatbot',
                'Mô tả vai trò của chatbot (tư vấn viên, hỗ trợ khách hàng...)',
                'Tạo danh sách câu hỏi thường gặp và câu trả lời',
                'Thiết lập tin nhắn khi không hiểu khách hàng',
                'Thêm thông tin về sản phẩm/dịch vụ để chatbot tư vấn'
            ],
        },
        {
            step: 3,
            icon: <UserCheck className="w-5 h-5" />,
            title: 'Form thu thập thông tin',
            text: 'Thiết kế form để chatbot hỏi và lưu thông tin khách hàng',
            description: 'Quyết định thông tin nào cần thu thập từ khách hàng tiềm năng',
            tasks: [
                'Chọn thông tin cần thu thập (tên, số điện thoại, email, nhu cầu...)',
                'Viết câu hỏi để chatbot hỏi thông tin một cách tự nhiên',
                'Thiết lập thứ tự hỏi thông tin (tên trước, sau đó số điện thoại...)',
                'Tạo tin nhắn cảm ơn sau khi thu thập xong thông tin',
                'Quy định thông tin nào bắt buộc, thông tin nào tùy chọn'
            ],
        },
        {
            step: 4,
            icon: <Database className="w-5 h-5" />,
            title: 'Quản lý khách hàng tiềm năng',
            text: 'Cài đặt cách phân loại và theo dõi khách hàng',
            description: 'Thiết lập hệ thống quản lý và đánh giá chất lượng khách hàng',
            tasks: [
                'Tạo các nhãn phân loại khách hàng (nóng, ấm, lạnh)',
                'Thiết lập điều kiện tự động gắn nhãn dựa vào câu trả lời',
                'Cài đặt thông báo khi có khách hàng tiềm năng chất lượng cao',
                'Kết nối với Google Sheets để xuất danh sách khách hàng',
                'Thiết lập tự động gửi email báo cáo hàng tuần'
            ],
        },
        {
            step: 5,
            icon: <Users className="w-5 h-5" />,
            title: 'Thêm nhân viên',
            text: 'Mời đồng nghiệp và phân quyền truy cập hệ thống',
            description: 'Tạo tài khoản cho team và thiết lập quyền hạn phù hợp',
            tasks: [
                'Mời nhân viên sales/marketing tham gia hệ thống',
                'Phân quyền xem/chỉnh sửa dữ liệu khách hàng',
                'Thiết lập ai nhận thông báo khi có lead mới',
                'Tạo workspace riêng cho từng bộ phận',
                'Hướng dẫn nhân viên sử dụng dashboard'
            ],
        }
    ];
    const completedSteps = setupSteps.filter(step => step.completed).length;
    const totalSteps = setupSteps.length;
    return (
        <>
            {/* Setup Guide */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Hướng dẫn sử dụng</h2>
                            <p className="text-gray-600">5 bước đơn giản để chatbot hoạt động</p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <p className="text-gray-600 mb-4">
                        Chỉ cần 5 bước đơn giản để chatbot của bạn sẵn sàng thu thập và chăm sóc khách hàng:
                    </p>

                    <div className="space-y-3">
                        {setupSteps.map((step, index) => (
                            <div key={index} className={`transition-colors cursor-pointer ${step.completed
                                ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                } rounded-lg overflow-hidden`}>
                                {/* Main Step Content */}
                                <div className="flex items-start space-x-4 p-4">
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${step.completed
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {step.completed ? '✓' : step.step}
                                    </div>

                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className={`p-2 rounded-lg ${step.completed
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {step.icon}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className={`text-base font-medium ${step.completed
                                                ? 'text-green-800'
                                                : 'text-gray-700'
                                                }`}>
                                                {step.title}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Task List */}
                                <div className="px-4 pb-4">
                                    <div className="ml-11 pl-4 border-l border-gray-200">
                                        <p className="text-sm text-gray-600 mb-2 font-medium">Nhiệm vụ cần thực hiện:</p>
                                        <ul className="space-y-1">
                                            {step.tasks.map((task, taskIndex) => (
                                                <li key={taskIndex} className="text-sm text-gray-600 flex items-start space-x-2">
                                                    <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0 mt-2"></span>
                                                    <span>{task}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Guide