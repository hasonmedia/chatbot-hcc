// @/services/ratingService.ts

import axiosClient from "@/config/axios";
import type {
  CreateRatingRequest,
  CreateRatingResponse,
  GetRatingResponse,
  CheckRatingResponse,
} from "@/types/feedback";

/**
 * Tạo hoặc cập nhật đánh giá cho chat session
 */
export const createRating = async (
  sessionId: string,
  data: CreateRatingRequest
): Promise<CreateRatingResponse> => {
  try {
    const response = await axiosClient.post<CreateRatingResponse>(
      `/rating/${sessionId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đánh giá:", error);
    throw error;
  }
};

/**
 * Lấy đánh giá của chat session
 */
export const getRating = async (
  sessionId: string
): Promise<GetRatingResponse> => {
  try {
    const response = await axiosClient.get<GetRatingResponse>(
      `/rating/${sessionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    throw error;
  }
};

/**
 * Kiểm tra xem session đã được đánh giá chưa
 */
export const checkRating = async (
  sessionId: string
): Promise<CheckRatingResponse> => {
  try {
    const response = await axiosClient.get<CheckRatingResponse>(
      `/rating/${sessionId}/check`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi kiểm tra đánh giá:", error);
    throw error;
  }
};
