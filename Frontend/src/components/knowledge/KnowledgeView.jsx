export const KnowledgeView = ({ knowledge }) => {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{knowledge.title}</h1>

                <div className="flex gap-4 mb-4 text-sm text-gray-600">
                    {knowledge.category && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {knowledge.category}
                        </span>
                    )}
                    <span className={`px-2 py-1 rounded ${knowledge.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'}`}>
                        {knowledge.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                </div>

                <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Nội dung:</h3>
                    <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                        <p className="text-gray-800 whitespace-pre-wrap">{knowledge.content}</p>
                    </div>
                </div>

                {knowledge.source && (
                    <div className="mb-4">
                        <h3 className="font-medium text-gray-900 mb-2">Nguồn:</h3>

                        <div className="flex items-center justify-between gap-4">
                            <p className="text-gray-600">{knowledge.source}</p>

                            <button
                                onClick={() =>
                                    window.open(
                                        `https://docs.google.com/spreadsheets/d/${knowledge.source}/edit?gid=1767407324#gid=1767407324`,
                                        "_blank"
                                    )
                                }
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                            >
                                Mở Sheet
                            </button>
                        </div>
                    </div>

                )}

                <div className="text-sm text-gray-500">
                    Tạo lúc: {knowledge.created_at ? new Date(knowledge.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
            </div>
        </div>
    );
};