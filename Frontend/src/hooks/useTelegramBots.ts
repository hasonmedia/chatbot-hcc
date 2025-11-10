import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllTelegramBotsEndpoint,
  createTelegramBotEndpoint,
  updateTelegramBotEndpoint,
  deleteTelegramBotEndpoint,
  toggleTelegramBotStatusEndpoint,
} from "@/services/telegramService";
import type {
  TelegramBot,
  TelegramBotCreateRequest,
  TelegramBotUpdateRequest,
} from "@/types/telegram";

export const useTelegramBots = () => {
  const queryClient = useQueryClient();

  // Fetch tất cả bots
  const { data, isLoading: isLoadingBots } = useQuery<TelegramBot[]>({
    queryKey: ["telegramBots"],
    queryFn: getAllTelegramBotsEndpoint,
  });

  // Tạo bot mới
  const createBotMutation = useMutation({
    mutationFn: (data: TelegramBotCreateRequest) =>
      createTelegramBotEndpoint(data),
    onSuccess: () => {
      toast.success("Thêm Telegram Bot thành công!");
      queryClient.invalidateQueries({ queryKey: ["telegramBots"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi thêm bot.";
      toast.error(errorMessage);
    },
  });

  // Cập nhật bot
  const updateBotMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: TelegramBotUpdateRequest;
    }) => updateTelegramBotEndpoint(id, data),
    onSuccess: () => {
      toast.success("Cập nhật Telegram Bot thành công!");
      queryClient.invalidateQueries({ queryKey: ["telegramBots"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi cập nhật bot.";
      toast.error(errorMessage);
    },
  });

  // Xóa bot
  const deleteBotMutation = useMutation({
    mutationFn: (bot_id: number) => deleteTelegramBotEndpoint(bot_id),
    onSuccess: () => {
      toast.success("Xóa Telegram Bot thành công!");
      queryClient.invalidateQueries({ queryKey: ["telegramBots"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi xóa bot.";
      toast.error(errorMessage);
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (bot_id: number) => toggleTelegramBotStatusEndpoint(bot_id),
    onSuccess: () => {
      toast.success("Thay đổi trạng thái thành công!");
      queryClient.invalidateQueries({ queryKey: ["telegramBots"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail ||
        "Đã xảy ra lỗi khi thay đổi trạng thái.";
      toast.error(errorMessage);
    },
  });

  return {
    data,
    isLoadingBots,
    createBot: createBotMutation.mutateAsync,
    isCreatingBot: createBotMutation.isPending,
    updateBot: updateBotMutation.mutateAsync,
    isUpdatingBot: updateBotMutation.isPending,
    deleteBot: deleteBotMutation.mutateAsync,
    isDeletingBot: deleteBotMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isTogglingStatus: toggleStatusMutation.isPending,
  };
};
