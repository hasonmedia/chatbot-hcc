

export const KnowledgeForm = ({ formData, handleChange, handleSubmit, handleCancel, loading, isEdit }) => {
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        handleChange({ target: { name, value: checked } });
    };
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">
                {isEdit ? "Sửa kiến thức" : "Thêm kiến thức mới"}
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tiêu đề..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục
                    </label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập danh mục..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung *
                    </label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                        placeholder="Nhập nội dung kiến thức..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nguồn
                    </label>
                    <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nguồn kiến thức..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dữ liệu khách hàng
                    </label>
                    <input
                        type="text"
                        name="customer_id"
                        value={formData.customer_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dữ liệu khách hàng..."
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active || false}
                        onChange={handleCheckboxChange}
                        className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                        Kích hoạt
                    </label>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Đang xử lý..." : (isEdit ? "Cập nhật" : "Tạo mới")}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div >
    );
};