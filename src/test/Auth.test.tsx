import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/axios";

describe("Authentication Infrastructure", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
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
});
