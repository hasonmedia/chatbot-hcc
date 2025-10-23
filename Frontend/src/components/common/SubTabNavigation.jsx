const SubTabNavigation = ({ tabs, activeTab, onTabChange, actionButton = null }) => {
    return (
        <div className="border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <nav className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                    isActive
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${
                                    isActive ? tab.color : 'bg-gray-400'
                                }`}>
                                    <IconComponent className="w-3 h-3 text-white" />
                                </div>
                                {tab.name}
                            </button>
                        );
                    })}
                </nav>
                {actionButton}
            </div>
        </div>
    );
};

export default SubTabNavigation;