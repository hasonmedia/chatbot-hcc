const LoadingCard = ({ message = "Đang tải..." }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">{message}</p>
        </div>
    );
};

export default LoadingCard;