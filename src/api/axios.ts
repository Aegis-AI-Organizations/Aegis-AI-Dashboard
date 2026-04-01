import axios from "axios";
import { config } from "../config";
import { useAuthStore } from "../store/authStore";

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
 * Request Interceptor for Authentication
 *
 * This interceptor pulls the current Access Token from the Zustand store
 * using 'getState()' (which works outside of React components).
 *
 * This enables Zero-Trust propagation of identity to the Gateway.
 */
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor for Error Handling
 *
 * Placeholder for future implementation of silent refresh
 * and automatic logout when 401 Unauthorized is detected.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access detected. Session may be expired.");
      // Future: Trigger silent refresh or redirect to login.
    }
    return Promise.reject(error);
  },
);
