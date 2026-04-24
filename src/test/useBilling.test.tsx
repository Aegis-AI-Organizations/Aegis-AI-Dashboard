import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBilling } from "../hooks/useBilling";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("useBilling Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches billing data on mount", async () => {
    const mockBalance = { data: { balance: 1000 } };
    const mockLedger = {
      data: {
        entries: [
          { id: "1", amount: 10, reason: "test", created_at: "2024-01-01" },
        ],
      },
    };
    const mockStats = {
      data: { days: [{ date: "2024-01-01", total_consumed: 5 }] },
    };

    (api.get as any)
      .mockResolvedValueOnce(mockBalance)
      .mockResolvedValueOnce(mockLedger)
      .mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useBilling());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.balance).toBe(1000);
    expect(result.current.ledger).toHaveLength(1);
    expect(result.current.stats).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch errors gracefully", async () => {
    (api.get as any).mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useBilling());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(
      "Erreur lors du chargement des données de facturation",
    );
    expect(result.current.balance).toBeNull();
  });

  it("adjusts tokens and refreshes data", async () => {
    const mockBalance = { data: { balance: 1000 } };
    const mockLedger = { data: { entries: [] } };
    const mockStats = { data: { days: [] } };

    (api.get as any).mockResolvedValue(mockBalance);
    (api.post as any).mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useBilling());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.adjustTokens("company-1", 500, "Bonus");
    });

    expect(api.post).toHaveBeenCalledWith(
      "/admin/companies/company-1/tokens/adjust",
      {
        amount: 500,
        reason: "Bonus",
      },
    );

    // Verify it called refresh (api.get should be called again)
    // 3 calls initially + 3 calls after adjustment
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(6));
  });
});
