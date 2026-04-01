import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Login } from "../pages/Login";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

// Mock api directly using spyOn instead of module mock to avoid hoisting issues
vi.mock("../api/Axios", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it("should render login form", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Se Connecter" }),
    ).toBeInTheDocument();
  });

  it("should handle successful login and redirect", async () => {
    const mockUser = { id: "1", email: "test@aegis.ai" };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { access_token: "jwt", user: mockUser },
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/login", state: { from: { pathname: "/users" } } },
        ]}
      >
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@aegis.ai" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "password" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Se Connecter" }));
    });

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@aegis.ai",
      password: "password",
    });
  });

  it("should display error message on 401", async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { status: 401 },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@aegis.ai" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "password" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Se Connecter" }));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Identifiants incorrects. Veuillez réessayer."),
      ).toBeInTheDocument();
    });
  });

  it("should display generic error on other failures", async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "test@aegis.ai" },
    });
    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: "password" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Se Connecter" }));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Une erreur est survenue lors de la connexion."),
      ).toBeInTheDocument();
    });
  });

  it("should handle mailing link click", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    const link = screen.getByText("SUPPORT: HELP@AEGIS-AI.COM");
    expect(link).toHaveAttribute("href", "mailto:help@aegis-ai.com");
  });
});
