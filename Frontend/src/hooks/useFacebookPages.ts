import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllFacebookPagesEndpoint,
  createFacebookPageEndpoint,
  updateFacebookPageEndpoint,
  deleteFacebookPageEndpoint,
  toggleFacebookPageStatusEndpoint,
} from "@/services/facebookService";
import type {
  FacebookPage,
  FacebookPageCreateRequest,
  FacebookPageUpdateRequest,
} from "@/types/facebook";

export const useFacebookPages = () => {
  const queryClient = useQueryClient();

  // Fetch tất cả pages
  const { data, isLoading: isLoadingPages } = useQuery<FacebookPage[]>({
    queryKey: ["facebookPages"],
    queryFn: getAllFacebookPagesEndpoint,
  });

  // Tạo page mới
  const createPageMutation = useMutation({
    mutationFn: (data: FacebookPageCreateRequest) =>
      createFacebookPageEndpoint(data),
    onSuccess: () => {
      toast.success("Thêm Facebook Page thành công!");
      queryClient.invalidateQueries({ queryKey: ["facebookPages"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi thêm page.";
      toast.error(errorMessage);
    },
  });

  // Cập nhật page
  const updatePageMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: FacebookPageUpdateRequest;
    }) => updateFacebookPageEndpoint(id, data),
    onSuccess: () => {
      toast.success("Cập nhật Facebook Page thành công!");
      queryClient.invalidateQueries({ queryKey: ["facebookPages"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi cập nhật page.";
      toast.error(errorMessage);
    },
  });

  // Xóa page
  const deletePageMutation = useMutation({
    mutationFn: (page_id: number) => deleteFacebookPageEndpoint(page_id),
    onSuccess: () => {
      toast.success("Xóa Facebook Page thành công!");
      queryClient.invalidateQueries({ queryKey: ["facebookPages"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Đã xảy ra lỗi khi xóa page.";
      toast.error(errorMessage);
    },
  });

  // Toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: (page_id: number) => toggleFacebookPageStatusEndpoint(page_id),
    onSuccess: () => {
      toast.success("Thay đổi trạng thái thành công!");
      queryClient.invalidateQueries({ queryKey: ["facebookPages"] });
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
    isLoadingPages,
    createPage: createPageMutation.mutateAsync,
    isCreatingPage: createPageMutation.isPending,
    updatePage: updatePageMutation.mutateAsync,
    isUpdatingPage: updatePageMutation.isPending,
    deletePage: deletePageMutation.mutateAsync,
    isDeletingPage: deletePageMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isTogglingStatus: toggleStatusMutation.isPending,
  };
};
