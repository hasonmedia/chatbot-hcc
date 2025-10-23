import React from 'react';
import { Users, MessageSquare, Tag, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ViewerDashboard = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Gửi tin nhắn',
            description: 'Gửi tin nhắn hàng loạt cho khách hàng',
            icon: MessageSquare,
            color: 'bg-blue-500',
            path: '/viewer/send-messages',
            stats: 'Quản lý tin nhắn'
        },
        {
            title: 'Dữ liệu khách hàng',
            description: 'Xem và xuất dữ liệu khách hàng',
            icon: Users,
            color: 'bg-green-500',
            path: '/viewer/export-data',
            stats: 'Quản lý dữ liệu'
        },
        {
            title: 'Quản lý Tag',
            description: 'Xem và quản lý các tag khách hàng',
            icon: Tag,
            color: 'bg-purple-500',
            path: '/viewer/tags',
            stats: 'Phân loại khách hàng'
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dashboard Viewer
                </h1>
                <p className="text-gray-600">
                    Chào mừng bạn đến với hệ thống quản lý khách hàng. Bạn có quyền truy cập các tính năng sau:
                </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            onClick={() => navigate(feature.path)}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${feature.color}`}>
                                        <IconComponent className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {feature.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        {feature.stats}
                                    </span>
                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                        Truy cập →
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Quyền truy cập của bạn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="font-medium text-gray-900">Gửi tin nhắn</h3>
                        <p className="text-sm text-gray-600">Gửi tin nhắn hàng loạt</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="font-medium text-gray-900">Xem dữ liệu</h3>
                        <p className="text-sm text-gray-600">Truy cập thông tin khách hàng</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Tag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="font-medium text-gray-900">Quản lý Tag</h3>
                        <p className="text-sm text-gray-600">Phân loại và gắn thẻ</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewerDashboard;