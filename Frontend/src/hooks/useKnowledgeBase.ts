// src/hooks/useKnowledgeBase.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllKnowledgeBaseEndpoint,
  getAllCategoriesEndpoint,
  createFilesKnowledgeBaseEndpoint,
  deleteKnowledgeBaseDetailEndpoint,
  addRichTextToKnowledgeBaseEndpoint,
  updateRichTextKnowledgeBaseEndpoint,
} from "@/services/knowledgeService";
import type {
  KnowledgeBaseResponse,
  KnowledgeCategory,
} from "@/types/knowledge";
import { useAuth } from "@/components/context/AuthContext";

export const useKnowledgeBase = (
  categoryIds?: number[],
  fileTypes?: string[]
) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading: isLoadingData } = useQuery<KnowledgeBaseResponse[]>({
    queryKey: ["knowledgeBase", categoryIds, fileTypes],
    queryFn: () => getAllKnowledgeBaseEndpoint(categoryIds, fileTypes),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    KnowledgeCategory[]
  >({
    queryKey: ["knowledgeCategories"],
    queryFn: getAllCategoriesEndpoint,
  });

  const createRichTextMutation = useMutation({
    mutationFn: ({
      kb_id,
      data,
    }: {
      kb_id: number;
      data: {
        file_name: string;
        description: string;
        raw_content: string;
        user_id: number;
        category_id: number;
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
    onSuccess: (data: any) => {
      if (data.status === "success") {
        toast.success("Tải file lên thành công!");
      } else if (data.status === "partial_success") {
        toast.warning(
          `Hoàn tất. Có ${data.successful.length} file thành công và ${data.failed.length} file thất bại.`
        );
        console.error("Các file thất bại:", data.failed);
      } else if (data.status === "error" && data.failed.length > 0) {
        toast.error(
          `Toàn bộ ${data.failed.length} file đã tải lên đều bị lỗi.`
        );
        console.error("Các file thất bại:", data.failed);
      } else {
        toast.error("Đã xảy ra lỗi khi tải file.");
      }
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
      description: string;
      file_name: string;
    };
  }

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: UpdateItemVariables) => {
      if (!user || !user.id) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
      const apiPayload = {
        raw_content: data.raw_content,
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
    categories,
    isLoadingCategories,
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
