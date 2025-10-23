const FacebookPageStats = ({ pages }) => {
    const total = pages.length;
    const active = pages.filter(p => p.is_active).length;
    const inactive = total - active;

    const stats = [
        {
            title: 'Tổng Fanpages',
            value: total,
            icon: '📘',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-200',
            iconBg: 'bg-blue-500'
        },
        {
            title: 'Đang Hoạt Động',
            value: active,
            icon: '✅',
            textColor: 'text-green-600',
            borderColor: 'border-green-200',
            iconBg: 'bg-green-500'
        },
        {
            title: 'Tạm Dừng',
            value: inactive,
            icon: '⏸️',
            textColor: 'text-red-600',
            borderColor: 'border-red-200',
            iconBg: 'bg-red-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 ${stat.iconBg} rounded-full`}></div>
                                <span className="text-xs text-gray-500">
                                    {index === 0 && 'Tổng số fanpage'}
                                    {index === 1 && 'Sẵn sàng nhận tin nhắn'}
                                    {index === 2 && 'Không hoạt động'}
                                    {index === 1 && total > 0 && ` (${Math.round((active / total) * 100)}%)`}
                                </span>
                            </div>
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl`}>
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FacebookPageStats;