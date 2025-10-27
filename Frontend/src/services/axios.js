import axios from "axios";
// const Url = `https://chatbotbe.a2alab.vn`;
const Url = `http://localhost:8000`;

const axiosClient = axios.create({
    baseURL: Url,
    withCredentials : true
}); 

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        return Promise.reject(error.response?.data || error);
    }
);

export default axiosClient;