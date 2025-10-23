import axiosClient from "./axios";

// Company API services
export const getAllCompanies = async () => {
    try {
        const response = await axiosClient.get('/companies/');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getCompanyById = async (id) => {
    try {
        const response = await axiosClient.get(`/companies/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const createCompany = async (companyData) => {
    try {
        const response = await axiosClient.post('/companies/', companyData);
        return response.company;
    } catch (error) {
        throw error;
    }
};

export const updateCompany = async (id, companyData) => {
    try {
        const response = await axiosClient.put(`/companies/${id}`, companyData);
        return response.company;
    } catch (error) {
        throw error;
    }
};

export const deleteCompany = async (id) => {
    try {
        const response = await axiosClient.delete(`/companies/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const uploadLogo = async (imageData) => {
    try {
        const response = await axiosClient.post('/companies/upload-logo', {
            image: [imageData] // Array với 1 phần tử
        });
        return response;
    } catch (error) {
        throw error;
    }
};