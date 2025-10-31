import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle, AlertCircle, Bot, Key, MessageCircle, Building } from "lucide-react";
import ConfigAINew from './ConfigAINew';
import ModelSelector from './ModelSelector';
import ChatChanel from './ChatChanel';
import CompanyInfo from './CompanyInfo';
import { update_llm, get_llm_by_id, get_all_llms } from '../../services/llmService';

const LLMNew = () => {
    const [systemPrompt, setSystemPrompt] = useState("");
    const [greetingMessage, setGreetingMessage] = useState("Xin chào");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState();
    const [botName, setBotName] = useState('');
    const [activeTab, setActiveTab] = useState('model'); // Tab state
    const [llmDetails, setLlmDetails] = useState([]);
    const [botModelId, setBotModelId] = useState(null);
    const [embeddingModelId, setEmbeddingModelId] = useState(null);

    useEffect(() => {
        const fetchLLMData = async () => {
            try {
                const res = await get_llm_by_id(1);
                console.log("LLM Data:", res);
                
                setBotName(res.botName);
                setGreetingMessage(res.system_greeting);
                setSystemPrompt(res.prompt);
                setBotModelId(res.bot_model_detail_id);
                setEmbeddingModelId(res.embedding_model_detail_id);
                
                // Load llm_details
                if (res.llm_details && res.llm_details.length > 0) {
                    setLlmDetails(res.llm_details);
                }
            } catch (err) {
                console.error("Failed to fetch LLM:", err);
            }
        };

        fetchLLMData();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setMessage("");
        
        const dataToSave = {
            prompt: systemPrompt,
            system_greeting: greetingMessage,
            botName: botName,
            bot_model_detail_id: botModelId,
            embedding_model_detail_id: embeddingModelId
        };

        console.log("Saving configuration:", dataToSave);
        
        try {
            await update_llm(1, dataToSave);
            setMessage("Cập nhật cấu hình thành công ✅");
        } catch (err) {
            console.error(err);
            setMessage("Có lỗi khi lưu cấu hình ❌");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        {
            id: 'model',
            name: 'Chọn Model',
            icon: Bot,
            description: 'Chọn model AI cho Bot và Embedding'
        },
        {
            id: 'keys',
            name: 'Quản lý API Keys',
            icon: Key,
            description: 'Quản lý API keys cho từng model'
        },
        {
            id: 'prompt',
            name: 'Cấu hình Prompt',
            icon: Key,
            description: 'Thiết lập Customer Prompt cho AI'
        },
        {
            id: 'chatbot',
            name: 'Thông tin ChatbotAI',
            icon: MessageCircle,
            description: 'Cấu hình tên bot và lời chào'
        },
        {
            id: 'company',
            name: 'Thông tin Công ty',
            icon: Building,
            description: 'Quản lý thông tin công ty và thông tin liên hệ'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'model':
                return (
                    <ModelSelector
                        llmDetails={llmDetails}
                        botModelId={botModelId}
                        embeddingModelId={embeddingModelId}
                        onBotModelChange={setBotModelId}
                        onEmbeddingModelChange={setEmbeddingModelId}
                    />
                );
            case 'keys':
                return (
                    <ConfigAINew
                        llmDetails={llmDetails}
                    />
                );
            case 'prompt':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Key className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Customer Prompt</h2>
                                <p className="text-gray-600 text-sm">Thiết lập hướng dẫn hành vi cho AI</p>
                            </div>
                        </div>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            rows={12}
                            placeholder="Nhập Customer Prompt cho AI..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Customer Prompt sẽ định hướng cách AI phản hồi và hành xử
                            </p>
                            <span className="text-sm text-gray-500">
                                {systemPrompt?.length || 0} ký tự
                            </span>
                        </div>
                    </div>
                );
            case 'chatbot':
                return (
                    <ChatChanel
                        greetingMessage={greetingMessage}
                        setGreetingMessage={setGreetingMessage}
                        botName={botName}
                        setBotName={setBotName}
                    />
                );
            case 'company':
                return (
                    <CompanyInfo companyId={1} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 mb-6">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Cấu hình LLM</h1>
                                <p className="text-gray-600 text-sm">Thiết lập AI và cấu hình chatbot</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                activeTab === 'company' || activeTab === 'keys' ? 'hidden' : ''
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Lưu cấu hình
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-8 space-y-6">
                {/* Hiển thị thông báo */}
                {message && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                        message.includes("thành công")
                            ? "bg-green-50 text-green-800 border-green-200"
                            : "bg-red-50 text-red-800 border-red-200"
                    }`}>
                        {message.includes("thành công") ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">{message}</span>
                    </div>
                )}

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
                                        className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                            isActive
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

export default LLMNew;
