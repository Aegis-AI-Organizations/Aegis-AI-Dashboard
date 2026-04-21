import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Settings } from "../pages/Settings";
import { MemoryRouter } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

// Mock Axios API
vi.mock("../api/Axios", () => ({
  api: {
    put: vi.fn(),
  },
}));

// Mock AuthStore
vi.mock("../store/AuthStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("Settings Page", () => {
  const mockUser = {
    id: "1",
    name: "Enzo Gaggiotti",
    email: "enzo@aegis.ai",
    role: "admin",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      accessToken: "fake-jwt",
      setAuth: vi.fn(),
    });
  });

  it("renders the profile tab by default", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByText("Paramètres")).toBeInTheDocument();
    expect(screen.getByText("Enzo Gaggiotti")).toBeInTheDocument();
    expect(screen.getByLabelText(/NOM & PRÉNOM/i)).toHaveValue(
      "Enzo Gaggiotti",
    );
  });

  it("switches tabs correctly", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    // Switch to Security
    fireEvent.click(screen.getByText("Sécurité"));
    expect(screen.getByText("Sécurité du Compte")).toBeInTheDocument();

    // Switch to Notifications
    fireEvent.click(screen.getByText("Notifications"));
    expect(screen.getByText("Centre de Notifications")).toBeInTheDocument();

    // Switch to Billing
    fireEvent.click(screen.getByText("Facturation"));
    expect(screen.getByText("Plan & Facturation")).toBeInTheDocument();
  });

  it("handles profile update successfully", async () => {
    const setAuthMock = vi.fn();
    (useAuthStore as any).mockReturnValue({
      user: mockUser,
      accessToken: "fake-jwt",
      setAuth: setAuthMock,
    });

    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    const nameInput = screen.getByLabelText(/NOM & PRÉNOM/i);
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    fireEvent.click(screen.getByText("Enregistrer les modifications"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/users/me/profile", {
        name: "New Name",
      });
      expect(
        screen.getByText("Profil mis à jour avec succès."),
      ).toBeInTheDocument();
    });
  });

  it("handles profile update failure", async () => {
    vi.mocked(api.put).mockRejectedValueOnce({
      response: { data: { error: "Update failed" } },
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Enregistrer les modifications"));

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument();
    });
  });

  it("updates password validation markers as user types", () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Sécurité"));

    const newPasswordInput = screen.getByLabelText("NOUVEAU MOT DE PASSE");

    // Initially requirements are not met
    expect(screen.getByText("8+ caractères")).toHaveClass("text-gray-600");

    // Type a compliant password
    fireEvent.change(newPasswordInput, { target: { value: "Complex1!" } });

    expect(screen.getByText("8+ caractères")).toHaveClass("text-emerald-400");
    expect(screen.getByText("Majuscule")).toHaveClass("text-emerald-400");
    expect(screen.getByText("Un chiffre")).toHaveClass("text-emerald-400");
    expect(screen.getByText("Signe spécial")).toHaveClass("text-emerald-400");
  });

  it("handles password update successfully", async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Sécurité"));

    fireEvent.change(screen.getByLabelText("ANCIEN MOT DE PASSE"), {
      target: { value: "OldPass1!" },
    });
    fireEvent.change(screen.getByLabelText("NOUVEAU MOT DE PASSE"), {
      target: { value: "NewPass1!" },
    });
    fireEvent.change(screen.getByLabelText("CONFIRMATION"), {
      target: { value: "NewPass1!" },
    });

    fireEvent.click(screen.getByText("Mettre à jour le mot de passe"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/users/me/password", {
        old_password: "OldPass1!",
        new_password: "NewPass1!",
      });
      expect(
        screen.getByText("Mot de passe modifié avec succès."),
      ).toBeInTheDocument();
    });
  });

  it("shows error when passwords do not match", async () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Sécurité"));

    fireEvent.change(screen.getByLabelText("NOUVEAU MOT DE PASSE"), {
      target: { value: "NewPass1!" },
    });
    fireEvent.change(screen.getByLabelText("CONFIRMATION"), {
      target: { value: "Mismatch1!" },
    });

    fireEvent.click(screen.getByText("Mettre à jour le mot de passe"));

    expect(
      screen.getByText("Les mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
  });

  it("generates correct initials from name", () => {
    const { rerender } = render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByText("EG")).toBeInTheDocument();

    (useAuthStore as any).mockReturnValue({
      user: { ...mockUser, name: "John Doe" },
      accessToken: "fake-jwt",
      setAuth: vi.fn(),
    });

    rerender(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
