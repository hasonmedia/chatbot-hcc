import axiosClient from "@/config/axios";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import type {
  TelegramBotCreateRequest,
  TelegramBotUpdateRequest,
} from "@/types/telegram";

// Lấy tất cả Telegram Bots
export const getAllTelegramBotsEndpoint = async () => {
  const response = await axiosClient.get(API_ENDPOINT.TELEGRAM.GET_BOTS);
  return response.data;
};

// Tạo Telegram Bot mới
export const createTelegramBotEndpoint = async (
  data: TelegramBotCreateRequest
) => {
  const response = await axiosClient.post(
    API_ENDPOINT.TELEGRAM.CREATE_BOT,
    data
  );
  return response.data;
};

// Cập nhật Telegram Bot
export const updateTelegramBotEndpoint = async (
  bot_id: number,
  data: TelegramBotUpdateRequest
) => {
  const response = await axiosClient.put(
    API_ENDPOINT.TELEGRAM.UPDATE_BOT(bot_id),
    data
  );
  return response.data;
};

// Xóa Telegram Bot
export const deleteTelegramBotEndpoint = async (bot_id: number) => {
  const response = await axiosClient.delete(
    API_ENDPOINT.TELEGRAM.DELETE_BOT(bot_id)
  );
  return response.data;
};

// Toggle trạng thái active/inactive
export const toggleTelegramBotStatusEndpoint = async (bot_id: number) => {
  const response = await axiosClient.patch(
    API_ENDPOINT.TELEGRAM.TOGGLE_BOT_STATUS(bot_id)
  );
  return response.data;
};
