import axiosClient from "./axios";

export const getTelegramBots = async () => {
    const res = await axiosClient.get("/telegram-pages/");
    return res;
};

export const createTelegramBot = async (data) => {
    const res = await axiosClient.post("/telegram-pages/", data);
    return res.bot;
};

export const updateTelegramBot = async (id, data) => {
    const res = await axiosClient.put(`/telegram-pages/${id}`, data);
    return res.bot;
};

export const deleteTelegramBot = async (id) => {
    const res = await axiosClient.delete(`/telegram-pages/${id}`);
    return res;
};

export const toggleTelegramBotStatus = async (id) => {
    const res = await axiosClient.patch(`/telegram-pages/${id}/toggle-status`);
    return res.bot;
};
