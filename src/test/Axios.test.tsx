import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  api,
  requestInterceptor,
  responseErrorInterceptor,
} from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";

vi.mock("axios", async () => {
  const actual = (await vi.importActual("axios")) as any;
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        request: vi.fn(),
      })),
      post: vi.fn(),
    },
  };
});

describe("Axios Interceptors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  describe("requestInterceptor", () => {
    it("adds Authorization header if token exists", () => {
      useAuthStore.setState({ accessToken: "test-token" });
      const config = { headers: {} } as any;
      const result = requestInterceptor(config);
      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("does not add Authorization header if token is missing", () => {
      const config = { headers: {} } as any;
      const result = requestInterceptor(config);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("responseErrorInterceptor", () => {
    it("rejects if no error config is present", async () => {
      const error = { response: { status: 401 } } as any;
      await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    });

    it("rejects non-401 errors", async () => {
      const error = {
        config: { url: "/data" },
        response: { status: 500 },
      } as any;
      await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    });

    it("rejects if already retried", async () => {
      const error = {
        config: { url: "/data", _retry: true },
        response: { status: 401 },
      } as any;
      await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    });

    it("rejects for auth routes", async () => {
      const error = {
        config: { url: "/auth/login" },
        response: { status: 401 },
      } as any;
      await expect(responseErrorInterceptor(error)).rejects.toBe(error);
    });

    it("attempts refresh and retries on 401", async () => {
      const originalRequest = { url: "/data", headers: {} };
      const error = {
        config: originalRequest,
        response: { status: 401 },
      } as any;

      (axios.post as any).mockResolvedValueOnce({
        data: { access_token: "new-token" },
      });

      // Mock api.request to succeed
      (api.request as any).mockResolvedValueOnce({ data: "success" });

      const result = await responseErrorInterceptor(error);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/refresh"),
        {},
        expect.any(Object),
      );
      expect(useAuthStore.getState().accessToken).toBe("new-token");
      expect(result.data).toBe("success");
    });

    it("handles refresh failure and redirects to login", async () => {
      const originalRequest = { url: "/data", headers: {} };
      const error = {
        config: originalRequest,
        response: { status: 401 },
      } as any;

      (axios.post as any).mockRejectedValueOnce(new Error("Refresh failed"));

      // Mock window.location.assign
      const assignMock = vi.fn();
      delete (window as any).location;
      (window as any).location = { assign: assignMock };

      await expect(responseErrorInterceptor(error)).rejects.toThrow(
        "Refresh failed",
      );
      expect(assignMock).toHaveBeenCalledWith("/login");
    });
  });
});
