import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Users } from "../pages/Users";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockCompanies = [
  {
    id: "comp-1",
    name: "Aegis AI",
    deployment_token: "token-1",
    owner_email: "admin@aegis.ai",
  },
  {
    id: "comp-2",
    name: "Client Corp",
    deployment_token: "token-2",
    owner_email: "owner@client.com",
  },
];

const mockUsers = [
  {
    id: "u-1",
    name: "John Doe",
    email: "john@client.com",
    role: "owner",
    company_id: "comp-2",
  },
];

describe("Users Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useAuthStore
      .getState()
      .setAuth("token", { id: "su-1", role: "superadmin" } as any);
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes("/admin/companies")) {
        return Promise.resolve({ data: mockCompanies });
      }
      if (url.includes("/admin/users")) {
        return Promise.resolve({ data: mockUsers });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the company list after debounce", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    // Initial load debounce
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByText("Aegis AI")).toBeInTheDocument();
      expect(screen.getByText("Client Corp")).toBeInTheDocument();
    });
  });

  it("filters companies via search", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    // Initial load
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    const searchInput = screen.getByPlaceholderText(
      /Rechercher une entreprise/i,
    );
    fireEvent.change(searchInput, { target: { value: "Aegis" } });

    // Search debounce
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("search=Aegis"),
      );
    });
  });

  it("expands a company to show members", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => screen.getByText("Client Corp"));

    // Click on the company card to toggle
    fireEvent.click(screen.getByText("Client Corp"));

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users?company_id=comp-2"),
      );
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("shows creation buttons for superadmin", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    expect(screen.getByText("Créer un Utilisateur")).toBeInTheDocument();
    expect(screen.getByText("Nouvelle Entreprise")).toBeInTheDocument();
  });

  it("hides company creation for owner", async () => {
    useAuthStore
      .getState()
      .setAuth("token", { id: "o-1", role: "owner" } as any);
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    expect(screen.getByText("Créer un Utilisateur")).toBeInTheDocument();
    expect(screen.queryByText("Nouvelle Entreprise")).toBeNull();
  });

  it("opens and handles company creation modal", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { id: "new-comp", deployment_token: "new-token" },
    });

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Nouvelle Entreprise"));

    expect(screen.getByText("Nouvelle Entité Aegis")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("ex: Global CyberSec Inc."), {
      target: { value: "New Co" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nom complet"), {
      target: { value: "New Owner" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email professionnel"), {
      target: { value: "new@owner.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Mot de passe initial"), {
      target: { value: "password" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Finaliser l'Onboarding/i }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Onboarding Réussi !")).toBeInTheDocument();
    });
  });

  it("opens and handles user creation modal", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: "new-user" } });

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    // Initial load for companies
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(screen.getByText("Créer un Utilisateur"));

    expect(screen.getByText("Nouveau Collaborateur")).toBeInTheDocument();

    // Fill the select (need to wait for companies to be loaded for options to appear)
    await waitFor(
      () => expect(screen.getByText("Client Corp")).toBeInTheDocument(),
      { timeout: 2000 },
    );

    const companySelect = screen.getByLabelText(
      "Choix de l'Entreprise",
    ) as HTMLSelectElement;
    fireEvent.change(companySelect, { target: { value: "comp-2" } });

    fireEvent.change(screen.getByPlaceholderText("Prénom Nom"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByPlaceholderText("user@domain.com"), {
      target: { value: "new@client.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("8+ caractères"), {
      target: { value: "password" },
    });

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Créer le Collaborateur/i }),
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("Nouveau Collaborateur")).toBeNull();
    });
  });
});
