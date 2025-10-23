import axiosClient from "./axios";

export const getTag = async () => {
    const res = await axiosClient.get("/tags/");
    return res;
}

export const createTag = async (data) => {
    const res = await axiosClient.post("/tags/", data);
    return res;
}

export const updateTag = async (id, data) => {
    const res = await axiosClient.put(`/tags/${id}`, data);
    return res;
}

export const deleteTag = async (id) => {
    const res = await axiosClient.delete(`/tags/${id}`);
    return res;
}

export const getTagById = async (id) => {
    const res = await axiosClient.get(`/tags/${id}`);
    return res;
}

export const getTagsByChatSession = async (chat_session_id) => {
    const res = await axiosClient.get(`/tags/chat_session/${chat_session_id}`);
    return res;
}