import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Dashboard } from "../pages/Dashboard";

const navigate = vi.fn();
const useScans = vi.fn();

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

vi.mock("../hooks/useScanStream", () => ({
  useScanStream: vi.fn(),
}));

vi.mock("../components/LaunchpadForm", () => ({
  LaunchpadForm: () => <div>launchpad-form</div>,
}));

describe("Dashboard page", () => {
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
  });
});
