
const TelegramBotCard = ({ data, onEdit, onToggleStatus }) => {
    if (!data) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500">Chưa có bot nào được tạo.</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN");
    };

    const truncateToken = (token) => {
        if (!token) return "";
        return token.length > 20 ? `${token.substring(0, 20)}...` : token;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{data.bot_name}</h2>
                <button
                    onClick={() => onEdit(data)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Sửa
                </button>
            </div>

            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-600">Token:</span>
                    <code className="bg-gray-50 px-3 py-2 rounded-lg text-sm border">
                        {truncateToken(data.bot_token)}
                    </code>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-600">Mô tả:</span>
                    <span className="text-sm text-gray-700">{data.description || "Không có mô tả"}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-600">Bật/Tắt:</span>
                            <button
                                onClick={() => onToggleStatus && onToggleStatus(data.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    data.is_active
                                        ? 'bg-green-500 focus:ring-green-500'
                                        : 'bg-gray-300 focus:ring-gray-400'
                                }`}
                                title={data.is_active ? 'Tắt bot' : 'Bật bot'}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        data.is_active ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${data.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {data.is_active ? "Hoạt động" : "Tạm dừng"}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500">Ngày tạo</span>
                        <div className="text-sm text-gray-700">{formatDate(data.created_at)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelegramBotCard;
