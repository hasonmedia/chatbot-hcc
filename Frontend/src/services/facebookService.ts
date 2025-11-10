import axiosClient from "@/config/axios";
import { API_ENDPOINT } from "@/constants/apiEndpoint";
import type {
  FacebookPageCreateRequest,
  FacebookPageUpdateRequest,
} from "@/types/facebook";

// Lấy tất cả Facebook Pages
export const getAllFacebookPagesEndpoint = async () => {
  const response = await axiosClient.get(API_ENDPOINT.FACEBOOK.GET_PAGES);
  return response.data;
};

// Tạo Facebook Page mới
export const createFacebookPageEndpoint = async (
  data: FacebookPageCreateRequest
) => {
  const response = await axiosClient.post(
    API_ENDPOINT.FACEBOOK.CREATE_PAGE,
    data
  );
  return response.data;
};

// Cập nhật Facebook Page
export const updateFacebookPageEndpoint = async (
  page_id: number,
  data: FacebookPageUpdateRequest
) => {
  const response = await axiosClient.put(
    API_ENDPOINT.FACEBOOK.UPDATE_PAGE(page_id),
    data
  );
  return response.data;
};

// Xóa Facebook Page
export const deleteFacebookPageEndpoint = async (page_id: number) => {
  const response = await axiosClient.delete(
    API_ENDPOINT.FACEBOOK.DELETE_PAGE(page_id)
  );
  return response.data;
};

// Toggle trạng thái active/inactive
export const toggleFacebookPageStatusEndpoint = async (page_id: number) => {
  const response = await axiosClient.patch(
    API_ENDPOINT.FACEBOOK.TOGGLE_PAGE_STATUS(page_id)
  );
  return response.data;
};
