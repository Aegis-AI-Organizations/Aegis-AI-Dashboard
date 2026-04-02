import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LaunchpadForm } from "../components/LaunchpadForm";

const createScan = vi.fn();

let mockIsLoading = false;
let mockError: string | null = null;

vi.mock("../hooks/useCreateScan", () => ({
  useCreateScan: () => ({
    createScan,
    isLoading: mockIsLoading,
    error: mockError,
  }),
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

    fireEvent.change(screen.getByLabelText("Image Docker"), {
      target: { value: "nginx:latest" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lancer le Scan" }));

    await waitFor(() =>
      expect(screen.getByText("tracker-scan-99")).toBeInTheDocument(),
    );
    expect(createScan).toHaveBeenCalledWith("nginx:latest");
    expect(onScanUpdate).toHaveBeenCalledTimes(1);
  });

  it("handles reset", async () => {
    createScan.mockResolvedValueOnce({
      scan_id: "scan-123",
      status: "PENDING",
    });
    render(<LaunchpadForm />);

    const input = screen.getByPlaceholderText("ex: nginx:latest");
    fireEvent.change(input, { target: { value: "nginx:latest" } });
    fireEvent.click(screen.getByRole("button", { name: /Lancer le Scan/i }));

    await waitFor(() =>
      expect(screen.getByText("tracker-scan-123")).toBeInTheDocument(),
    );

    const resetButton = screen.getByText("reset-btn");
    fireEvent.click(resetButton);

    expect(screen.getByPlaceholderText("ex: nginx:latest")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ex: nginx:latest")).toHaveValue("");
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
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    mockIsLoading = false; // reset
  });
});
