import axiosClient from "@/config/axios";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import type { ZaloBotCreateRequest, ZaloBotUpdateRequest } from "@/types/zalo";

// Lấy tất cả Zalo Bots
export const getAllZaloBotsEndpoint = async () => {
  const response = await axiosClient.get(API_ENDPOINT.ZALO.GET_BOTS);
  return response.data;
};

// Tạo Zalo Bot mới
export const createZaloBotEndpoint = async (data: ZaloBotCreateRequest) => {
  const response = await axiosClient.post(API_ENDPOINT.ZALO.CREATE_BOT, data);
  return response.data;
};

// Cập nhật Zalo Bot
export const updateZaloBotEndpoint = async (
  bot_id: number,
  data: ZaloBotUpdateRequest
) => {
  const response = await axiosClient.put(
    API_ENDPOINT.ZALO.UPDATE_BOT(bot_id),
    data
  );
  return response.data;
};

// Xóa Zalo Bot
export const deleteZaloBotEndpoint = async (bot_id: number) => {
  const response = await axiosClient.delete(
    API_ENDPOINT.ZALO.DELETE_BOT(bot_id)
  );
  return response.data;
};

// Toggle trạng thái active/inactive
export const toggleZaloBotStatusEndpoint = async (bot_id: number) => {
  const response = await axiosClient.patch(
    API_ENDPOINT.ZALO.TOGGLE_BOT_STATUS(bot_id)
  );
  return response.data;
};
