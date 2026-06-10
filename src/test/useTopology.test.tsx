import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTopology } from "../hooks/useTopology";
import { formatTopologyPort, getNodeMatcher } from "../hooks/useTopology";
import { useTopologySSE } from "../hooks/useTopologySSE";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn(),
    defaults: {
      baseURL: "http://api.aegis.pre-alpha.local:32564",
    },
  },
}));

let mockEventSourceInstance: any = null;

class MockEventSource {
  onmessage: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  url: string;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    mockEventSourceInstance = this;
  }
}

vi.stubGlobal("EventSource", MockEventSource);

describe("topology hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEventSourceInstance = null;
    useAuthStore.getState().setAuth("token-123", {} as any);
  });

  it("loads and normalizes topology nodes from the direct API response", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        nodes: [
          {
            id: "host-1",
            type: "host",
            hostname: "host-a",
            ip_addresses: ["10.0.0.1"],
          },
          {
            id: "container-1",
            type: "container",
            name: "api",
            image: "nginx:latest",
            host_id: "host-1",
            ports: [{ protocol: "tcp", port: 8080 }],
          },
        ],
        edges: [
          {
            source: "container-1",
            target: "host-1",
            port: 8080,
          },
        ],
      },
    });

    const { result } = renderHook(() => useTopology());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenCalledWith("/topology");
    expect(result.current.error).toBeNull();
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(2);
    expect(result.current.nodes[0]).toMatchObject({
      id: "host-1",
      kind: "host",
      label: "host-a",
    });
    expect(result.current.nodes[1]).toMatchObject({
      id: "container-1",
      kind: "container",
      hostId: "host-1",
      subtitle: "nginx:latest",
    });
  });

  it("appends the company filter to every fallback endpoint", async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useTopology("company-123"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenNthCalledWith(
      1,
      "/topology?company_id=company-123",
    );
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      "/topology/latest?company_id=company-123",
    );
    expect(api.get).toHaveBeenNthCalledWith(
      3,
      "/infrastructure/topology?company_id=company-123",
    );
  });

  it("trims the company filter before building fallback endpoints", async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useTopology("  company-123  "));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenNthCalledWith(
      1,
      "/topology?company_id=company-123",
    );
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      "/topology/latest?company_id=company-123",
    );
    expect(api.get).toHaveBeenNthCalledWith(
      3,
      "/infrastructure/topology?company_id=company-123",
    );
  });

  it("ignores blank company identifiers when building fallback endpoints", async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useTopology("   "));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenNthCalledWith(1, "/topology");
    expect(api.get).toHaveBeenNthCalledWith(2, "/topology/latest");
    expect(api.get).toHaveBeenNthCalledWith(3, "/infrastructure/topology");
  });

  it("returns an empty topology when no data is available", async () => {
    vi.mocked(api.get)
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useTopology());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenNthCalledWith(1, "/topology");
    expect(api.get).toHaveBeenNthCalledWith(2, "/topology/latest");
    expect(api.get).toHaveBeenNthCalledWith(3, "/infrastructure/topology");
    expect(result.current.nodes).toHaveLength(0);
    expect(result.current.edges).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("returns an empty topology when the API response has no nodes or hosts", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {},
    });

    const { result } = renderHook(() => useTopology());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenCalledWith("/topology");
    expect(result.current.nodes).toHaveLength(0);
    expect(result.current.edges).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("formats topology ports with the expected precedence", () => {
    expect(formatTopologyPort({ protocol: "udp", container_port: 53 })).toBe(
      "udp/53",
    );
    expect(formatTopologyPort({ hostPort: 8080 })).toBe("tcp/8080");
    expect(formatTopologyPort({})).toBe("");
  });

  it("builds searchable aliases for topology nodes", () => {
    expect(
      getNodeMatcher({
        id: "Host-1",
        label: "Web Host",
        subtitle: "10.0.0.1",
        hostId: "parent-host",
        ipAddresses: ["10.0.0.2", "10.0.0.3"],
      } as any),
    ).toEqual([
      "host-1",
      "web host",
      "10.0.0.1",
      "parent-host",
      "10.0.0.2",
      "10.0.0.3",
    ]);
  });

  it("normalizes topology data from host-based payloads", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        hosts: [
          {
            id: "host-1",
            hostname: "host-a",
            ip_addresses: ["10.0.0.1"],
            processes: [{ pid: 12, name: "sshd" }],
            containers: [
              {
                id: "container-1",
                name: "web",
                image: "nginx:latest",
                env: { FOO: "bar" },
                ports: [{ number: 80, protocol: "tcp" }],
                exposed_ports: [{ number: 8080, protocol: "tcp" }],
                processes: [{ pid: 42, name: "nginx" }],
              },
            ],
          },
        ],
      },
    });

    const { result } = renderHook(() => useTopology());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenCalledWith("/topology");
    expect(result.current.error).toBeNull();
    expect(result.current.nodes).toHaveLength(2);
    expect(result.current.edges).toHaveLength(1);
    expect(result.current.nodes[0]).toMatchObject({
      id: "host-1",
      kind: "host",
      label: "host-a",
      subtitle: "10.0.0.1",
    });
    expect(result.current.nodes[1]).toMatchObject({
      id: "container-1",
      kind: "container",
      hostId: "host-1",
      label: "web",
      subtitle: "nginx:latest",
    });
  });

  it("exposes a friendly error when topology loading fails unexpectedly", async () => {
    vi.mocked(api.get).mockRejectedValueOnce({
      response: { status: 500 },
    });

    const { result } = renderHook(() => useTopology());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(api.get).toHaveBeenCalledWith("/topology");
    expect(result.current.nodes).toHaveLength(0);
    expect(result.current.edges).toHaveLength(0);
    expect(result.current.error).toBe(
      "Impossible de charger la topologie de l'infrastructure.",
    );
  });

  it("exposes an SSE vulnerability event with target data", async () => {
    const { result } = renderHook(() => useTopologySSE());

    expect(mockEventSourceInstance.url).toContain("/scans/stream");
    expect(mockEventSourceInstance.url).toContain("token=token-123");

    await act(async () => {
      mockEventSourceInstance.onmessage?.({
        data: JSON.stringify({
          scan_id: "scan-1",
          event_type: "VULNERABILITY_FOUND",
          vulnerability: {
            target_endpoint: "10.0.0.1",
            severity: "HIGH",
            id: "vuln-1",
          },
        }),
      });
    });

    expect(result.current).toMatchObject({
      scanId: "scan-1",
      severity: "HIGH",
      vulnerabilityId: "vuln-1",
      targetEndpoint: "10.0.0.1",
      isVulnerabilityEvent: true,
    });
  });
});
