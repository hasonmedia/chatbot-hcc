import React, { useState } from 'react';
import { X } from "lucide-react";

const ManualModeModal = ({ onClose, onConfirm }) => {
    const [selectedOption, setSelectedOption] = useState('1-hour');

    const timeOptions = [
        {
            id: '1-hour',
            title: '1 giờ',
            description: 'Kích hoạt bot sau 1 giờ (đếm ngược)',
            value: '1-hour',
        },
        {
            id: '4-hour',
            title: '4 giờ',
            description: 'Kích hoạt bot sau 4 giờ (đếm ngược)',
            value: '4-hour',
        },
        {
            id: '8am-tomorrow',
            title: 'Đến 8 giờ sáng hôm sau',
            description: 'Kích hoạt bot vào 8:00 AM ngày mai (đếm ngược)',
            value: '8am-tomorrow',
        },
        {
            id: 'manual-only',
            title: 'Thủ công hoàn toàn',
            description: 'Tắt bot vĩnh viễn, chỉ bật lại khi thủ công',
            value: 'manual-only',
        },
    ];

    const handleOptionChange = (optionValue) => {
        setSelectedOption(optionValue);
    };

    const handleConfirm = () => {
        onConfirm(selectedOption);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all scale-95 hover:scale-100">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl">
                            🤝
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Chuyển sang chế độ thủ công
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Chọn thời gian tắt chatbot cho phiên này
                            </p>
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                    {timeOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedOption === option.value
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            onClick={() => handleOptionChange(option.value)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    <input
                                        type="radio"
                                        name="timeOption"
                                        value={option.value}
                                        checked={selectedOption === option.value}
                                        onChange={() => handleOptionChange(option.value)}
                                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 mb-1 text-lg">
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {option.description}
                                    </p>
                                </div>
                            </div>
                            {selectedOption === option.value && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualModeModal;