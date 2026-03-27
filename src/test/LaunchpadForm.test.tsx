import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LaunchpadForm } from "../components/LaunchpadForm";

const createScan = vi.fn();

vi.mock("../hooks/useCreateScan", () => ({
  useCreateScan: () => ({
    createScan,
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../components/ScanProgressTracker", () => ({
  ScanProgressTracker: ({ scanId }: { scanId: string }) => (
    <div>tracker-{scanId}</div>
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
});
