import axios from "axios";
import { envConfig } from "./env-config";
import { refreshToken } from "../services/userService";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

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

  async function (error) {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest));
      }

      isRefreshing = true;

      try {
        await refreshToken();
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // Nếu refresh token thất bại, clear auth state
        if (typeof window !== "undefined") {
          // Import dynamically để tránh circular dependency
          import("../utils/auth").then(({ setAuthFlag, clearAuthCookies }) => {
            setAuthFlag(false);
            clearAuthCookies();
          });

          // Dispatch custom event để AuthContext có thể listen
          window.dispatchEvent(new CustomEvent("auth-failed"));
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
