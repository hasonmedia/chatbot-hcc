export default function Unauthorized() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                <h2 className="text-xl font-semibold mb-2">Không có quyền truy cập</h2>
                <p className="text-gray-600 mb-6">
                    Bạn không có quyền để truy cập trang này.
                </p>
                <a
                    href="/"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    Quay về trang chủ
                </a>
            </div>
        </div>
    );
}
