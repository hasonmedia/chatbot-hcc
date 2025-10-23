const PageLayout = ({ 
    title, 
    subtitle, 
    icon: IconComponent, 
    tabs = [], 
    activeTab, 
    onTabChange,
    children 
}) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 mb-6">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                            <p className="text-gray-600 text-sm">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-8 space-y-6">
                {/* Main Content with Tabs */}
                <div className="bg-white rounded-lg border border-gray-200">
                    {tabs.length > 0 && (
                        <>
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200">
                                <nav className="flex -mb-px overflow-x-auto">
                                    {tabs.map((tab) => {
                                        const TabIconComponent = tab.icon;
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
                                                <TabIconComponent className="w-4 h-4" />
                                                <span className="hidden sm:inline">{tab.name}</span>
                                                <span className="sm:hidden">
                                                    {tab.name.split(' ')[2] || tab.name.split(' ')[0]}
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
                        </>
                    )}

                    {/* Tab Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageLayout;