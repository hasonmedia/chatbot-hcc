import axiosClient from "./axios";

export const getFacebookPages = async () => {
    const res = await axiosClient.get("/facebook-pages/");
    return res;
};

export const createFacebookPage = async (data) => {
    const res = await axiosClient.post("/facebook-pages/", data);
    return res.page;
};

export const updateFacebookPage = async (id, data) => {
    const res = await axiosClient.put(`/facebook-pages/${id}`, data);
    return res.page;
};

export const deleteFacebookPage = async (id) => {
    const res = await axiosClient.delete(`/facebook-pages/${id}`);
    return res;
};

export const toggleFacebookPageStatus = async (id) => {
    const res = await axiosClient.patch(`/facebook-pages/${id}/toggle-status`);
    return res.page;
};


// export const connnectFacebookPage = async (id) => {
//     const res = await axiosClient.get(`/facebook-pages/callback`);
//     return res;
// };
