import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SetupPassword } from "../pages/SetupPassword";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("SetupPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it("shows a missing token message when the URL has no token", () => {
    render(
      <MemoryRouter initialEntries={["/setup-password"]}>
        <SetupPassword />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Token d'invitation manquant dans l'URL."),
    ).toBeInTheDocument();
  });

  it("activates the account and displays the agent token once", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { access_token: "jwt", agent_token: "ag_once" },
    });
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        id: "u-1",
        email: "owner@acme.test",
        name: "Owner",
        role: "owner",
        company_id: "c-1",
      },
    });

    render(
      <MemoryRouter initialEntries={["/setup-password?token=aegis_inv_valid"]}>
        <SetupPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "NewStrongPassword123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirmer le mot de passe"), {
      target: { value: "NewStrongPassword123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Activer mon compte" }));

    await waitFor(() => {
      expect(screen.getByText("ag_once")).toBeInTheDocument();
    });

    expect(api.post).toHaveBeenCalledWith("/auth/setup-password", {
      token: "aegis_inv_valid",
      password: "NewStrongPassword123!",
    });
    expect(api.get).toHaveBeenCalledWith("/auth/me", {
      headers: { Authorization: "Bearer jwt" },
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("shows an error when the invitation token is rejected", async () => {
    vi.mocked(api.post).mockRejectedValueOnce({ response: { status: 401 } });

    render(
      <MemoryRouter initialEntries={["/setup-password?token=bad-token"]}>
        <SetupPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "NewStrongPassword123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirmer le mot de passe"), {
      target: { value: "NewStrongPassword123!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Activer mon compte" }));

    await waitFor(() => {
      expect(
        screen.getByText("Le lien d'activation est invalide ou a expire."),
      ).toBeInTheDocument();
    });
  });
});
