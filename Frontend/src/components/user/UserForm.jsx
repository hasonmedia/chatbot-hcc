import { useState, useEffect } from "react";

const UserForm = ({ initialData, onSubmit, onCancel, currentUserRole, isProfileMode = false }) => {
    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        email: "",
        role: "",
        password: "",
        is_active: true,
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const roleHierarchy = ['viewer', 'admin', 'superadmin', 'root'];

    const getRoleLevel = (role) => {
        return roleHierarchy.indexOf(role?.toLowerCase());
    };

    const getAllRoleOptions = () => [
        { value: "root", label: "Siêu quản trị (Root)", color: "text-purple-600" },
        { value: "superadmin", label: "Quản trị cấp cao", color: "text-red-600" },
        { value: "admin", label: "Quản trị viên", color: "text-blue-600" },
        { value: "viewer", label: "Nhân viên", color: "text-gray-600" }
    ];

    // Filter role options based on current user's permission
    const getAvailableRoleOptions = () => {
        const allOptions = getAllRoleOptions();
        if (!currentUserRole) return allOptions;

        const currentLevel = getRoleLevel(currentUserRole);
        return allOptions.filter(option => {
            const optionLevel = getRoleLevel(option.value);
            return optionLevel <= currentLevel;
        });
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                full_name: initialData.full_name,
                username: initialData.username,
                email: initialData.email,
                role: initialData.role,
                password: "",
                is_active: initialData.is_active || true,
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation - role không bắt buộc trong profile mode
        const requiredFields = ['full_name', 'username', 'email'];
        if (!isProfileMode) {
            requiredFields.push('role');
        }

        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            setError("Tất cả các trường bắt buộc phải được điền");
            return;
        }

        // Check permission for role assignment (skip in profile mode)
        if (!isProfileMode && currentUserRole) {
            const currentLevel = getRoleLevel(currentUserRole);
            const targetLevel = getRoleLevel(formData.role);
            if (targetLevel > currentLevel) {
                setError("Bạn không có quyền gán vai trò này!");
                return;
            }
        }

        // Nếu thêm mới, password bắt buộc, nếu edit thì password có thể để trống
        if (!initialData && !formData.password) {
            setError("Mật khẩu là bắt buộc cho người dùng mới");
            return;
        }

        setIsLoading(true);
        try {
            // Tạo bản sao formData và loại bỏ role nếu ở chế độ profile
            const dataToSubmit = { ...formData };
            if (isProfileMode) {
                delete dataToSubmit.role; // Không gửi role trong profile mode
            }

            console.log(dataToSubmit);
            await onSubmit(dataToSubmit);
        } catch (err) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    const roleOptions = getAvailableRoleOptions();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-start sm:items-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 w-full max-w-xs sm:max-w-lg lg:max-w-2xl mt-4 sm:mt-0 max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-xl">

                {/* Header */}
                <div className="bg-gray-600 p-4 sm:p-6 text-white">
                    <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-lg sm:text-xl">👤</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-xl font-semibold mb-1">
                                {isProfileMode ? "Cập nhật thông tin cá nhân" :
                                    initialData ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
                            </h2>
                            <p className="text-gray-100 text-xs sm:text-sm">
                                {isProfileMode ? "Chỉnh sửa thông tin cá nhân của bạn" :
                                    initialData ? "Cập nhật thông tin người dùng" : "Thêm thành viên mới vào hệ thống"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-3 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 180px)' }}>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                            <div className="flex items-start gap-2">
                                <span className="text-red-500 flex-shrink-0">⚠️</span>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-1 sm:space-y-2">
                                <label className="block text-gray-700 font-medium text-sm">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="Nhập họ và tên..."
                                    required
                                />
                            </div>

                            {/* Username */}
                            <div className="space-y-1 sm:space-y-2">
                                <label className="block text-gray-700 font-medium text-sm">
                                    Tên đăng nhập *
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent font-mono"
                                    placeholder="Nhập tên đăng nhập..."
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1 sm:space-y-2">
                                <label className="block text-gray-700 font-medium text-sm">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                    placeholder="example@domain.com"
                                    required
                                />
                            </div>

                            {/* Role - Hidden in profile mode */}
                            {!isProfileMode && (
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="block text-gray-700 font-medium text-sm">
                                        Vai trò *
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Chọn vai trò...</option>
                                        {roleOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {currentUserRole && roleOptions.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠️ Bạn không có quyền tạo người dùng với bất kỳ vai trò nào.
                                        </p>
                                    )}
                                    {currentUserRole && roleOptions.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Bạn chỉ có thể gán vai trò thấp hơn quyền của mình ({currentUserRole}).
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Role display only in profile mode */}
                            {isProfileMode && (
                                <div className="space-y-1 sm:space-y-2">
                                    <label className="block text-gray-700 font-medium text-sm">
                                        Vai trò hiện tại
                                    </label>
                                    <div className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg bg-gray-50">
                                        <span className={`font-medium ${formData.role === 'root' ? 'text-purple-600' :
                                            formData.role === 'superadmin' ? 'text-red-600' :
                                                formData.role === 'admin' ? 'text-blue-600' :
                                                    'text-gray-600'
                                            }`}>
                                            {getAllRoleOptions().find(option => option.value === formData.role)?.label || formData.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Bạn không thể thay đổi vai trò của chính mình.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1 sm:space-y-2">
                            <label className="block text-gray-700 font-medium text-sm">
                                Mật khẩu {initialData ? "" : "*"}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                placeholder={initialData ? "Để trống để giữ mật khẩu hiện tại" : "Nhập mật khẩu..."}
                            />
                            {initialData && (
                                <p className="text-xs sm:text-sm text-gray-500">
                                    Để trống nếu không muốn thay đổi mật khẩu
                                </p>
                            )}
                        </div>

                        {/* Active Status */}
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                            <div className="flex items-start sm:items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">Trạng thái hoạt động</h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mt-1">Cho phép người dùng đăng nhập và sử dụng hệ thống</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-3 sm:p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full sm:w-auto order-1 sm:order-2 px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang xử lý...</span>
                                </div>
                            ) : (
                                <>
                                    {initialData ? "Cập nhật" : "Tạo mới"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserForm;