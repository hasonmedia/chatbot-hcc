import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    getAllCategoriesEndpoint,
    createCategoryEndpoint,
    updateCategoryEndpoint,
    deleteCategoryEndpoint,
} from "@/services/knowledgeService";
import type { KnowledgeCategory, CategoryFormData } from "@/types/knowledge";

export const useCategory = () => {
    const queryClient = useQueryClient();

    // Query lấy tất cả categories
    const {
        data: categories = [],
        isLoading,
        error,
        refetch,
    } = useQuery<KnowledgeCategory[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const response = await getAllCategoriesEndpoint();
            // Backend trả về mảng trực tiếp, không phải object có property categories
            return Array.isArray(response) ? response : [];
        },
    });

    // Mutation tạo category mới
    const createCategory = useMutation({
        mutationFn: (data: CategoryFormData) => createCategoryEndpoint(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Tạo danh mục thành công");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || "Tạo danh mục thất bại");
        },
    });

    // Mutation cập nhật category
    const updateCategory = useMutation({
        mutationFn: ({
            category_id,
            data,
        }: {
            category_id: number;
            data: CategoryFormData;
        }) => updateCategoryEndpoint(category_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Cập nhật danh mục thành công");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || "Cập nhật danh mục thất bại");
        },
    });

    // Mutation xóa category
    const deleteCategory = useMutation({
        mutationFn: (category_id: number) => deleteCategoryEndpoint(category_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Xóa danh mục thành công");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || "Xóa danh mục thất bại");
        },
    });

    return {
        categories,
        isLoading,
        error,
        refetch,
        createCategory,
        updateCategory,
        deleteCategory,
    };
};
