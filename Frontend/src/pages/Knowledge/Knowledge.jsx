import { getKnowledgeById, postKnowledge, updateKnowledge } from "../../services/knowledgeService";
import { useState, useEffect } from "react";
import { Edit, BookOpen, Search } from "lucide-react";
import { KnowledgeForm } from "../../components/knowledge/KnowledgeForm";
import { KnowledgeView } from "../../components/knowledge/KnowledgeView";
import SearchComponent from "../../components/SearchComponent";

const KnowledgePage = () => {
    const [knowledge, setKnowledge] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        source: "",
        category: "",
        customer_id: "",
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [currentView, setCurrentView] = useState('detail');
    const [activeTab, setActiveTab] = useState('knowledge'); // Tab state

    // Lấy dữ liệu khi mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialLoading(true);
                const data = await getKnowledgeById(); // không truyền id
                setKnowledge(data);
                if (data) {
                    setCurrentView('detail');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, []);

    // Khi bấm nút sửa
    const handleEdit = () => {
        console.log("Editing knowledge:", knowledge);
        if (!knowledge) return;
        setFormData({
            title: knowledge.title || "",
            content: knowledge.content || "",
            source: knowledge.source || "",
            category: knowledge.category || "",
            is_active: knowledge.is_active || false,
            customer_id: knowledge.customer_id || ""
        });
        setIsEdit(true);
        setCurrentView('form');
    };

    // Khi bấm nút thêm
    const handleAdd = () => {
        setFormData({
            title: "",
            content: "",
            source: "",
            category: "",
            is_active: true
        });
        setIsEdit(false);
        setCurrentView('form');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setCurrentView('detail');
        setFormData({
            title: "",
            content: "",
            source: "",
            category: "",
            is_active: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // console.log("Submitting form data:", formData);
            if (isEdit) {
                // console.log(formData.id || knowledge.id);
                const updated = await updateKnowledge(formData.id || knowledge.id, formData);
                // console.log(updated)
                setKnowledge(updated.knowledge_base);
                alert("Cập nhật thành công!");
            } else {
                const created = await postKnowledge(formData);
                setKnowledge(created.knowledge_base);
                alert("Thêm mới thành công!");
            }
            setCurrentView('detail');
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        {
            id: 'knowledge',
            name: 'Nạp kiến thức',
            icon: BookOpen,
            description: 'Thêm, sửa và quản lý kiến thức cho chatbot'
        },
        {
            id: 'search',
            name: 'Tìm kiếm',
            icon: Search,
            description: 'Tìm kiếm thông tin trong kho kiến thức'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'knowledge':
                return (
                    <div>
                        {/* Detail View */}
                        {currentView === 'detail' && knowledge && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Chi tiết kiến thức</h2>
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Chỉnh sửa
                                    </button>
                                </div>
                                <KnowledgeView knowledge={knowledge} />
                            </div>
                        )}

                        {/* Form View */}
                        {currentView === 'form' && (
                            <KnowledgeForm
                                formData={formData}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                handleCancel={handleCancel}
                                loading={loading}
                                isEdit={isEdit}
                            />
                        )}

                        {/* No knowledge message */}
                        {currentView === 'detail' && !knowledge && (
                            <div className="text-center py-8">
                                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có kiến thức</h3>
                                <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm kiến thức mới cho chatbot</p>
                                <button
                                    onClick={handleAdd}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Thêm kiến thức đầu tiên
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'search':
                return (
                    <div className="max-w-4xl mx-auto">
                        <SearchComponent />
                    </div>
                );
            default:
                return null;
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 mb-6">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Dữ liệu Chatbot</h1>
                                <p className="text-gray-600 text-sm">Quản lý kho kiến thức và tìm kiếm thông tin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-8 space-y-6">
                {/* Main Content with Tabs */}
                <div className="bg-white rounded-lg border border-gray-200">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px overflow-x-auto">
                            {tabs.map((tab) => {
                                const IconComponent = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${isActive
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        <span className="hidden sm:inline">{tab.name}</span>
                                        <span className="sm:hidden">
                                            {tab.name.split(' ')[0]}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Description */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            {tabs.find(tab => tab.id === activeTab)?.description}
                        </p>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgePage;