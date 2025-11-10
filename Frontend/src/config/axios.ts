import axios from "axios";
import { envConfig } from "./env-config";

const axiosClient = axios.create({
  baseURL: envConfig.apiBaseUrl,
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosClient;
