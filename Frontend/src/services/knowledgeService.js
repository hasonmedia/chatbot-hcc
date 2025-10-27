import axiosClient from './axios';

export const getKnowledgeById  = async () => {
    try {
        const response = await axiosClient.get('/knowledge-base/');
        console.log("123", response)
        return response;
    } catch (error) {
        throw error;
    }
};


export const postKnowledge  = async (data) => {
    try {
        const response = await axiosClient.post('/knowledge-base/', data);
        console.log("111", response)
        return response;
    } catch (error) {
        throw error;
    }
};


export const updateKnowledge   = async (id, data) => {
    try {
        console.log("data", data,  id)
        const response = await axiosClient.patch(`/knowledge-base/${id}`, data);
        console.log(response)
        return response;
    } catch (error) {
        throw error;
    }
};

// Upload nhiều files và tạo knowledge base
export const uploadKnowledgeFile = async (formData) => {
    try {
        const response = await axiosClient.post('/knowledge-base/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

// Update knowledge base với nhiều files
export const updateKnowledgeWithFile = async (id, formData) => {
    try {
        const response = await axiosClient.patch(`/knowledge-base/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

// Xóa một file detail
export const deleteKnowledgeDetail = async (detailId) => {
    try {
        const response = await axiosClient.delete(`/knowledge-base/detail/${detailId}`);
        return response;
    } catch (error) {
        throw error;
    }
};