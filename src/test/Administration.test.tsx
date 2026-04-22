import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Administration } from "../pages/Administration";
import { api } from "../api/Axios";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockLogs = {
  logs: [
    {
      id: "log-1",
      user_id: "user-123",
      company_id: "comp-456",
      action: "START_SCAN",
      target_type: "SCAN",
      target_id: "scan-789",
      details: '{"image": "nginx"}',
      ip_address: "127.0.0.1",
      timestamp: "2026-04-22T10:00:00Z",
    },
  ],
  total: 1,
};

describe("Administration Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: mockLogs });
  });

  it("renders the administration header and audit trail section", async () => {
    render(
      <MemoryRouter>
        <Administration />
      </MemoryRouter>,
    );

    expect(screen.getByText("Administration")).toBeInTheDocument();
    expect(screen.getByText(/Journal d'Audit/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("START SCAN")).toBeInTheDocument();
      expect(screen.getByText("127.0.0.1")).toBeInTheDocument();
    });
  });

  it("shows action buttons that link to users page", () => {
    render(
      <MemoryRouter>
        <Administration />
      </MemoryRouter>,
    );

    expect(screen.getByText("Nouveau Collaborateur")).toBeInTheDocument();
    expect(screen.getByText("Nouvelle Entreprise")).toBeInTheDocument();
  });

  it("handles empty logs gracefully", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { logs: [], total: 0 } });

    render(
      <MemoryRouter>
        <Administration />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Aucune activité enregistrée/i),
      ).toBeInTheDocument();
    });
  });
});
