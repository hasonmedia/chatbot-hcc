import { useState, useEffect } from "react";

const FacebookPageForm = ({ onSubmit, onCancel, initialData }) => {
    const [form, setForm] = useState({
        page_id: "",
        page_name: "",
        access_token: "",
        webhook_verify_token: "",
        description: "",
        category: "",
        avatar_url: "",
        cover_url: "",
        is_active: true,
        auto_response_enabled: true,
    });

    useEffect(() => {
        if (initialData) setForm(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">📘</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {initialData ? "Cập nhật Fanpage" : "Thêm Fanpage"}
                            </h2>
                            <p className="text-blue-100 mt-1">
                                {initialData ? "Cập nhật thông tin fanpage" : "Thêm fanpage mới vào hệ thống"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📄 Page ID *
                                </label>
                                <input
                                    type="text"
                                    name="page_id"
                                    value={form.page_id}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Nhập Page ID"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📝 Tên Fanpage *
                                </label>
                                <input
                                    type="text"
                                    name="page_name"
                                    value={form.page_name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Nhập tên fanpage"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🔑 Access Token *
                                </label>
                                <input
                                    type="password"
                                    name="access_token"
                                    value={form.access_token}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                                    placeholder="Nhập access token"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📂 Danh mục
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Chọn danh mục</option>
                                    <option value="business">Doanh nghiệp</option>
                                    <option value="personal">Cá nhân</option>
                                    <option value="brand">Thương hiệu</option>
                                    <option value="community">Cộng đồng</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🔐 Webhook Verify Token
                                </label>
                                <input
                                    type="text"
                                    name="webhook_verify_token"
                                    value={form.webhook_verify_token}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                                    placeholder="Nhập webhook verify token"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📄 Mô tả
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="Nhập mô tả về fanpage..."
                            />
                        </div>

                        {/* Image URLs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🖼️ Avatar URL
                                </label>
                                <input
                                    type="url"
                                    name="avatar_url"
                                    value={form.avatar_url}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🎨 Cover URL
                                </label>
                                <input
                                    type="url"
                                    name="cover_url"
                                    value={form.cover_url}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="https://example.com/cover.jpg"
                                />
                            </div>
                        </div>

                        {/* Toggle Options */}
                        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                ⚙️ Cài đặt
                            </h3>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <div>
                                    <label htmlFor="is_active" className="font-medium text-gray-700">
                                        Kích hoạt Fanpage
                                    </label>
                                    <p className="text-sm text-gray-500">Cho phép fanpage hoạt động trong hệ thống</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                <div>
                                    <label htmlFor="auto_response_enabled" className="font-medium text-gray-700">
                                        Tự động trả lời
                                    </label>
                                    <p className="text-sm text-gray-500">Bật tự động trả lời tin nhắn</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="auto_response_enabled"
                                        name="auto_response_enabled"
                                        checked={form.auto_response_enabled}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        ❌ Hủy
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                        💾 {initialData ? "Cập nhật" : "Thêm mới"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FacebookPageForm;