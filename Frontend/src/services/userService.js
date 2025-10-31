import axiosClient from "./axios";

export const getUsers = async () => {
  try {
    const response = await axiosClient.get("/users/");
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
};

export const postUsers = async (data) => {
  try {
    const response = await axiosClient.post("/users/", data);
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
};

// Cập nhật user
export const updateUser = async (id, data) => {
  const response = await axiosClient.put(`/users/${id}`, data);
  return response;
};

export const getCustomerInfor = async () => {
  const response = await axiosClient.get(`/users/customers`);
  return response;
};
