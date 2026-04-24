import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Billing } from "../pages/Billing";
import { useAuthStore } from "../store/AuthStore";

// Mock hooks
vi.mock("../hooks/useBilling", () => ({
  useBilling: () => ({
    balance: 1500,
    stats: [
      { date: "2024-01-01", total_consumed: 10 },
      { date: "2024-01-02", total_consumed: 20 },
    ],
    ledger: [
      {
        id: "1",
        amount: -10,
        reason: "Scan completed",
        created_at: "2024-04-24T10:00:00Z",
      },
      {
        id: "2",
        amount: 100,
        reason: "Admin adjustment",
        created_at: "2024-04-24T11:00:00Z",
      },
    ],
    isLoading: false,
    adjustTokens: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("../store/AuthStore", () => ({
  useAuthStore: vi.fn(),
}));

// Mock Recharts to avoid JSDOM errors
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

describe("Billing Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      user: { role: "admin", company_id: "test-co" },
    });
  });

  it("renders the billing information correctly", () => {
    render(<Billing />);

    // Check for title
    expect(screen.getByText("Facturation & Licences")).toBeInTheDocument();

    // Check for token balance
    expect(screen.getByText("Jetons disponibles")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument(); // With comma formatting

    // Check for chart section
    expect(screen.getByText("Consommation de Tokens")).toBeInTheDocument();

    // Check for ledger table
    expect(screen.getByText("Scan completed")).toBeInTheDocument();
    expect(screen.getByText("Admin adjustment")).toBeInTheDocument();
  });

  it("renders the adjustment button for admin roles", () => {
    render(<Billing />);
    expect(screen.getByText("Ajuster le Solde")).toBeInTheDocument();
  });

  it("hides adjustment button for non-admin roles", () => {
    (useAuthStore as any).mockReturnValue({
      user: { role: "operator" },
    });
    render(<Billing />);
    expect(screen.queryByText("Ajuster le Solde")).not.toBeInTheDocument();
  });
});
