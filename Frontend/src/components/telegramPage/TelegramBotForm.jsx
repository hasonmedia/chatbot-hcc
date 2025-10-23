// components/telegramBot/TelegramBotForm.js
import { useState, useEffect } from "react";

const TelegramBotForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        bot_name: "",
        bot_token: "",
        description: "",
        is_active: true,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                bot_name: initialData.bot_name || "",
                bot_token: initialData.bot_token || "",
                description: initialData.description || "",
                is_active: initialData.is_active ?? true,
            });
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.bot_name.trim()) {
            newErrors.bot_name = "Tên bot là bắt buộc";
        }

        if (!formData.bot_token.trim()) {
            newErrors.bot_token = "Token bot là bắt buộc";
        } else {
            // Validate Telegram bot token format (basic validation)
            const tokenPattern = /^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/;
            if (!tokenPattern.test(formData.bot_token)) {
                newErrors.bot_token = "Token bot không đúng định dạng (ví dụ: 123456789:ABCdefGHIjklMNOpqrSTUvwxyz)";
            }
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Mô tả không được vượt quá 500 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error submitting form:", error);
            // You might want to show an error message to the user here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">
                        {initialData ? "Chỉnh sửa Bot" : "Thêm Bot Mới"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên Bot *
                            </label>
                            <input
                                type="text"
                                name="bot_name"
                                value={formData.bot_name}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bot_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Nhập tên bot"
                                disabled={isSubmitting}
                            />
                            {errors.bot_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.bot_name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bot Token *
                            </label>
                            <input
                                type="text"
                                name="bot_token"
                                value={formData.bot_token}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${errors.bot_token ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                                disabled={isSubmitting}
                            />
                            {errors.bot_token && (
                                <p className="text-red-500 text-sm mt-1">{errors.bot_token}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                Lấy token từ @BotFather trên Telegram
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Mô tả ngắn về bot (tùy chọn)"
                                disabled={isSubmitting}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">
                                {formData.description.length}/500 ký tự
                            </p>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700">
                                Bot hoạt động
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang lưu..." : (initialData ? "Cập nhật" : "Tạo Bot")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TelegramBotForm;