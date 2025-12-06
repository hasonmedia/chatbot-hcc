// src/hooks/useKnowledgeBase.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllKnowledgeBaseEndpoint,
  getAllCategoriesEndpoint,
  createFilesKnowledgeBaseEndpoint,
  deleteMultipleKnowledgeBaseDetailsEndpoint,
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
      const result = data.knowledge_base;
      
      if (result.status === "success") {
        toast.success(`✅ Tải lên thành công ${result.successful_count} file!`);
      } else if (result.status === "partial_success") {
        toast.warning(
          `⚠️ Hoàn tất xử lý: ${result.successful_count}/${result.total} file thành công`
        );
        
        // Log chi tiết các file thất bại
        if (result.failed && result.failed.length > 0) {
          console.group("❌ Các file thất bại:");
          result.failed.forEach((item: any) => {
            console.error(`- ${item.filename}: ${item.error}`);
          });
          console.groupEnd();
        }
      } else if (result.status === "error") {
        toast.error(
          `❌ Tất cả ${result.failed_count} file đều bị lỗi!`
        );
        
        // Log chi tiết các file thất bại
        if (result.failed && result.failed.length > 0) {
          console.group("❌ Lỗi chi tiết:");
          result.failed.forEach((item: any) => {
            console.error(`- ${item.filename}: ${item.error}`);
          });
          console.groupEnd();
        }
      } else {
        toast.error("Đã xảy ra lỗi không xác định khi tải file.");
      }
      
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      toast.error(`Đã xảy ra lỗi khi tải file: ${error?.message || 'Lỗi không xác định'}`);
    },
  });

  const deleteMultipleMutation = useMutation({
    mutationFn: deleteMultipleKnowledgeBaseDetailsEndpoint,
    onSuccess: (data) => {
      if (data.failed_count > 0) {
        toast.warning(
          `Xóa thành công ${data.deleted_count}/${data.deleted_count + data.failed_count} file`
        );
      } else {
        toast.success(`Xóa thành công ${data.deleted_count} file!`);
      }
      queryClient.invalidateQueries({ queryKey: ["knowledgeBase"] });
    },
    onError: () => {
      toast.error("Đã xảy ra lỗi khi xóa nhiều file.");
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
    deleteMultiple: deleteMultipleMutation.mutateAsync,
    isDeletingMultiple: deleteMultipleMutation.isPending,
  };
};
