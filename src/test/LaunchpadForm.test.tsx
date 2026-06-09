import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LaunchpadForm } from "../components/LaunchpadForm";

const createScan = vi.fn();

let mockIsLoading = false;
let mockError: string | null = null;
const mockTopologyLoading = false;
const mockTopologyError: string | null = null;

vi.mock("../hooks/useCreateScan", () => ({
  useCreateScan: () => ({
    createScan,
    isLoading: mockIsLoading,
    error: mockError,
  }),
}));

vi.mock("../hooks/useTopology", () => ({
  useTopology: () => ({
    nodes: [
      {
        id: "host-1",
        kind: "host",
        label: "server-1",
        ipAddresses: ["10.0.0.1"],
        ports: [],
        exposedPorts: [],
        processes: [],
        vulnerable: false,
        highlighted: false,
        vulnerabilityCount: 0,
      },
      {
        id: "container-1",
        kind: "container",
        label: "api",
        subtitle: "nginx:latest",
        image: "nginx:latest",
        hostId: "host-1",
        ipAddresses: [],
        ports: [{ number: 80, protocol: "tcp" }],
        exposedPorts: [],
        processes: [],
        vulnerable: false,
        highlighted: false,
        vulnerabilityCount: 0,
      },
    ],
    edges: [],
    isLoading: mockTopologyLoading,
    error: mockTopologyError,
  }),
  formatTopologyPort: (port: { protocol?: string; number?: number }) =>
    `${port.protocol || "tcp"}/${port.number}`,
}));

vi.mock("../components/ScanProgressTracker", () => ({
  ScanProgressTracker: ({
    scanId,
    onReset,
  }: {
    scanId: string;
    onReset: () => void;
  }) => (
    <div>
      tracker-{scanId}
      <button onClick={onReset}>reset-btn</button>
    </div>
  ),
}));

describe("LaunchpadForm", () => {
  it("submits a scan and swaps to the progress tracker", async () => {
    const onScanUpdate = vi.fn();
    createScan.mockResolvedValueOnce({
      scan_id: "scan-99",
      temporal_workflow_id: "wf-99",
      status: "PENDING",
    });

    render(<LaunchpadForm onScanUpdate={onScanUpdate} />);

    fireEvent.click(screen.getByRole("button", { name: /api/i }));
    fireEvent.click(screen.getByRole("button", { name: "Lancer le Scan" }));

    await waitFor(() =>
      expect(screen.getByText("tracker-scan-99")).toBeInTheDocument(),
    );
    expect(createScan).toHaveBeenCalledWith({
      targetNodeIds: ["container-1"],
      targetLabel: "1 cible(s) selectionnee(s)",
    });
    expect(onScanUpdate).toHaveBeenCalledTimes(1);
  });

  it("handles reset", async () => {
    createScan.mockResolvedValueOnce({
      scan_id: "scan-123",
      status: "PENDING",
    });
    render(<LaunchpadForm />);

    fireEvent.click(screen.getByRole("button", { name: /Lancer le Scan/i }));

    await waitFor(() =>
      expect(screen.getByText("tracker-scan-123")).toBeInTheDocument(),
    );

    const resetButton = screen.getByText("reset-btn");
    fireEvent.click(resetButton);

    expect(screen.getByText("Topologie detectee")).toBeInTheDocument();
  });

  it("displays error message", () => {
    mockError = "Validation failed";
    render(<LaunchpadForm />);
    expect(screen.getByText("Validation failed")).toBeInTheDocument();
    mockError = null; // reset for other tests
  });

  it("shows loading state when submitting", () => {
    mockIsLoading = true;
    render(<LaunchpadForm />);
    expect(screen.getByText("Lancement...")).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    mockIsLoading = false; // reset
  });
});
