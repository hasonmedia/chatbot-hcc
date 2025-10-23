import axios from "axios";
// const Url = `https://chatbotbe.a2alab.vn`;
const Url = `http://192.168.1.45:8000`;

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