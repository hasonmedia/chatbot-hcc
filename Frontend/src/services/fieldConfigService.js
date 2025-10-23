import axiosClient from "./axios";

export const getFieldConfig  = async () => {
    try {
        const response = await axiosClient.get('/field-configs/');
        return response;
    } catch (error) {
        throw error;
    }
};

export const createFieldConfig = async (data) => {
    try {
        const response = await axiosClient.post('/field-configs/', data);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateFieldConfig   = async (id, data) => {
    try {
        console.log(data)
        const response = await axiosClient.put(`/field-configs/${id}`, data);
        console.log(response)
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteFieldConfig = async (id) => {
    try {
        const response = await axiosClient.delete(`/field-configs/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const syncFieldConfigsToSheet = async () => {
    try {
        const response = await axiosClient.post('/field-configs/sync-to-sheet');
        return response;
    } catch (error) {
        throw error;
    }
};