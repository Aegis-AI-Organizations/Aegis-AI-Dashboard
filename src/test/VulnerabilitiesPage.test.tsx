import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Vulnerabilities } from "../pages/Vulnerabilities";

const useScans = vi.fn();

vi.mock("../hooks/useScans", () => ({
  useScans: () => useScans(),
}));

vi.mock("../components/PentestAccordion", () => ({
  PentestAccordion: ({
    scan,
    defaultOpen,
  }: {
    scan: { id: string };
    defaultOpen?: boolean;
  }) => (
    <div>
      accordion-{scan.id}-{String(defaultOpen)}
    </div>
  ),
}));

vi.mock("../components/VulnerabilityDetailsDrawer", () => ({
  VulnerabilityDetailsDrawer: () => <div>drawer</div>,
}));

describe("Vulnerabilities page", () => {
  it("renders loading and empty states", () => {
    useScans.mockReturnValueOnce({ scans: [], isLoading: true, error: null });
    const { rerender } = render(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Chargement de l'historique des pentests..."),
    ).toBeInTheDocument();

    useScans.mockReturnValueOnce({ scans: [], isLoading: false, error: null });
    rerender(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );

    expect(screen.getByText("Aucun pentest trouvé")).toBeInTheDocument();
  });

  it("paginates scans and opens the requested page", () => {
    useScans.mockReturnValue({
      isLoading: false,
      error: null,
      scans: Array.from({ length: 6 }, (_, index) => ({
        id: `scan-${index + 1}`,
        temporal_workflow_id: `wf-${index + 1}`,
        target_image: `image-${index + 1}`,
        status: "COMPLETED",
        started_at: "2025-01-01T00:00:00.000Z",
      })),
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/vulnerabilities", state: { openScanId: "scan-6" } },
        ]}
      >
        <Vulnerabilities />
      </MemoryRouter>,
    );

    expect(screen.getByText("accordion-scan-6-true")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Précédent" }));
    expect(screen.getByText("accordion-scan-1-false")).toBeInTheDocument();
  });

  it("renders error state", () => {
    useScans.mockReturnValue({
      scans: [],
      isLoading: false,
      error: "Ouch! Something went wrong",
    });

    render(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ouch! Something went wrong")).toBeInTheDocument();
  });

  it("shows the first scan as open by default on the first page", () => {
    useScans.mockReturnValue({
      isLoading: false,
      error: null,
      scans: [{ id: "scan-1", started_at: "2025-01-01" }],
    });

    render(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );

    expect(screen.getByText("accordion-scan-1-true")).toBeInTheDocument();
  });
});
