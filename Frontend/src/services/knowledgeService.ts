import axiosClient from "@/config/axios";
import { API_ENDPOINT } from "@/constants/apiEndpoint";

export const getAllKnowledgeBaseEndpoint = async (categoryIds?: number[]) => {
    
    const params: Record<string, any> = {};
    
    if (categoryIds && categoryIds.length > 0) {
        params.category_ids = categoryIds;
    }
    
    const response = await axiosClient.get(API_ENDPOINT.KNOWLEDGE_BASE.GET_ALL, {
        params,
        paramsSerializer: {
            indexes: null,
        }
    });
    
    return response.data;
};

export const getAllCategoriesEndpoint = async () => {
    const response = await axiosClient.get(API_ENDPOINT.KNOWLEDGE_BASE.GET_CATEGORIES);
    return response.data;
};

export const searchKnowledgeBaseEndpoint = async (query: string) => {
    const response = await axiosClient.get(API_ENDPOINT.KNOWLEDGE_BASE.SEARCH, {
        params: { q: query },
    });
    return response.data;
};

export const createFilesKnowledgeBaseEndpoint = async (formData: FormData) => {
    const response = await axiosClient.post(
        API_ENDPOINT.KNOWLEDGE_BASE.CREATE_FILES,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};

export const updateRichTextKnowledgeBaseEndpoint = async (
    detail_id: number,
    data: {
        file_name: string;
        raw_content: string;
        user_id: number;
    }
) => {
    const response = await axiosClient.put(
        API_ENDPOINT.KNOWLEDGE_BASE.UPDATE_RICH_TEXT(detail_id),
        data
    );
    return response.data;
};
export const deleteKnowledgeBaseDetailEndpoint = async (detail_id: number) => {
    const response = await axiosClient.delete(
        API_ENDPOINT.KNOWLEDGE_BASE.DELETE_DETAIL(detail_id)
    );
    return response.data;
};
export const addRichTextToKnowledgeBaseEndpoint = async (
    kb_id: number,
    data: {
        file_name: string;
        raw_content: string;
        user_id: number;
        category_id: number;
    }
) => {
    const response = await axiosClient.post(
        API_ENDPOINT.KNOWLEDGE_BASE.ADD_RICH_TEXT(kb_id),
        data
    );
    return response.data;
};

// Category endpoints
export const createCategoryEndpoint = async (data: {
    name: string;
    description?: string;
}) => {
    const response = await axiosClient.post(
        API_ENDPOINT.KNOWLEDGE_BASE.CREATE_CATEGORY,
        data
    );
    return response.data;
};

export const updateCategoryEndpoint = async (
    category_id: number,
    data: {
        name: string;
        description?: string;
    }
) => {
    const response = await axiosClient.put(
        API_ENDPOINT.KNOWLEDGE_BASE.UPDATE_CATEGORY(category_id),
        data
    );
    return response.data;
};

export const deleteCategoryEndpoint = async (category_id: number) => {
    const response = await axiosClient.delete(
        API_ENDPOINT.KNOWLEDGE_BASE.DELETE_CATEGORY(category_id)
    );
    return response.data;
};
