import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
  const renderWithRouter = (initialPath = "/") =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthHydrator>Content</AuthHydrator>
      </MemoryRouter>,
    );

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

    renderWithRouter();

    expect(screen.getByText(/Initialisation du Système/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/refresh");
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  it("handles hydration failure gracefully", async () => {
    vi.mocked(api.post).mockRejectedValue(new Error("Unauthorized"));

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(useAuthStore.getState().isHydrating).toBe(false);
    });
  });

  it("skips hydration on public routes", async () => {
    renderWithRouter("/login");

    await waitFor(() => {
      expect(screen.getByText("Content")).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
      expect(useAuthStore.getState().isHydrating).toBe(false);
    });
  });
});
