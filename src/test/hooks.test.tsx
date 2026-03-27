import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { useCreateScan } from "../hooks/useCreateScan";
import { useDownloadReport } from "../hooks/useDownloadReport";
import { useEvidences } from "../hooks/useEvidences";
import { useScanPolling } from "../hooks/useScanPolling";
import { useScans } from "../hooks/useScans";
import { useVulnerabilities } from "../hooks/useVulnerabilities";

const fetchMock = vi.fn();

describe("dashboard hooks", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("loads scans sorted by most recent first", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "old",
          temporal_workflow_id: "wf-old",
          target_image: "nginx:1",
          status: "COMPLETED",
          started_at: "2025-01-01T10:00:00.000Z",
        },
        {
          id: "new",
          temporal_workflow_id: "wf-new",
          target_image: "nginx:2",
          status: "RUNNING",
          started_at: "2025-01-02T10:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useScans());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.scans.map((scan) => scan.id)).toEqual(["new", "old"]);
  });

  it("updates scan status real-time via SSE", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "scan-1",
          status: "RUNNING",
          started_at: "2025-01-01T10:00:00.000Z",
        },
      ],
    });

    const { result } = renderHook(() => useScans());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Simulate an SSE update
    const eventSourceInstance = (window.EventSource as any).mock.results.at(
      -1,
    ).value;

    await act(async () => {
      eventSourceInstance.onmessage({
        data: JSON.stringify({ scan_id: "scan-1", status: "COMPLETED" }),
      } as MessageEvent);
    });

    await waitFor(() =>
      expect(result.current.scans[0].status).toBe("COMPLETED"),
    );

    // Simulate an error to cover onerror
    await act(async () => {
      eventSourceInstance.onerror(new Error("sse error"));
    });
    // onerror should just log and not crash

    // Simulate a message for an unknown scan to cover refetch branch
    await act(async () => {
      eventSourceInstance.onmessage({
        data: JSON.stringify({ scan_id: "unknown", status: "RUNNING" }),
      });
    });
    // This should trigger a refetch - we can check fetchMock calls
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("exposes a friendly scans error message on fetch failure", async () => {
    fetchMock.mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useScans());

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Impossible de charger l'historique des pentests.",
      );
    });
  });

  it("creates a scan and reports validation or API failures", async () => {
    const { result } = renderHook(() => useCreateScan());

    await act(async () => {
      const response = await result.current.createScan("   ");
      expect(response).toBeNull();
    });
    expect(result.current.error).toBe("L'image Docker est requise.");

    fetchMock.mockResolvedValueOnce({
      status: 201,
      json: async () => ({
        scan_id: "scan-1",
        temporal_workflow_id: "wf-1",
        status: "PENDING",
      }),
    });

    await act(async () => {
      const response = await result.current.createScan(" nginx:latest ");
      expect(response?.scan_id).toBe("scan-1");
    });

    fetchMock.mockResolvedValueOnce({
      status: 500,
      statusText: "Server Error",
      json: async () => ({ message: "API failure" }),
    });

    await act(async () => {
      const response = await result.current.createScan("nginx:latest");
      expect(response).toBeNull();
    });
    expect(result.current.error).toBe("API failure");
  });

  it("downloads the report through a temporary anchor element", () => {
    const appendChild = vi.spyOn(document.body, "appendChild");
    const removeChild = vi.spyOn(document.body, "removeChild");
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElement = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName) => {
        const element = originalCreateElement(tagName);
        if (tagName === "a") {
          element.click = click;
        }
        return element;
      });

    const { result } = renderHook(() => useDownloadReport());

    act(() => {
      result.current.downloadReport("scan-42");
    });

    expect(click).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalled();
    expect(removeChild).toHaveBeenCalled();
    expect(result.current.error).toBeNull();

    createElement.mockRestore();
  });

  it("polls an active scan until a terminal status is returned", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "scan-42",
        temporal_workflow_id: "wf-42",
        target_image: "nginx:latest",
        status: "COMPLETED",
      }),
    });

    const { result } = renderHook(() => useScanPolling("scan-42", "RUNNING"));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
      await Promise.resolve();
    });

    expect(result.current.scanStatus).toBe("COMPLETED");
  });

  it("loads vulnerabilities and evidences, then resets when ids are missing", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "vuln-1",
            vuln_type: "SQLi",
            severity: "HIGH",
            target_endpoint: "/login",
            description: "Injection found",
            discovered_at: "2025-01-02T10:00:00.000Z",
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "evidence-1",
            vulnerability_id: "vuln-1",
            payload_used: "' OR 1=1 --",
            loot_data: { rows: 1 },
            captured_at: "2025-01-02T10:00:00.000Z",
          },
        ],
      });

    const { result: vulnerabilities } = renderHook(() =>
      useVulnerabilities("scan-1"),
    );
    const { result: evidences } = renderHook(() => useEvidences("vuln-1"));

    await waitFor(() =>
      expect(vulnerabilities.current.vulnerabilities).toHaveLength(1),
    );
    await waitFor(() => expect(evidences.current.evidences).toHaveLength(1));

    const { result: emptyVulnerabilities } = renderHook(() =>
      useVulnerabilities(undefined),
    );
    const { result: emptyEvidences } = renderHook(() => useEvidences(null));

    expect(emptyVulnerabilities.current.vulnerabilities).toEqual([]);
    expect(emptyEvidences.current.evidences).toEqual([]);
  });
});
