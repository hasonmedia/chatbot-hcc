const TabNavigation = ({ tabs, activeTab, onTabChange, className = "" }) => {
    return (
        <div className={`border-b border-gray-200 ${className}`}>
            <nav className="flex -mb-px overflow-x-auto">
                {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                isActive
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <IconComponent className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.name}</span>
                            <span className="sm:hidden">
                                {tab.name.split(' ')[2] || tab.name.split(' ')[0]}
                            </span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default TabNavigation;