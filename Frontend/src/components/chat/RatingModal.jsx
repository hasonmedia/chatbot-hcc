import { useState } from "react";
import { X, Star } from "lucide-react";

const RatingModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }

        await onSubmit(rating, comment);
        
        // Reset form
        setRating(0);
        setHoveredRating(0);
        setComment("");
    };

    const handleClose = () => {
        setRating(0);
        setHoveredRating(0);
        setComment("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Đánh giá cuộc trò chuyện
                    </h3>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <p className="text-gray-600 text-center">
                        Nếu bạn hài lòng với cuộc trò chuyện, xin hãy đánh giá giúp chúng tôi
                    </p>

                    {/* Star Rating */}
                    <div className="flex justify-center gap-2 py-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                disabled={isSubmitting}
                                className="transition-transform hover:scale-110 disabled:opacity-50"
                            >
                                <Star
                                    size={36}
                                    className={`${
                                        star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                    } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Rating Text */}
                    {rating > 0 && (
                        <p className="text-center text-sm text-gray-600">
                            Bạn đã chọn: {rating} sao
                        </p>
                    )}

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhận xét của bạn (không bắt buộc)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={isSubmitting}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Để sau
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
