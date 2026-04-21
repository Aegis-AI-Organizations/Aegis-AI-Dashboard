import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import axios from "axios";
import { useAuthStore } from "../store/AuthStore";
import {
  api,
  requestInterceptor,
  responseErrorInterceptor,
} from "../api/Axios";

describe("Authentication Infrastructure", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    vi.clearAllMocks();

    // Properly mock window.location using Vitest global stubbing
    vi.stubGlobal("location", {
      ...window.location,
      assign: vi.fn(),
    });

    // Spy on axios.post for the refresh call
    vi.spyOn(axios, "post");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
      name: "Test User",
      company_id: "corp1",
      role: "admin",
    };
    const mockToken = "fake-jwt-token";

    useAuthStore.getState().setAuth(mockToken, mockUser as any);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it("should clear state when clearAuth is called", () => {
    useAuthStore.getState().setAuth("token", { id: "1", name: "Test" } as any);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should inject Authorization header in API requests when token exists", async () => {
    const mockToken = "secret-jwt";
    useAuthStore
      .getState()
      .setAuth(mockToken, { id: "1", name: "Test" } as any);

    // Test the request interceptor directly via the exported function
    const config = await requestInterceptor({ headers: {} } as any);

    expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`);
  });

  it("should NOT inject Authorization header when no token exists", async () => {
    // Test the request interceptor directly via the exported function
    const config = await requestInterceptor({ headers: {} } as any);

    expect(config.headers.Authorization).toBeUndefined();
  });

  describe("Silent Refresh", () => {
    it("should attempt to refresh token on 401 error", async () => {
      const mockToken = "old-token";
      const newToken = "new-token";
      useAuthStore
        .getState()
        .setAuth(mockToken, { id: "1", name: "Test" } as any);

      // Mock refresh call success
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { access_token: newToken },
      });

      // Mock the original failed request
      const failedResponse = {
        config: { url: "/test", headers: {} },
        response: { status: 401 },
      } as any;

      // We need to mock the 'api' instance call inside the interceptor
      const apiSpy = vi
        .spyOn(api, "request")
        .mockResolvedValue({ data: "success" } as any);

      // Call the exported interceptor handler directly
      await responseErrorInterceptor(failedResponse);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/refresh"),
        {},
        expect.any(Object),
      );
      expect(useAuthStore.getState().accessToken).toBe(newToken);
      apiSpy.mockRestore();
    });

    it("should redirect to login when refresh fails", async () => {
      const mockToken = "old-token";
      useAuthStore
        .getState()
        .setAuth(mockToken, { id: "1", name: "Test" } as any);

      // Mock refresh call failure
      vi.mocked(axios.post).mockRejectedValueOnce(new Error("Refresh failed"));

      const failedResponse = {
        config: { url: "/test", headers: {} },
        response: { status: 401 },
      } as any;

      // Call the exported interceptor handler directly
      await expect(responseErrorInterceptor(failedResponse)).rejects.toThrow();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(window.location.assign).toHaveBeenCalledWith("/login");
    });
  });
});
