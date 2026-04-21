import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Settings } from "../pages/Settings";
import { MemoryRouter } from "react-router-dom";
import { api } from "../api/Axios";

// Mock Axios API
vi.mock("../api/Axios", () => ({
  api: {
    put: vi.fn(),
  },
}));

// Mock AuthStore with selector support
const mockSetAuth = vi.fn();
let mockState = {
  user: {
    id: "1",
    name: "Enzo Gaggiotti",
    email: "enzo@aegis.ai",
    role: "admin",
  },
  accessToken: "fake-jwt",
  setAuth: mockSetAuth,
};

vi.mock("../store/AuthStore", () => ({
  useAuthStore: vi.fn((selector) =>
    selector ? selector(mockState) : mockState,
  ),
}));

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      user: {
        id: "1",
        name: "Enzo Gaggiotti",
        email: "enzo@aegis.ai",
        role: "admin",
      },
      accessToken: "fake-jwt",
      setAuth: mockSetAuth,
    };
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

  it("handles name update successfully", async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    const nameInput = screen.getByLabelText(/NOM & PRÉNOM/i);
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    fireEvent.click(screen.getByText("Mettre à jour le nom"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/users/me/profile", {
        name: "New Name",
        avatar_url: "",
      });
      expect(mockSetAuth).toHaveBeenCalledWith(
        "fake-jwt",
        expect.objectContaining({ name: "New Name", avatar_url: "" }),
      );
      expect(
        screen.getByText("Profil mis à jour avec succès."),
      ).toBeInTheDocument();
    });
  });

  it("handles email update successfully", async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/ADRESSE EMAIL/i);
    fireEvent.change(emailInput, { target: { value: "new@aegis.ai" } });

    fireEvent.click(screen.getByText("Mettre à jour l'email"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/users/me/email", {
        email: "new@aegis.ai",
      });
      expect(mockSetAuth).toHaveBeenCalledWith(
        "fake-jwt",
        expect.objectContaining({ email: "new@aegis.ai" }),
      );
      expect(
        screen.getByText("Adresse e-mail mise à jour avec succès."),
      ).toBeInTheDocument();
    });
  });

  it("handles name update failure", async () => {
    vi.mocked(api.put).mockRejectedValueOnce({
      response: { data: { error: "Update failed" } },
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Mettre à jour le nom"));

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

    // Switch to Security tab via the nav button
    const securityTab = screen.getByRole("button", { name: /sécurité/i });
    fireEvent.click(securityTab);

    // Fill all password fields
    fireEvent.change(screen.getByLabelText(/ANCIEN MOT DE PASSE/i), {
      target: { value: "OldPassword1!" },
    });
    fireEvent.change(screen.getByLabelText(/NOUVEAU MOT DE PASSE/i), {
      target: { value: "NewPass1!" },
    });
    fireEvent.change(screen.getByLabelText(/CONFIRMATION/i), {
      target: { value: "Mismatch1!" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /mettre à jour le mot de passe/i }),
    );

    expect(
      await screen.findByText("Les mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
  });

  it("generates correct initials from name", () => {
    const { unmount } = render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByText("EG")).toBeInTheDocument();

    unmount();

    mockState = {
      ...mockState,
      user: {
        id: "1",
        email: "enzo@aegis.ai",
        role: "admin",
        name: "John Doe",
      },
    };

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByText("JD")).toBeInTheDocument();
  });
});
