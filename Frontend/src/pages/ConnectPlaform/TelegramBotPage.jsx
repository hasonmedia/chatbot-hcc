import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import TelegramBotStats from "../../components/telegramPage/TelegramBotStats";
import TelegramBotCard from "../../components/telegramPage/TelegramBotTable";
import TelegramBotForm from "../../components/telegramPage/TelegramBotForm";
import {
    getTelegramBots,
    createTelegramBot,
    updateTelegramBot,
    deleteTelegramBot,
    toggleTelegramBotStatus,
} from "../../services/telegramService";
import SimplePlatformPage from "../../components/common/SimplePlatformPage";

const TelegramBotPage = () => {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getTelegramBots();
                setBots(res);
            } catch (error) {
                console.error("Error fetching telegram bots:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (data) => {
        try {
            if (editing) {
                const updated = await updateTelegramBot(editing.id, data);
                setBots(bots.map((b) => (b.id === editing.id ? updated : b)));
            } else {
                const created = await createTelegramBot(data);
                setBots([...bots, created]);
            }
            setShowForm(false);
            setEditing(null);
        } catch (error) {
            console.error("Error submitting telegram bot:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTelegramBot(id);
            setBots(bots.filter((b) => b.id !== id));
        } catch (error) {
            console.error("Error deleting telegram bot:", error);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const updated = await toggleTelegramBotStatus(id);
            setBots(bots.map((b) => (b.id === id ? updated : b)));
        } catch (error) {
            console.error("Error toggling telegram bot status:", error);
        }
    };

    return (
        <SimplePlatformPage
            data={bots.length ? [bots[0]] : []}
            loading={loading}
            showForm={showForm}
            editing={editing}
            onEdit={(bot) => {
                setEditing(bot);
                setShowForm(true);
            }}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            onCancel={() => {
                setShowForm(false);
                setEditing(null);
            }}
            onAddNew={() => setShowForm(true)}
            StatsComponent={({ data }) => <TelegramBotStats bots={bots} />}
            TableComponent={({ data, onEdit }) => (
                <TelegramBotCard
                    data={data.length ? data[0] : null}
                    onEdit={onEdit}
                    onToggleStatus={handleToggleStatus}
                />
            )}
            FormComponent={TelegramBotForm}
        />
    );
};

export default TelegramBotPage;