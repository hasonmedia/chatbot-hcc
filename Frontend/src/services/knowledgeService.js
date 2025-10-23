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