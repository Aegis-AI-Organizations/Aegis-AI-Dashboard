import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SuccessModal, Users } from "../pages/Users";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: {
      baseURL: "http://api.aegis.pre-alpha.local:32564",
    },
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
  {
    id: "u-2",
    name: "Second Owner",
    email: "second-owner@client.com",
    role: "owner",
    company_id: "comp-2",
  },
];

describe("Users Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    useAuthStore
      .getState()
      .setAuth("token", { id: "su-1", role: "superadmin" } as any);
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes("/admin/users")) {
        return Promise.resolve({ data: mockUsers });
      }
      if (url.includes("/users")) {
        return Promise.resolve({ data: mockUsers });
      }
      return Promise.resolve({ data: mockCompanies });
    });
    vi.mocked(api.post).mockResolvedValue({ data: { id: "u-2" } });
    vi.mocked(api.patch).mockResolvedValue({ data: { id: "u-1" } });
    vi.mocked(api.delete).mockResolvedValue({ data: { id: "u-1" } });
  });

  it("renders the company list after debounce", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(screen.getByText("Aegis AI")).toBeInTheDocument();
        expect(screen.getByText("Client Corp")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("filters companies via search", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    // Wait for initial load
    await waitFor(() => screen.getByText("Aegis AI"), { timeout: 5000 });

    const searchInput = screen.getByPlaceholderText(
      /Rechercher une entreprise/i,
    );
    fireEvent.change(searchInput, { target: { value: "Aegis" } });

    await waitFor(
      () => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining("search=Aegis"),
        );
      },
      { timeout: 5000 },
    );
  });

  it("expands a company to show members", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Client Corp"), { timeout: 5000 });

    fireEvent.click(screen.getByText("Client Corp"));

    await waitFor(
      () => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining("/admin/users?company_id=comp-2"),
        );
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("allows superadmin to manage collaborators from any company", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Client Corp"), { timeout: 5000 });
    fireEvent.click(screen.getByText("Client Corp"));

    await waitFor(() => screen.getByText("John Doe"), { timeout: 5000 });

    expect(
      screen.getByLabelText("Modifier le rôle de John Doe"),
    ).not.toBeDisabled();
    expect(
      screen.getAllByTitle("Désactiver le collaborateur").length,
    ).toBeGreaterThan(0);
  });

  it("uses admin user action routes for internal administrators", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Client Corp"), { timeout: 5000 });
    fireEvent.click(screen.getByText("Client Corp"));

    await waitFor(() => screen.getByText("John Doe"), { timeout: 5000 });
    fireEvent.change(screen.getByLabelText("Modifier le rôle de John Doe"), {
      target: { value: "operateur" },
    });

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/admin/users/u-1/role", {
        role: "operateur",
        company_id: "comp-2",
      });
    });

    fireEvent.click(screen.getAllByTitle("Désactiver le collaborateur")[0]);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/admin/users/u-1/status", {
        is_active: false,
        company_id: "comp-2",
      });
    });
  });

  it("shows creation buttons for superadmin (consolidated hub)", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    expect(screen.getByText("Créer un Utilisateur")).toBeInTheDocument();
    expect(screen.getByText("Nouvelle Entreprise")).toBeInTheDocument();
  });

  it("toggles company expansion and avoids re-fetching if members exist", async () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Client Corp"));

    // First expand
    fireEvent.click(screen.getByText("Client Corp"));
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining("/admin/users"),
      ),
    );

    // Collapse
    fireEvent.click(screen.getByText("Client Corp"));

    // Expand again
    fireEvent.click(screen.getByText("Client Corp"));
    await waitFor(() => screen.getByText("John Doe"));
  });

  it("shows only user creation for owner", () => {
    useAuthStore.getState().setAuth("token", {
      id: "o-1",
      role: "owner",
      company_id: "comp-2",
    } as any);
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    expect(screen.getByText("Créer un Utilisateur")).toBeInTheDocument();
    expect(screen.queryByText("Nouvelle Entreprise")).toBeNull();
  });

  it("supports the client company response shape for owner users", async () => {
    useAuthStore.getState().setAuth("token", {
      id: "o-1",
      role: "owner",
      company_id: "comp-2",
    } as any);
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes("/users")) {
        return Promise.resolve({ data: mockUsers });
      }
      return Promise.resolve({ data: { companies: [mockCompanies[1]] } });
    });

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Client Corp")).toBeInTheDocument();
    });
  });

  it("uses client invitation route for owner-created collaborators", async () => {
    useAuthStore.getState().setAuth("token", {
      id: "o-1",
      role: "owner",
      company_id: "comp-2",
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Créer un Utilisateur"));
    fireEvent.click(screen.getByText("Créer un Utilisateur"));

    fireEvent.change(screen.getByPlaceholderText("Prénom Nom"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("user@domain.com"), {
      target: { value: "jane@client.com" },
    });
    fireEvent.click(screen.getByText("Envoyer l'invitation"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/users/invitations", {
        name: "Jane Doe",
        email: "jane@client.com",
        role: "viewer",
      });
    });
  });

  it("falls back to admin invitation route when tenant route is unavailable", async () => {
    useAuthStore.getState().setAuth("token", {
      id: "o-1",
      role: "owner",
      company_id: "comp-2",
    } as any);
    vi.mocked(api.post).mockImplementation((url) => {
      if (url === "/users/invitations") {
        return Promise.reject({ response: { status: 404 } });
      }
      return Promise.resolve({ data: { id: "u-3" } });
    });

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Créer un Utilisateur"));
    fireEvent.click(screen.getByText("Créer un Utilisateur"));

    fireEvent.change(screen.getByPlaceholderText("Prénom Nom"), {
      target: { value: "Fallback User" },
    });
    fireEvent.change(screen.getByPlaceholderText("user@domain.com"), {
      target: { value: "fallback@client.com" },
    });
    fireEvent.click(screen.getByText("Envoyer l'invitation"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/admin/users", {
        name: "Fallback User",
        email: "fallback@client.com",
        role: "viewer",
        company_id: "comp-2",
      });
    });
  });

  it("shows every owner returned for the tenant company", async () => {
    useAuthStore.getState().setAuth("token", {
      id: "o-1",
      role: "owner",
      company_id: "comp-2",
    } as any);

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Client Corp"), { timeout: 5000 });
    fireEvent.click(screen.getByText("Client Corp"));

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Second Owner")).toBeInTheDocument();
    });
  });

  it("lets an owner update and deactivate tenant collaborators", async () => {
    useAuthStore.getState().setAuth("token", {
      id: "o-1",
      role: "owner",
      company_id: "comp-2",
    } as any);
    const tenantUsers = [
      {
        id: "o-1",
        name: "Current Owner",
        email: "owner@client.com",
        role: "owner",
        company_id: "comp-2",
        is_active: true,
      },
      {
        id: "u-1",
        name: "John Doe",
        email: "john@client.com",
        role: "viewer",
        company_id: "comp-2",
        is_active: true,
      },
      {
        id: "u-2",
        name: "Other Owner",
        email: "other-owner@client.com",
        role: "owner",
        company_id: "comp-2",
        is_active: true,
      },
      {
        id: "u-3",
        name: "Inactive User",
        email: "inactive@client.com",
        role: "viewer",
        company_id: "comp-2",
        is_active: false,
      },
    ];
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes("/users")) {
        return Promise.resolve({ data: tenantUsers });
      }
      return Promise.resolve({ data: { companies: [mockCompanies[1]] } });
    });

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Client Corp"), { timeout: 5000 });
    fireEvent.click(screen.getByText("Client Corp"));

    await waitFor(() => screen.getByText("John Doe"), { timeout: 5000 });
    fireEvent.change(screen.getByLabelText("Modifier le rôle de John Doe"), {
      target: { value: "operateur" },
    });

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/u-1/role", {
        role: "operateur",
        company_id: "comp-2",
      });
    });

    expect(
      screen.getByLabelText("Modifier le rôle de Current Owner"),
    ).toBeDisabled();
    expect(
      screen.getByLabelText("Modifier le rôle de Other Owner"),
    ).not.toBeDisabled();
    expect(screen.getByText("Désactivé")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Réactiver le collaborateur"));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/u-3/status", {
        is_active: true,
        company_id: "comp-2",
      });
    });

    fireEvent.click(screen.getAllByTitle("Désactiver le collaborateur")[0]);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/u-1/status", {
        is_active: false,
        company_id: "comp-2",
      });
      expect(screen.getAllByText("Désactivé")).toHaveLength(1);
    });

    fireEvent.click(screen.getByLabelText("Désactiver Other Owner"));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/u-2/status", {
        is_active: false,
        company_id: "comp-2",
      });
    });
  });

  it("falls back to legacy delete when collaborator status route is unavailable", async () => {
    useAuthStore.getState().setAuth("token", {
      id: "o-1",
      role: "owner",
      company_id: "comp-2",
    } as any);
    vi.mocked(api.get).mockImplementation((url) => {
      if (url.includes("/users")) {
        return Promise.resolve({
          data: [
            {
              id: "u-1",
              name: "John Doe",
              email: "john@client.com",
              role: "viewer",
              company_id: "comp-2",
              is_active: true,
            },
          ],
        });
      }
      return Promise.resolve({ data: { companies: [mockCompanies[1]] } });
    });
    vi.mocked(api.patch).mockRejectedValueOnce({
      response: { status: 404 },
    });

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText("Client Corp"), { timeout: 5000 });
    fireEvent.click(screen.getByText("Client Corp"));

    await waitFor(() => screen.getByText("John Doe"), { timeout: 5000 });
    fireEvent.click(screen.getByTitle("Désactiver le collaborateur"));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/users/u-1/status", {
        is_active: false,
        company_id: "comp-2",
      });
      expect(api.delete).toHaveBeenCalledWith("/users/u-1");
      expect(screen.getByText("Désactivé")).toBeInTheDocument();
    });
  });

  it("shows the first-login email state after onboarding without deployment token", () => {
    render(
      <SuccessModal
        data={{
          company_name: "Client Corp",
          company_id: "comp-2",
          owner_id: "owner-2",
          owner_email: "owner@client.com",
          deployment_token: "",
        }}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Invitation première connexion"),
    ).toBeInTheDocument();
    expect(screen.getByText(/owner@client.com/)).toBeInTheDocument();
    expect(screen.queryByText("Token de Déploiement")).toBeNull();
  });
});
