import { useEffect, useState } from "react";
import ZaloBotStats from "../../components/zaloBot/ZaloBotStats";
import ZaloBotCard from "../../components/zaloBot/ZaloBotCard";
import ZaloBotForm from "../../components/zaloBot/ZaloBotForm";
import {
    getZaloBots,
    createZaloBot,
    updateZaloBot,
    deleteZaloBot,
    toggleZaloBotStatus,
} from "../../services/zaloService";
import SimplePlatformPage from "../../components/common/SimplePlatformPage";

const ZaloBotPage = () => {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getZaloBots();
                setBots(res);
            } catch (error) {
                console.error("Error fetching zalo bots:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (data) => {
        try {
            if (editing) {
                const updated = await updateZaloBot(editing.id, data);
                setBots(bots.map((b) => (b.id === editing.id ? updated : b)));
            } else {
                const created = await createZaloBot(data);
                setBots([...bots, created]);
            }
            setShowForm(false);
            setEditing(null);
        } catch (error) {
            console.error("Error submitting zalo bot:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteZaloBot(id);
            setBots(bots.filter((b) => b.id !== id));
        } catch (error) {
            console.error("Error deleting zalo bot:", error);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const updated = await toggleZaloBotStatus(id);
            setBots(bots.map((b) => (b.id === id ? updated : b)));
        } catch (error) {
            console.error("Error toggling zalo bot status:", error);
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
            StatsComponent={({ data }) => <ZaloBotStats bots={bots} />}
            TableComponent={({ data, onEdit }) => (
                <ZaloBotCard
                    data={data.length ? data[0] : null}
                    onEdit={onEdit}
                    onToggleStatus={handleToggleStatus}
                />
            )}
            FormComponent={ZaloBotForm}
        />
    );
};

export default ZaloBotPage;
