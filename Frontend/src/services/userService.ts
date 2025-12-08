import axiosClient from "@/config/axios";
import { API_ENDPOINT } from "../constants/apiEndpoint";
import type { User, UserCreateRequest, UserResponse } from "@/types/user";

export const getMe = async (): Promise<UserCreateRequest> => {
  const response = await axiosClient.get<UserCreateRequest>(
    API_ENDPOINT.USER.GET_ME,
    {
      withCredentials: true,
    }
  );

  return response.data;
};
export const login = async (
  username: string,
  password: string
): Promise<User> => {
  const response = await axiosClient.post<User>(
    API_ENDPOINT.USER.LOGIN,
    {
      username,
      password,
    },
    {
      withCredentials: true, // Đảm bảo nhận cookies từ backend
    }
  );
  return response.data;
};
export const getAllUsers = async (): Promise<UserResponse[]> => {
  const response = await axiosClient.get<UserResponse[]>(
    API_ENDPOINT.USER.GET_ALL
  );
  return response.data;
};
export const registerUser = async (userData: Partial<User>): Promise<User> => {
  const response = await axiosClient.post<User>(
    API_ENDPOINT.USER.REGISTER,
    userData
  );
  return response.data;
};
export const logout = async (): Promise<void> => {
  await axiosClient.post<void>(
    API_ENDPOINT.USER.LOGOUT,
    {},
    {
      withCredentials: true, // Đảm bảo gửi cookies để backend có thể xóa chúng
    }
  );
};
export const updateUser = async (
  id: number,
  userData: Partial<User>
): Promise<User> => {
  const response = await axiosClient.put<User>(
    API_ENDPOINT.USER.UPDATE(id),
    userData
  );
  return response.data;
};
export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await axiosClient.delete<{ message: string }>(
    API_ENDPOINT.USER.DELETE(id)
  );
  return response.data;
};
export const getCustomers = async (): Promise<User[]> => {
  const response = await axiosClient.get<User[]>(
    API_ENDPOINT.USER.GET_CUSTOMER
  );
  return response.data;
};
export const refreshToken = async (): Promise<string> => {
  const response = await axiosClient.post<{ access_token: string }>(
    API_ENDPOINT.USER.REFRESH_TOKEN,
    {},
    {
      withCredentials: true, // Đảm bảo gửi cookies cho refresh token
    }
  );
  // Backend sẽ tự động set cookies mới với token rotation
  return response.data.access_token;
};
