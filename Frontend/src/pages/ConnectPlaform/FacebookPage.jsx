import { useEffect, useState } from "react";
import { MessageCircle, Bell, Facebook, Send, Zap, Code } from "lucide-react";
import FacebookPageStats from "../../components/facebookPage/FacebookPageStats";
import FacebookPageTable from "../../components/facebookPage/FacebookPageTable";
import FacebookPageForm from "../../components/facebookPage/FacebookPageForm";
import {
    getFacebookPages,
    createFacebookPage,
    updateFacebookPage,
    deleteFacebookPage,
    toggleFacebookPageStatus,
} from "../../services/facebookPageService";
import LoginWithFb from "../../components/LoginWithFb";
import TelegramBotPage from "./TelegramBotPage";
import ZaloBotPage from "./ZaloBotPage";
import NotificationChannelPage from "./NotificationChannelPage";
import WidgetPage from "./WidgetPage";
import PageLayout from "../../components/common/PageLayout";
import SubTabNavigation from "../../components/common/SubTabNavigation";
import PlatformContent from "../../components/common/PlatformContent";

const FacebookPage = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [activeTab, setActiveTab] = useState('chat');
    const [activeChatTab, setActiveChatTab] = useState('facebook');

    useEffect(() => {
        const fetchData = async () => {
            const res = await getFacebookPages();
            setPages(res);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleSubmit = async (data) => {
        if (editing) {
            const updated = await updateFacebookPage(editing.id, data);
            setPages(pages.map((p) => (p.id === editing.id ? updated : p)));
        } else {
            const created = await createFacebookPage(data);
            setPages([...pages, created]);
        }
        setShowForm(false);
        setEditing(null);
    };

    const handleDelete = async (id) => {
        await deleteFacebookPage(id);
        setPages(pages.filter((p) => p.id !== id));
    };

    const handleToggleStatus = async (id) => {
        const updated = await toggleFacebookPageStatus(id);
        setPages(pages.map((p) => (p.id === id ? updated : p)));
    };

    const mainTabs = [
        {
            id: 'chat',
            name: 'Quản lý kênh chat',
            icon: MessageCircle,
            description: 'Kết nối và quản lý các nền tảng chat với khách hàng'
        },
        {
            id: 'notification',
            name: 'Quản lý kênh thông báo',
            icon: Bell,
            description: 'Thiết lập và quản lý các kênh thông báo tự động'
        },
        {
            id: 'widget',
            name: 'Widget',
            icon: Code,
            description: 'Nhúng chatbot vào website của bạn'
        }
    ];

    const chatTabs = [
        { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
        { id: 'telegram', name: 'Telegram', icon: Send, color: 'bg-sky-500' },
        { id: 'zalo', name: 'Zalo', icon: Zap, color: 'bg-blue-500' }
    ];

    const renderChatContent = () => {
        switch (activeChatTab) {
            case 'facebook':
                return (
                    <PlatformContent
                        loading={loading}
                        stats={<FacebookPageStats pages={pages} />}
                        table={
                            <FacebookPageTable
                                data={pages}
                                onEdit={(page) => {
                                    setEditing(page);
                                    setShowForm(true);
                                }}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                            />
                        }
                        form={
                            <FacebookPageForm
                                initialData={editing}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditing(null);
                                }}
                            />
                        }
                        showForm={showForm}
                    />
                );
            case 'telegram':
                return <TelegramBotPage />;
            case 'zalo':
                return <ZaloBotPage />;
            default:
                return null;
        }
    };

    const renderMainContent = () => {
        switch (activeTab) {
            case 'chat':
                return (
                    <div className="space-y-6">
                        <SubTabNavigation
                            tabs={chatTabs}
                            activeTab={activeChatTab}
                            onTabChange={setActiveChatTab}
                            actionButton={activeChatTab === 'facebook' && <LoginWithFb />}
                        />
                        {renderChatContent()}
                    </div>
                );
            case 'notification':
                return <NotificationChannelPage />;
            case 'widget':
                return <WidgetPage />;
            default:
                return null;
        }
    };

    return (
        <PageLayout
            title="Kết nối Nền tảng"
            subtitle="Quản lý kênh chat và thông báo với khách hàng"
            icon={MessageCircle}
            tabs={mainTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderMainContent()}
        </PageLayout>
    );
};

export default FacebookPage;