import { Star } from "lucide-react";

const RatingPrompt = ({ onOpenRatingModal }) => {
    return (
        <div className="flex justify-center py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md shadow-sm animate-fadeIn">
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Star className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <p className="text-gray-700 font-medium">
                        Nếu bạn hài lòng với cuộc trò chuyện
                    </p>
                    <p className="text-gray-600 text-sm">
                        Xin hãy đánh giá giúp chúng tôi từ 1 đến 5 sao
                    </p>
                    <button
                        onClick={onOpenRatingModal}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Đánh giá ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatingPrompt;
