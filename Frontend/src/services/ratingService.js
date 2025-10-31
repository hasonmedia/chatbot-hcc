import axiosClient from "./axios";


/**
 * Tạo hoặc cập nhật đánh giá cho chat session
 */
export const createRating = async (sessionId, rate, comment = "") => {
    try {
        const response = await axiosClient.post(`/rating/${sessionId}`, {
            rate,
            comment,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating rating:", error);
        throw error;
    }
};

/**
 * Lấy đánh giá của chat session
 */
export const getRating = async (sessionId) => {
    try {
        const response = await axiosClient.get(`/rating/${sessionId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting rating:", error);
        throw error;
    }
};

/**
 * Kiểm tra xem session đã được đánh giá chưa
 */
export const checkIfRated = async (sessionId) => {
    try {
        const response = await axiosClient.get(`/rating/${sessionId}/check`);
        return response.data;
    } catch (error) {
        console.error("Error checking rating:", error);
        throw error;
    }
};
