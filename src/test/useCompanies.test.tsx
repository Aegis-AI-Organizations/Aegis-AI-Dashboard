import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCompanies } from "../hooks/useCompanies";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
  },
}));

describe("useCompanies Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches companies successfully", async () => {
    const mockCompanies = [
      { id: "1", name: "Company A", owner_email: "a@co.com" },
    ];
    (api.get as any).mockResolvedValue({ data: mockCompanies });

    const { result } = renderHook(() => useCompanies("search"));

    await waitFor(
      () => {
        expect(result.current.companies).toEqual(mockCompanies);
      },
      { timeout: 1000 },
    );

    expect(result.current.isLoading).toBe(false);
    expect(api.get).toHaveBeenCalledWith("/admin/companies?search=search");
  });

  it("handles fetch errors", async () => {
    (api.get as any).mockRejectedValue({
      response: { data: { error: "Fetch failed" } },
    });

    const { result } = renderHook(() => useCompanies());

    await waitFor(
      () => {
        expect(result.current.error).toBe("Fetch failed");
      },
      { timeout: 1000 },
    );

    expect(result.current.companies).toEqual([]);
  });

  it("debounces search query changes", async () => {
    (api.get as any).mockResolvedValue({ data: [] });

    const { rerender } = renderHook(({ query }) => useCompanies(query), {
      initialProps: { query: "a" },
    });

    rerender({ query: "ab" });
    rerender({ query: "abc" });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });
    expect(api.get).toHaveBeenCalledWith("/admin/companies?search=abc");
  });
});
