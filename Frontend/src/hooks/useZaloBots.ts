import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllZaloBotsEndpoint,
  createZaloBotEndpoint,
  updateZaloBotEndpoint,
  deleteZaloBotEndpoint,
  toggleZaloBotStatusEndpoint,
} from "@/services/zaloService";
import type {
  ZaloBot,
  ZaloBotCreateRequest,
  ZaloBotUpdateRequest,
} from "@/types/zalo";

export const useZaloBots = () => {
  const queryClient = useQueryClient();

  // Fetch tất cả bots
  const { data, isLoading: isLoadingBots } = useQuery<ZaloBot[]>({
    queryKey: ["zaloBots"],
    queryFn: getAllZaloBotsEndpoint,
  });

  // Tạo bot mới
  const createBotMutation = useMutation({
    mutationFn: (data: ZaloBotCreateRequest) => createZaloBotEndpoint(data),
    onSuccess: () => {
      toast.success("Thêm Zalo Bot thành công!");
      queryClient.invalidateQueries({ queryKey: ["zaloBots"] });
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
      data: ZaloBotUpdateRequest;
    }) => updateZaloBotEndpoint(id, data),
    onSuccess: () => {
      toast.success("Cập nhật Zalo Bot thành công!");
      queryClient.invalidateQueries({ queryKey: ["zaloBots"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi cập nhật bot.";
      toast.error(errorMessage);
    },
  });

  // Xóa bot
  const deleteBotMutation = useMutation({
    mutationFn: (bot_id: number) => deleteZaloBotEndpoint(bot_id),
    onSuccess: () => {
      toast.success("Xóa Zalo Bot thành công!");
      queryClient.invalidateQueries({ queryKey: ["zaloBots"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi xóa bot.";
      toast.error(errorMessage);
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (bot_id: number) => toggleZaloBotStatusEndpoint(bot_id),
    onSuccess: () => {
      toast.success("Thay đổi trạng thái thành công!");
      queryClient.invalidateQueries({ queryKey: ["zaloBots"] });
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
