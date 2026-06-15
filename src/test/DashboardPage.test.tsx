import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dashboard } from "../pages/Dashboard";

const navigate = vi.fn();
const useScans = vi.fn();
const useAgentStatus = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../hooks/useScans", () => ({
  useScans: () => useScans(),
}));

vi.mock("../hooks/useAgentStatus", () => ({
  useAgentStatus: () => useAgentStatus(),
}));

vi.mock("../hooks/useScanStream", () => ({
  useScanStream: vi.fn(),
}));

vi.mock("../components/LaunchpadForm", () => ({
  LaunchpadForm: () => <div>launchpad-form</div>,
}));

describe("Dashboard page", () => {
  beforeEach(() => {
    useAgentStatus.mockReturnValue({
      summary: {
        total_agents: 3,
        active_agents: 2,
        inactive_agents: 1,
        last_seen: "2026-05-18T09:00:00.000Z",
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("renders empty and populated recent scans states", () => {
    useScans.mockReturnValueOnce({
      scans: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { rerender } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText("Aucun scan récent trouvé.")).toBeInTheDocument();
    expect(screen.getByText("État des agents")).toBeInTheDocument();
    expect(screen.getByText("Agents déployés")).toBeInTheDocument();
    expect(screen.getByText("Actifs")).toBeInTheDocument();
    expect(screen.getByText("Inactifs")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();

    useScans.mockReturnValueOnce({
      scans: [
        {
          id: "scan-1",
          temporal_workflow_id: "wf-1",
          target_image: "nginx:latest",
          status: "RUNNING",
          started_at: "2025-01-01T00:00:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    rerender(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("nginx:latest"));
    expect(navigate).toHaveBeenCalledWith("/vulnerabilities", {
      state: { openScanId: "scan-1" },
    });

    fireEvent.click(screen.getByText(/Voir tout l'historique/i));
    expect(navigate).toHaveBeenCalledWith("/vulnerabilities");
  });

  it("shows the first agent deployment CTA when no agent is deployed", () => {
    useAgentStatus.mockReturnValue({
      summary: {
        total_agents: 0,
        active_agents: 0,
        inactive_agents: 0,
        last_seen: null,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    useScans.mockReturnValue({
      scans: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const deploymentLink = screen.getByRole("link", {
      name: /Déployer son premier agent/i,
    });

    expect(screen.getByText("Aucun agent connecté")).toBeInTheDocument();
    expect(deploymentLink).toHaveAttribute(
      "href",
      "https://aegis-ai-organizations.github.io/Aegis-AI-Documentation/docs/Agent/install-infrastructure",
    );
    expect(deploymentLink).toHaveAttribute("target", "_blank");
  });
});
