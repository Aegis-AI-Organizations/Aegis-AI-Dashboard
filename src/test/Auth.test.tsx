import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import axios from "axios";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

describe("Authentication Infrastructure", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();

    // Mock window.location
    // @ts-ignore
    delete window.location;
    window.location = { ...originalLocation, href: "" } as any;

    // Spy on axios.post for the refresh call
    vi.spyOn(axios, "post");
  });

  afterEach(() => {
    // @ts-ignore
    window.location = originalLocation;
    vi.restoreAllMocks();
  });

  it("should initialize with no authentication", () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("should update state when setAuth is called", () => {
    const mockUser = {
      id: "1",
      email: "test@aegis.ai",
      company_id: "corp1",
      role: "admin",
    };
    const mockToken = "fake-jwt-token";

    useAuthStore.getState().setAuth(mockToken, mockUser);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it("should clear state when clearAuth is called", () => {
    useAuthStore.getState().setAuth("token", { id: "1" } as any);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should inject Authorization header in API requests when token exists", async () => {
    const mockToken = "secret-jwt";
    useAuthStore.getState().setAuth(mockToken, { id: "1" } as any);

    // Mock the axios request to see the config
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = await interceptor({ headers: {} });

    expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it("should NOT inject Authorization header when no token exists", async () => {
    const interceptor = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = await interceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  describe("Silent Refresh", () => {
    it("should attempt to refresh token on 401 error", async () => {
      const mockToken = "old-token";
      const newToken = "new-token";
      useAuthStore.getState().setAuth(mockToken, { id: "1" } as any);

      // Mock refresh call success
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { access_token: newToken },
      });

      // Mock the original failed request
      const failedResponse = {
        config: { url: "/test", headers: {} },
        response: { status: 401 },
      };

      const interceptor = (api.interceptors.response as any).handlers[0]
        .rejected;

      // We need to mock the 'api' instance call inside the interceptor
      const apiSpy = vi.spyOn(api, "request").mockResolvedValue({ data: "success" } as any);

      await interceptor(failedResponse);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/refresh"),
        {},
        expect.any(Object)
      );
      expect(useAuthStore.getState().accessToken).toBe(newToken);
      apiSpy.mockRestore();
    });

    it("should redirect to login when refresh fails", async () => {
      const mockToken = "old-token";
      useAuthStore.getState().setAuth(mockToken, { id: "1" } as any);

      // Mock refresh call failure
      vi.mocked(axios.post).mockRejectedValueOnce(new Error("Refresh failed"));

      const failedResponse = {
        config: { url: "/test", headers: {} },
        response: { status: 401 },
      };

      const interceptor = (api.interceptors.response as any).handlers[0]
        .rejected;

      await expect(interceptor(failedResponse)).rejects.toThrow();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(window.location.href).toBe("/login");
    });
  });

  afterEach(() => {
    // @ts-ignore
    window.location = originalLocation;
  });
});
