import axiosClient from './axios';


export const searchResults = async (query) => {
    try {
        const response = axiosClient.get(`/knowledge-base/search?query=${query}`)
        return response;
    }catch (error) {
        throw error;
    }
}
