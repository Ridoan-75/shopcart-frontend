import axios from "axios";
import { CONFIG } from "../constants/config";

const axiosInstance = axios.create({
  baseURL: CONFIG.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor — token attach
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — 401 handle
let isRefreshing = false;
let failedQueue: {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axiosInstance.post("/auth/refresh-token");
        const newToken = response.data?.data?.accessToken;

        if (newToken) {
          // Zustand store update
          if (typeof window !== "undefined") {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
              const parsed = JSON.parse(authStorage);
              parsed.state.accessToken = newToken;
              localStorage.setItem("auth-storage", JSON.stringify(parsed));
            }
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;