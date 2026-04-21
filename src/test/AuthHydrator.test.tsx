import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthHydrator } from "../components/auth/AuthHydrator";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("AuthHydrator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setHydrating(true);
  });

  it("should attempt to hydrate session on mount", async () => {
    const mockUser = {
      id: "1",
      email: "test@aegis.ai",
      name: "Test User",
      role: "admin",
    };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { access_token: "fake-jwt", user: mockUser },
    });

    render(
      <AuthHydrator>
        <div data-testid="child">child</div>
      </AuthHydrator>,
    );

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isHydrating).toBe(false);
    });

    expect(api.post).toHaveBeenCalledWith("/auth/refresh");
  });

  it("should stop hydrating even if refresh fails", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error("No session"));

    render(
      <AuthHydrator>
        <div data-testid="child">child</div>
      </AuthHydrator>,
    );

    await waitFor(() => {
      expect(useAuthStore.getState().isHydrating).toBe(false);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
