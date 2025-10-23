import axiosClient from "./axios";

export const getZaloBots = async () => {
    const res = await axiosClient.get("/zalo/");
    return res;
};

export const createZaloBot = async (data) => {
    const res = await axiosClient.post("/zalo/", data);
    return res.bot;
};

export const updateZaloBot = async (id, data) => {
    const res = await axiosClient.put(`/zalo/${id}`, data);
    return res.bot;
};

export const deleteZaloBot = async (id) => {
    const res = await axiosClient.delete(`/zalo/${id}`);
    return res;
};

export const toggleZaloBotStatus = async (id) => {
    const res = await axiosClient.patch(`/zalo/${id}/toggle-status`);
    return res.bot;
};
