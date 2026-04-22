import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  Administration,
  getActionColor,
  parseDetails,
} from "../pages/Administration";
import { api } from "../api/Axios";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("Administration Helpers", () => {
  it("getActionColor returns correct colors", () => {
    expect(getActionColor("START_SCAN")).toContain("text-cyan-400");
    expect(getActionColor("CREATE_COMPANY")).toContain("text-emerald-400");
    expect(getActionColor("DELETE_USER")).toContain("text-red-400");
  });

  it("parseDetails parses various input types", () => {
    expect(parseDetails('{"foo":"bar"}')).toEqual({ foo: "bar" });
    expect(parseDetails(null as any)).toBe(null);
    expect(parseDetails("invalid json")).toBe("invalid json");
  });
});

const mockLogs = {
  logs: [
    {
      id: "1",
      user_id: "u-1",
      company_id: "c-1",
      action: "START_SCAN",
      target_type: "SCAN",
      target_id: "s-1",
      details: '{"scan_id": "s-1"}',
      ip_address: "127.0.0.1",
      timestamp: new Date().toISOString(),
    },
    {
      id: "2",
      user_id: "u-1",
      company_id: "c-1",
      action: "CREATE_COMPANY",
      target_type: "COMPANY",
      target_id: "c-2",
      details: '{"name": "New Co"}',
      ip_address: "127.0.0.1",
      timestamp: new Date().toISOString(),
    },
  ],
  total: 2,
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

    await waitFor(
      () => {
        expect(screen.getByText("START SCAN")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  }, 15000);

  it("handles fetch errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.get).mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <Administration />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch"),
        expect.any(Error),
      );
    });
  }, 15000);

  it("triggers alert with parsed details when clicking info button", async () => {
    render(
      <MemoryRouter>
        <Administration />
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(screen.getByText("START SCAN")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    const infoButtons = screen.getAllByTitle("Voir les détails JSON");
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    fireEvent.click(infoButtons[0]);
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("scan_id"));
  }, 15000);

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
  }, 15000);

  it("shows action buttons that link to users page", () => {
    render(
      <MemoryRouter>
        <Administration />
      </MemoryRouter>,
    );
    expect(screen.getByText("Nouveau Collaborateur")).toBeInTheDocument();
    expect(screen.getByText("Nouvelle Entreprise")).toBeInTheDocument();
  });

  describe("Helper Functions", () => {
    it("getActionColor returns correct classes", () => {
      expect(getActionColor("CREATE_USER")).toContain("emerald");
      expect(getActionColor("START_SCAN")).toContain("cyan");
      expect(getActionColor("DELETE_USER")).toContain("red");
      expect(getActionColor("UNKNOWN")).toContain("gray");
    });

    it("parseDetails handles JSON correctly", () => {
      expect(parseDetails('{"a": 1}')).toEqual({ a: 1 });
      expect(parseDetails("not a json")).toBe("not a json");
    });
  });
});
