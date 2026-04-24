import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Billing } from "../pages/Billing";
import { useAuthStore } from "../store/AuthStore";
import { useBilling } from "../hooks/useBilling";

// Mock hooks
vi.mock("../hooks/useBilling", () => ({
  useBilling: vi.fn(),
}));

vi.mock("../hooks/useCompanies", () => ({
  useCompanies: () => ({
    companies: [{ id: "co-1", name: "Client A", owner_email: "a@co.com" }],
    isLoading: false,
    error: null,
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
    (useBilling as any).mockReturnValue({
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
    });
  });

  it("renders the billing information for client roles", () => {
    (useAuthStore as any).mockReturnValue({
      user: { role: "operator", company_id: "test-co" },
    });
    render(<Billing />);

    // Check for title
    expect(screen.getByText("Facturation & Licences")).toBeInTheDocument();

    // Check for token balance
    expect(screen.getByText("Jetons disponibles")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument(); // With comma formatting

    // Check for chart section
    expect(screen.getByText("Consommation de Tokens")).toBeInTheDocument();
  });

  it("renders the company selection view for internal roles", () => {
    (useAuthStore as any).mockReturnValue({
      user: { role: "admin" },
    });
    render(<Billing />);

    expect(
      screen.getByPlaceholderText(/Rechercher un client/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Client A")).toBeInTheDocument();
  });

  it("allows selecting a company to view its billing", async () => {
    (useAuthStore as any).mockReturnValue({
      user: { role: "admin" },
    });
    render(<Billing />);

    const companyCard = screen.getByText("Client A");
    fireEvent.click(companyCard);

    // After selection, it should show the billing info for that company
    expect(screen.getByText("Billing: Client A")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("calls refresh when clicking the refresh button", () => {
    const mockRefresh = vi.fn();
    (useBilling as any).mockReturnValue({
      balance: 1000,
      stats: [],
      ledger: [],
      isLoading: false,
      error: null,
      refresh: mockRefresh,
      adjustTokens: vi.fn(),
    });

    (useAuthStore as any).mockReturnValue({
      user: { role: "operator", company_id: "test-co" },
    });
    render(<Billing />);

    const refreshButton = screen.getByText("Actualiser");
    fireEvent.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalled();
  });

  it("opens the adjustment modal when clicking the button", () => {
    (useAuthStore as any).mockReturnValue({
      user: { role: "admin" },
    });
    render(<Billing />);

    // First select a company
    fireEvent.click(screen.getByText("Client A"));

    const adjustButton = screen.getByText("Ajuster le Solde");
    fireEvent.click(adjustButton);

    expect(screen.getByText("Ajustement de Tokens")).toBeInTheDocument();
  });
});
