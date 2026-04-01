import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { config } from "../config";
import { useAuthStore } from "../store/AuthStore";

/**
 * Global Axios Instance
 *
 * Configured with baseURL pointing to the Aegis AI Gateway.
 * withCredentials: true is REQUIRED for CORS to include HTTP-Only
 * cookies (refresh token) in requests.
 */
export const api = axios.create({
  baseURL: config.apiGatewayUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Buffer for Silent Refresh
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Request Interceptor for Authentication
 */
export const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

api.interceptors.request.use(requestInterceptor, (error: AxiosError) => {
  return Promise.reject(error);
});

/**
 * Response Error Interceptor for Silent Refresh
 *
 * Detects 401 Unauthorized errors and attempts to rotate the token
 * automatically via '/auth/refresh'. Queues other outgoing requests
 * during the refresh process to prevent race conditions.
 */
export const responseErrorInterceptor = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  // If error is NOT 401, or if we already retried this request once, skip.
  // Also skip if error is from auth routes itself to avoid loops.
  if (
    error.response?.status !== 401 ||
    originalRequest._retry ||
    originalRequest.url?.includes("/auth/")
  ) {
    return Promise.reject(error);
  }

  if (isRefreshing) {
    // If already refreshing, wait for the token and retry.
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api.request(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    // Call refresh endpoint (browser will send back the HTTP-only cookie)
    const { data } = await axios.post(
      `${config.apiGatewayUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    const { access_token } = data;

    // Update RAM-only store
    // Note: we assume the user object is still valid or returned.
    // For this MVP, we only update the token.
    useAuthStore.setState((state) => ({
      ...state,
      accessToken: access_token,
      isAuthenticated: true,
    }));

    processQueue(null, access_token);
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${access_token}`;

    return api.request(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);

    // Session is fully expired, clear memory and force redirect to login
    useAuthStore.getState().clearAuth();
    window.location.assign("/login");

    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};

api.interceptors.response.use((response) => response, responseErrorInterceptor);
