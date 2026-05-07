import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScanProgressTracker } from "../components/ScanProgressTracker";

const useScanPolling = vi.fn();

vi.mock("../hooks/useScanPolling", () => ({
  useScanPolling: (...args: unknown[]) => useScanPolling(...args),
}));

describe("ScanProgressTracker", () => {
  it("shows running progress details", () => {
    useScanPolling.mockReturnValue({ scanStatus: "ATTACKING" });

    render(
      <ScanProgressTracker
        scanId="scan-1"
        targetImage="nginx:latest"
        onReset={vi.fn()}
      />,
    );

    expect(screen.getByText("Attaque")).toBeInTheDocument();
    expect(screen.getByText("50% terminé")).toBeInTheDocument();
  });

  it("shows reset action once the scan is finished", () => {
    const onReset = vi.fn();
    useScanPolling.mockReturnValue({ scanStatus: "COMPLETED" });

    render(
      <ScanProgressTracker
        scanId="scan-2"
        targetImage="nginx:latest"
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Nouveau Scan" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
