import { useEffect, useState } from "react"
import {
    MessageSquare,
    Users,
    BarChart3,
    Bell,
    FileSpreadsheet,
    Bot,
    Search,
    Facebook,
    MessageCircle,
    Globe,
    Zap,
    ArrowRight,
    User2Icon,
} from "lucide-react"
import { getUsers } from "../../services/userService"
import { useNavigate } from "react-router-dom"
import { get_llm_by_id } from "../../services/llmService"
import { getAllChatHistory } from "../../services/messengerService"
import { getAllKnowledgeBases } from "../../services/knowledgeService"
export const Dashboard = () => {
    const [data, setData] = useState([])
    const [bot, setBot] = useState()
    const [knowledgeService, setKnowledgeService] = useState()
    const [chat, setChat] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)

            const [users, chatbot, knowledge, historyChat] = await Promise.all([
                getUsers(),
                get_llm_by_id(1),
                getAllKnowledgeBases(),
                getAllChatHistory(),
            ])

            setData(users)
            setBot(chatbot)
            setKnowledgeService(knowledge)
            setChat(historyChat)
            setLoading(false)
        }
        fetchData()
    }, [])

    const isConfigured = bot?.key && bot?.name && bot?.system_greeting
    const isKnowledgeService = knowledgeService?.source && knowledgeService?.content && knowledgeService?.title
    const navigate = useNavigate()

    const quickChatLinks = [
        {
            title: "Chat Trực Tiếp Với Khách Hàng",
            subtitle: "Kết nối ngay với khách hàng",
            description: "Trò chuyện trực tiếp với khách hàng đang online",
            icon: <MessageSquare className="w-8 h-8 text-white" />,
            bgGradient: "bg-blue-500",
            path: "/admin/chat",
            badge: "HOT",
            badgeColor: "bg-red-500",
        },
        {
            title: "Gửi tin nhắn tới các khách hàng",
            subtitle: "Tin nhắn thông báo tới khách hàng",
            description: "Bot AI thông minh phục vụ khách hàng mọi lúc",
            icon: <Bot className="w-8 h-8 text-white" />,
            bgGradient: "bg-blue-500",
            path: "/dashboard/send-messages",
            badge: "NEW",
            badgeColor: "bg-green-500",
        },
        {
            title: "Xem thông tin khách hàng",
            subtitle: "Thông tin khách hàng đăng ký tư vấn",
            description: "Trò chuyện trực tiếp với khách hàng đang online",
            icon: <User2Icon className="w-8 h-8 text-white" />,
            bgGradient: "bg-blue-500",
            path: "/dashboard/export",
            badge: "HOT",
            badgeColor: "bg-red-500",
        },
    ]

    const statusCards = [
        isConfigured
            ? {
                title: "Cấu hình chatbot",
                subtitle: "Chatbot",
                status: "Đã cấu hình",
                statusColor: "text-green-600",
                icon: <Bot className="w-6 h-6 text-green-600" />,
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                path: "/dashboard/cau-hinh-he-thong",
                cardStatus: "Cấu hình hoàn tất và đang hoạt động",
            }
            : {
                title: "Cấu hình chatbot",
                subtitle: "Chưa hoàn thành",
                status: "Chưa hoàn thành",
                statusColor: "text-red-600",
                icon: <Bot className="w-6 h-6 text-red-600" />,
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                path: "/dashboard/cau-hinh-he-thong",
                cardStatus: "Cấu hình chưa hoàn tất",
            },
        isKnowledgeService
            ? {
                title: "Dữ liệu tư vấn",
                subtitle: "Google Sheets",
                status: "Đã cấu hình",
                statusColor: "text-green-600",
                icon: <FileSpreadsheet className="w-6 h-6 text-green-600" />,
                bgColor: "bg-green-50",
                borderColor: "border-green-200",
                path: "/dashboard/cau-hinh-kien-thuc",
                cardStatus: "Cấu hình hoàn tất và đang hoạt động",
            }
            : {
                title: "Dữ liệu tư vấn",
                subtitle: "Google Sheets",
                status: "Chưa hoàn thành",
                statusColor: "text-red-600",
                icon: <FileSpreadsheet className="w-6 h-6 text-red-600" />,
                bgColor: "bg-red-50",
                borderColor: "border-red-200",
                path: "/dashboard/cau-hinh-kien-thuc",
                cardStatus: "Cấu hình chưa hoàn tất",
            },
        {
            title: "Kết quả tìm kiếm",
            subtitle: "Search",
            status: "Đã cấu hình",
            statusColor: "text-green-600",
            icon: <Search className="w-6 h-6 text-green-600" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            path: "/dashboard/cau-hinh-kien-thuc",
            cardStatus: "Cấu hình hoàn tất và đang hoạt động",
        },
    ]

    const chatChannels = [
        {
            name: "Zalo",
            configured: "Đã cấu hình",
            icon: <MessageSquare className="w-5 h-5" />,
            path: "/admin/facebook_page",
        },
        {
            name: "Facebook",
            configured: "Đã cấu hình",
            icon: <Facebook className="w-5 h-5" />,
            path: "/admin/facebook_page",
        },
        {
            name: "Website",
            configured: "Đã cấu hình",
            icon: <Globe className="w-5 h-5" />,
            path: "/admin/facebook_page",
        },
    ]

    const notificationBots = [
        {
            name: "Zalo",
            configured: "Đã cấu hình",
            icon: <MessageSquare className="w-5 h-5" />,
            path: "/admin/facebook_page",
        },
        {
            name: "Telegram",
            configured: "Chưa cấu hình",
            icon: <MessageCircle className="w-5 h-5" />,
            path: "/admin/facebook_page",
        },
    ]

    const statsCards = [
        {
            name: "Số người dùng",
            configured: data?.length || 0,
            icon: <Users className="w-6 h-6 text-blue-600" />,
            path: "/admin/users",
        },
        {
            name: "Số cuộc trò chuyện",
            configured: chat?.length || 0,
            icon: <MessageSquare className="w-6 h-6 text-green-600" />,
            path: "/admin/chat",
        },
    ]

    const chatChannelStatus = chatChannels.some((channel) => channel.configured)
    const notificationBotStatus = notificationBots.some((bot) => bot.configured)
    const statsCardsStatus = statsCards.some((stat) => stat.configured > 0)

    const groupCards = [
        {
            title: "Kênh Chat",
            statusColor: chatChannelStatus ? "text-green-600" : "text-red-600",
            icon: <MessageSquare className={`w-6 h-6 ${chatChannelStatus ? "text-green-600" : "text-red-600"}`} />,
            bgColor: chatChannelStatus ? "bg-green-50" : "bg-red-50",
            borderColor: chatChannelStatus ? "border-green-200" : "border-red-200",
            channels: chatChannels,
        },
        {
            title: "Bot thông báo",
            statusColor: notificationBotStatus ? "text-green-600" : "text-red-600",
            icon: <Bell className={`w-6 h-6 ${notificationBotStatus ? "text-green-600" : "text-red-600"}`} />,
            bgColor: notificationBotStatus ? "bg-green-50" : "bg-red-50",
            borderColor: notificationBotStatus ? "border-green-200" : "border-red-200",
            channels: notificationBots,
        },
        {
            title: "Thống kê",
            statusColor: statsCardsStatus ? "text-green-600" : "text-red-600",
            icon: <BarChart3 className={`w-6 h-6 ${statsCardsStatus ? "text-green-600" : "text-red-600"}`} />,
            bgColor: statsCardsStatus ? "bg-green-50" : "bg-red-50",
            borderColor: statsCardsStatus ? "border-green-200" : "border-red-200",
            channels: statsCards,
        },
    ]

    return (
        <div className="flex-1 p-4 lg:p-6 bg-gray-50 min-h-screen overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-1">🚀 Tổng quan hệ thống</h1>
                            <p className="text-gray-600">Trạng thái cấu hình và thống kê tổng quan</p>
                        </div>
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg border border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium">Hệ thống hoạt động</span>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Truy cập nhanh</h2>
                        <span className="text-sm text-gray-500">- Kết nối với khách hàng ngay lập tức</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickChatLinks.map((link, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(link.path)}
                                className={`rounded-2xl border border-gray-200 bg-white p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-blue-300">{link.icon}</div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                                            <p className="text-sm text-gray-500">{link.subtitle}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <p className="text-gray-600 text-sm leading-relaxed">{link.description}</p>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Status Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statusCards.map((card, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(card.path)}
                            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 hover:bg-opacity-80 transition-colors cursor-pointer`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg">{card.icon}</div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">{card.title}</span>
                                    </div>
                                </div>
                                <div
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${card.status === "Đã cấu hình" ? "bg-green-100 border-green-300" : "bg-red-100 border-red-300"} ${card.statusColor} font-medium border`}
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${card.status === "Đã cấu hình" ? "bg-green-500" : "bg-red-500"}`}
                                    ></div>
                                    {card.status}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.subtitle}</h3>
                            <div className="text-sm text-gray-600">{card.cardStatus}</div>
                        </div>
                    ))}
                </div>

                {/* Group Cards - Kênh Chat và Bot thông báo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {groupCards.map((group, index) => (
                        <div key={index} className={`${group.bgColor} ${group.borderColor} border rounded-lg p-4`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 bg-white rounded-lg`}>
                                        <div className={group.statusColor}>{group.icon}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">{group.title}</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{group.subtitle}</h3>

                            {/* Danh sách các kênh con */}
                            <div className="space-y-2">
                                {group.channels.map((channel, channelIndex) => (
                                    <div
                                        key={channelIndex}
                                        onClick={() => navigate(channel.path)}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`${channel.configured}`}>{channel.icon}</div>
                                            <span className="text-sm font-medium text-gray-700">{channel.name}</span>
                                        </div>
                                        <div
                                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${channel.configured ? "bg-green-100 text-green-600 border-green-300" : "bg-gray-100 text-gray-600 border-gray-300"} font-medium border`}
                                        >
                                            {channel.configured}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
