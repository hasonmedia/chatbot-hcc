// src/hooks/useKnowledgeBase.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllKnowledgeBaseEndpoint,
  createFilesKnowledgeBaseEndpoint,
  deleteKnowledgeBaseDetailEndpoint,
  addRichTextToKnowledgeBaseEndpoint,
  updateRichTextKnowledgeBaseEndpoint,
} from "@/services/knowledgeService";
import type { KnowledgeBaseResponse } from "@/types/knowledge";
import { useAuth } from "@/components/context/AuthContext";
export const useKnowledgeBase = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Giả sử bạn có hook useAuth để lấy thông tin user
  const { data, isLoading: isLoadingData } = useQuery<KnowledgeBaseResponse>({
    queryKey: ["knowledgeBase"],
    queryFn: getAllKnowledgeBaseEndpoint,
  });

  const createRichTextMutation = useMutation({
    mutationFn: ({
      kb_id,
      data,
    }: {
      kb_id: number;
      data: {
        file_name: string;
        raw_content: string;
        customer_id: number;
        user_id: number;
      };
    }) => addRichTextToKnowledgeBaseEndpoint(kb_id, data),
    onSuccess: () => {
      toast.success("Tạo dữ liệu văn bản thành công!");
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi khi tạo dữ liệu.");
    },
  });

  const createFilesMutation = useMutation({
    mutationFn: createFilesKnowledgeBaseEndpoint,
    onSuccess: () => {
      toast.success("Tải file lên thành công!");
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi khi tải file.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKnowledgeBaseDetailEndpoint,
    onSuccess: () => {
      toast.success("Xóa dữ liệu thành công!");
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi khi xóa.");
    },
  });
  interface UpdateItemVariables {
    id: number;
    data: {
      raw_content: string;
      file_name: string;
    };
  }

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: UpdateItemVariables) => {
      if (!user || !user.company_id || !user.id) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
      const apiPayload = {
        raw_content: data.raw_content,
        customer_id: user.company_id,
        user_id: user.id,
        file_name: data.file_name,
      };

      return updateRichTextKnowledgeBaseEndpoint(id, apiPayload);
    },
    onSuccess: () => {
      toast.success("Cập nhật thành công!");
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
    },
    onError: (error) => {
      toast.error(`Lỗi khi cập nhật: ${error.message}`);
      console.error("Lỗi updateItem:", error);
    },
  });
  return {
    data,
    updateItem: updateItemMutation.mutateAsync,
    isUpdating: updateItemMutation.isPending,
    isLoadingData,
    createRichText: createRichTextMutation.mutateAsync,
    isCreatingRichText: createRichTextMutation.isPending,
    createFiles: createFilesMutation.mutateAsync,
    isCreatingFiles: createFilesMutation.isPending,
    deleteItem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
