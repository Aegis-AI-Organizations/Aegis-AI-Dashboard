import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Agents } from "../pages/Agents";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockSetAuth = vi.fn();
let mockState = {
  user: {
    id: "1",
    name: "Enzo Gaggiotti",
    email: "enzo@aegis.ai",
    role: "owner",
    avatar_url: "",
  },
  accessToken: "fake-jwt",
  setAuth: mockSetAuth,
};

vi.mock("../store/AuthStore", () => ({
  useAuthStore: vi.fn((selector) =>
    selector ? selector(mockState) : mockState,
  ),
}));

describe("Agents Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    mockState = {
      user: {
        id: "1",
        name: "Enzo Gaggiotti",
        email: "enzo@aegis.ai",
        role: "owner",
        avatar_url: "",
      },
      accessToken: "fake-jwt",
      setAuth: mockSetAuth,
    };
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/agents") {
        return Promise.resolve({ data: { agents: [] } });
      }
      return Promise.reject(new Error("Not mocked"));
    });
  });

  it("renders the owner agent section", async () => {
    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    expect(screen.getByText("Agents")).toBeInTheDocument();
    expect(screen.getByText("Agents Déployés")).toBeInTheDocument();
    expect(
      screen.getByText("Rotation et révocation du Token"),
    ).toBeInTheDocument();
  });

  it("rotates the owner token", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { agent_token: "ag_rotated-token" },
    });

    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Régénérer/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/companies/me/agent-token/rotate");
      expect(screen.getByText("ag_rotated-token")).toBeInTheDocument();
    });
  });

  it("copies the deployment command and manages the owner token", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        agents: [
          {
            id: "agent-1",
            company_id: "company-1",
            name: "Production Agent",
            status: "RUNNING",
            last_seen: null,
            created_at: "2026-05-26T09:00:00Z",
          },
        ],
      },
    });
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: { agent_token: "ag_owner-token" } })
      .mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Production Agent")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Copier la commande/i }),
    );
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'curl -sL "https://api.aegis-ai.fr/install.sh?token=VOTRE_TOKEN_AGENT" | sudo bash',
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /Régénérer/i }));
    expect(await screen.findByText("ag_owner-token")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Copier token/i }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "ag_owner-token",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /Révoquer/i }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/companies/me/agent-token/revoke");
      expect(screen.getByText("Token agent révoqué.")).toBeInTheDocument();
    });
  });

  it("shows client agent management to admins", async () => {
    mockState.user.role = "admin";
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/admin/companies?search=") {
        return Promise.resolve({
          data: [
            {
              id: "company-1",
              name: "Client One",
              owner_email: "owner@client.test",
            },
          ],
        });
      }
      if (url === "/agents?company_id=company-1") {
        return Promise.resolve({
          data: {
            agents: [
              {
                id: "agent-1",
                company_id: "company-1",
                name: "Production Agent",
                status: "RUNNING",
                last_seen: null,
                created_at: "2026-05-26T09:00:00Z",
              },
            ],
          },
        });
      }
      return Promise.reject(new Error("Not mocked"));
    });

    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Agents des entreprises clientes"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Production Agent")).toBeInTheDocument();
  });

  it("searches companies and manages a client token as admin", async () => {
    mockState.user.role = "admin";
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/admin/companies?search=") {
        return Promise.resolve({
          data: [
            {
              id: "company-1",
              name: "Client One",
              owner_email: "owner@client-one.test",
            },
            {
              id: "company-2",
              name: "Client Two",
              owner_email: "owner@client-two.test",
            },
          ],
        });
      }
      if (url === "/admin/companies?search=Client%20Two") {
        return Promise.resolve({
          data: [
            {
              id: "company-2",
              name: "Client Two",
              owner_email: "owner@client-two.test",
            },
          ],
        });
      }
      if (url.startsWith("/agents?company_id=")) {
        return Promise.resolve({ data: { agents: [] } });
      }
      return Promise.reject(new Error("Not mocked"));
    });
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: { agent_token: "ag_client-token" } })
      .mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Agents />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /Client Two/i }));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/agents?company_id=company-2");
    });

    fireEvent.change(
      screen.getByLabelText("Rechercher une entreprise cliente"),
      { target: { value: "Client Two" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/admin/companies?search=Client%20Two",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "Actualiser" }));
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/agents?company_id=company-2");
    });

    fireEvent.click(screen.getByRole("button", { name: /Régénérer client/i }));
    expect(await screen.findByText("ag_client-token")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Copier token client/i }),
    );
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "ag_client-token",
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /Révoquer client/i }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/admin/companies/company-2/agent-token/revoke",
      );
      expect(
        screen.getByText("Token agent client révoqué."),
      ).toBeInTheDocument();
    });
  });
});
