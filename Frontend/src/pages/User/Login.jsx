import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../components/context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await login(formData.username, formData.password);
            if (res.error) {
                setError(res.error);
                setIsLoading(false);
                return;
            }
            setError("");
            alert("Login thành công");
            navigate("/");
        } catch (err) {
            setError("Đăng nhập thất bại, vui lòng kiểm tra lại thông tin");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                {/* Simple Login Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-white text-xl">🔐</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h1>
                        <p className="text-gray-600 text-sm">Truy cập vào hệ thống quản lý</p>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Username */}
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                            </div>

                            {/* Remember me & Forgot password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <div className="text-xs text-gray-600 leading-relaxed text-center">
                                <a
                                    href="https://a2alab.vn/terms/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Thoả thuận sử dụng
                                </a>
                                {' '}|{' '}
                                <a
                                    href="https://a2alab.vn/privacy-policy/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Chính sách bảo mật
                                </a>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>Đang đăng nhập...</span>
                                    </div>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="text-center pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{' '}
                                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                    Liên hệ quản trị viên
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom text */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        © 2024 Hệ thống quản lý Chat AI
                    </p>
                </div>
            </div>
        </div>
    );
}