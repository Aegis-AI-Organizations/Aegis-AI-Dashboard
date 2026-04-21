import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Settings } from "../pages/Settings";
import { MemoryRouter } from "react-router-dom";
import { api } from "../api/Axios";

// Mock Axios API
vi.mock("../api/Axios", () => ({
  api: {
    put: vi.fn(),
    get: vi.fn(),
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
    expect(screen.getByLabelText(/Nouveau nom/i)).toHaveValue("");
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
    expect(screen.getByText("Bientôt Disponible")).toBeInTheDocument();

    // Switch to Billing
    fireEvent.click(screen.getByText("Facturation"));
    expect(screen.getByText("Bientôt Disponible")).toBeInTheDocument();
  });

  it("handles name update successfully", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} }); // Mock /auth/login for password
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    const nameInput = screen.getByLabelText(/Nouveau nom/i);
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    const pwdInputs = screen.getAllByLabelText(/Mot de passe actuel/i);
    fireEvent.change(pwdInputs[0], { target: { value: "mypassword" } }); // First one is under Name form

    fireEvent.click(screen.getByText("Enregistrer le nom"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "enzo.gaggiotti@outlook.com",
        password: "mypassword",
      });
      expect(api.put).toHaveBeenCalledWith("/users/me/profile", {
        name: "New Name",
        avatar_url: "",
      });
      expect(mockSetAuth).toHaveBeenCalledWith(
        "fake-jwt",
        expect.objectContaining({ name: "New Name", avatar_url: "" }),
      );
      expect(screen.getByText("Profil mis à jour")).toBeInTheDocument();
    });
  });

  it("handles email update successfully", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} }); // Mock /auth/login for password
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        id: "1",
        name: "Enzo Gaggiotti",
        email: "new@aegis.ai",
        role: "admin",
      },
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/Nouvelle adresse email/i);
    const pwdInputs = screen.getAllByLabelText(/Mot de passe actuel/i);

    fireEvent.change(emailInput, { target: { value: "new@aegis.ai" } });
    fireEvent.change(pwdInputs[1], { target: { value: "mypassword" } }); // Second one is under Email form

    fireEvent.click(screen.getByText("Mettre à jour l'identifiant"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "enzo.gaggiotti@outlook.com",
        password: "mypassword",
      });
      expect(api.put).toHaveBeenCalledWith("/users/me/email", {
        email: "new@aegis.ai",
      });
      expect(api.get).toHaveBeenCalledWith("/auth/me");
      expect(mockSetAuth).toHaveBeenCalledWith(
        "fake-jwt",
        expect.objectContaining({ email: "new@aegis.ai" }),
      );
      expect(screen.getByText("Email mis à jour")).toBeInTheDocument();
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

    const newPasswordInput = screen.getByLabelText(/Nouveau mot de passe/i);

    // Initially requirements are not met
    expect(screen.getByText("8+ symb.")).toHaveClass("text-gray-600");

    // Type a compliant password
    fireEvent.change(newPasswordInput, { target: { value: "Complex1!" } });

    expect(screen.getByText("8+ symb.")).toHaveClass("text-emerald-400");
    expect(screen.getByText("Majuscule")).toHaveClass("text-emerald-400");
    expect(screen.getByText("Chiffre")).toHaveClass("text-emerald-400");
    expect(screen.getByText("Spécial")).toHaveClass("text-emerald-400");
  });

  it("handles password update successfully", async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Sécurité"));

    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: "OldPass1!" },
    });
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: "NewPass1!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmation/i), {
      target: { value: "NewPass1!" },
    });

    fireEvent.click(screen.getByText("Mettre à jour la sécurité"));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/users/me/password", {
        old_password: "OldPass1!",
        new_password: "NewPass1!",
      });
      expect(screen.getByText("Mot de passe modifié")).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText(/Mot de passe actuel/i), {
      target: { value: "OldPassword1!" },
    });
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), {
      target: { value: "NewPass1!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmation/i), {
      target: { value: "Mismatch1!" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /Mettre à jour la sécurité/i }),
    );

    expect(
      await screen.findByText("Mots de passe différents"),
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
