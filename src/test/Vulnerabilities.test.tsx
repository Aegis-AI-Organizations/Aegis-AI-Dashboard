import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Vulnerabilities } from "../pages/Vulnerabilities";
import { useScans } from "../hooks/useScans";
import { MemoryRouter } from "react-router-dom";

vi.mock("../hooks/useScans", () => ({
  useScans: vi.fn(),
}));

const mockScans = [
  {
    id: "scan-1",
    target_image: "nginx:latest",
    status: "COMPLETED",
    vulnerabilities_count: {
      total: 2,
      critical: 1,
      high: 1,
      medium: 0,
      low: 0,
    },
    started_at: new Date().toISOString(),
    vulnerabilities: [
      { id: "v-1", name: "SQL Injection", severity: "CRITICAL" },
      { id: "v-2", name: "XSS", severity: "HIGH" },
    ],
  },
];

describe("Vulnerabilities Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders loading state", () => {
    vi.mocked(useScans).mockReturnValue({
      scans: [],
      isLoading: true,
      error: null,
    });
    render(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Chargement de l'historique/i)).toBeInTheDocument();
  });

  it("renders error state", () => {
    vi.mocked(useScans).mockReturnValue({
      scans: [],
      isLoading: false,
      error: "Failed to fetch",
    });
    render(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
  });

  it("renders scans list and handles search", async () => {
    vi.mocked(useScans).mockReturnValue({
      scans: mockScans,
      isLoading: false,
      error: null,
    });
    render(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );

    const desktopSearch = screen.getAllByPlaceholderText(/Rechercher/i)[0];
    fireEvent.change(desktopSearch, { target: { value: "nginx" } });

    const mobileSearch = screen.getAllByPlaceholderText(/Rechercher/i)[1];
    fireEvent.change(mobileSearch, { target: { value: "nginx" } });

    vi.advanceTimersByTime(500);

    // Test empty search
    fireEvent.change(desktopSearch, { target: { value: "" } });
    vi.advanceTimersByTime(500);

    expect(screen.getByText("nginx:latest")).toBeInTheDocument();
  });

  it("handles pagination", async () => {
    const manyScans = Array.from({ length: 10 }, (_, i) => ({
      ...mockScans[0],
      id: `scan-${i}`,
      target_image: `image-${i}`,
    }));
    vi.mocked(useScans).mockReturnValue({
      scans: manyScans,
      isLoading: false,
      error: null,
    });

    render(
      <MemoryRouter>
        <Vulnerabilities />
      </MemoryRouter>,
    );

    expect(screen.getByText("image-0")).toBeInTheDocument();
    expect(screen.queryByText("image-6")).toBeNull();

    const nextButton = screen.getByText("Suivant");
    fireEvent.click(nextButton);

    expect(screen.getByText("image-5")).toBeInTheDocument();
  });
});
