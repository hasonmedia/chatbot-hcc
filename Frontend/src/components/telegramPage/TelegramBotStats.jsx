// components/telegramBot/TelegramBotStats.js
const TelegramBotStats = ({ bots = [] }) => {
    const totalBots = bots.length;
    const activeBots = bots.filter(bot => bot.is_active).length;
    const inactiveBots = totalBots - activeBots;

    const stats = [
        {
            title: "Tổng số Bot",
            value: totalBots,
            icon: "🤖"
        },
        {
            title: "Bot đang hoạt động",
            value: activeBots,
            icon: "✅"
        },
        {
            title: "Bot tạm dừng",
            value: inactiveBots,
            icon: "❌"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                {stat.title}
                            </p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stat.value}
                            </p>
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

export default TelegramBotStats;