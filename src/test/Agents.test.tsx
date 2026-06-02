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
    expect(screen.getByText("Rotation et révocation du Token")).toBeInTheDocument();
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
});
