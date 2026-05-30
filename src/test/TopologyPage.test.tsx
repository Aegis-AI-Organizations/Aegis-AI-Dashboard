import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React from "react";
import { Topology } from "../pages/Topology";

vi.mock("../api/Axios", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    defaults: {
      baseURL: "http://api.aegis.pre-alpha.local:32564",
    },
  },
}));

const topologyState = vi.fn();
const topologyEventState = vi.fn();

vi.mock("../hooks/useTopology", () => ({
  useTopology: () => topologyState(),
  getNodeMatcher: (node: any) =>
    [
      node.id,
      node.label,
      node.subtitle,
      node.hostId,
      ...(node.ipAddresses || []),
    ]
      .filter(Boolean)
      .map((value: string) => String(value).toLowerCase()),
}));

vi.mock("../hooks/useTopologySSE", () => ({
  useTopologySSE: () => topologyEventState(),
}));

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({ nodes, edges }: any) => (
    <div data-testid="reactflow">
      <div>nodes:{nodes.length}</div>
      <div>edges:{edges.length}</div>
      {nodes.map((node: any) => (
        <div key={node.id}>
          <span>{node.data.label}</span>
          <span>{node.data.vulnerable ? "vulnerable" : "safe"}</span>
        </div>
      ))}
    </div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Handle: () => <div data-testid="handle" />,
  Position: { Left: "left", Right: "right" },
}));

describe("Topology page", () => {
  beforeEach(() => {
    topologyState.mockReturnValue({
      nodes: [
        {
          id: "host-1",
          kind: "host",
          label: "host-a",
          subtitle: "10.0.0.1",
          ipAddresses: ["10.0.0.1"],
          ports: [],
          processes: [],
          vulnerable: false,
          highlighted: false,
          vulnerabilityCount: 0,
        },
        {
          id: "container-1",
          kind: "container",
          label: "api",
          subtitle: "nginx:latest",
          hostId: "host-1",
          ipAddresses: [],
          ports: [],
          processes: [],
          vulnerable: false,
          highlighted: false,
          vulnerabilityCount: 0,
        },
      ],
      edges: [{ id: "edge-1", source: "host-1", target: "container-1" }],
      isLoading: false,
      error: null,
    });

    topologyEventState.mockReturnValue({
      scanId: "scan-1",
      status: "COMPLETED",
      targetEndpoint: "10.0.0.1",
      isVulnerabilityEvent: true,
      raw: {
        scan_id: "scan-1",
        status: "COMPLETED",
        target_endpoint: "10.0.0.1",
      },
    });
  });

  it("renders topology nodes and marks matching nodes as vulnerable", async () => {
    render(<Topology />);

    expect(screen.getByText("Topologie")).toBeInTheDocument();
    expect(screen.getByTestId("reactflow")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("api")).toBeInTheDocument();
      expect(screen.getByText("vulnerable")).toBeInTheDocument();
    });
  });
});
