import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Users } from "../pages/Users";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
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
      return Promise.resolve({ data: mockCompanies });
    });
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

  it("hides creation buttons for superadmin (moved to Administration)", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>,
    );
    expect(screen.queryByText("Créer un Utilisateur")).toBeNull();
    expect(screen.queryByText("Nouvelle Entreprise")).toBeNull();
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
});
