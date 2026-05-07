import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthHydrator } from "../components/auth/AuthHydrator";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";

vi.mock("../api/Axios", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("AuthHydrator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isHydrating: true,
      isAuthenticated: false,
      user: null,
    });
  });

  it("attempts to hydrate on mount and shows loading", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { access_token: "tok", user: { name: "John" } },
    });

    render(<AuthHydrator>Content</AuthHydrator>);

    expect(screen.getByText(/Initialisation du Système/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/refresh");
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  it("handles hydration failure gracefully", async () => {
    vi.mocked(api.post).mockRejectedValue(new Error("Unauthorized"));

    render(<AuthHydrator>Content</AuthHydrator>);

    await waitFor(() => {
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(useAuthStore.getState().isHydrating).toBe(false);
    });
  });
});
