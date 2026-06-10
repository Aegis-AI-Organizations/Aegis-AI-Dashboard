import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Topology } from "../pages/Topology";
import { useAuthStore } from "../store/AuthStore";

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
let lastReactFlowProps: any = null;
const useAuthStoreMock = vi.mocked(useAuthStore);
const mockTopologyResponse = {
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
};

vi.mock("../store/AuthStore", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("../hooks/useCompanies", () => ({
  useCompanies: () => ({
    companies: [
      {
        id: "company-1",
        name: "Alpha",
        owner_email: "owner@alpha.test",
      },
      {
        id: "company-2",
        name: "Beta",
        owner_email: "owner@beta.test",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../hooks/useTopology", () => ({
  useTopology: (companyId?: string) => topologyState(companyId),
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
  ReactFlow: (props: any) => {
    lastReactFlowProps = props;
    const { nodes, edges } = props;

    return (
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
    );
  },
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Handle: () => <div data-testid="handle" />,
  Position: { Left: "left", Right: "right", Top: "top", Bottom: "bottom" },
}));

describe("Topology page", () => {
  beforeEach(() => {
    lastReactFlowProps = null;
    useAuthStoreMock.mockReturnValue({
      user: {
        id: "u-1",
        email: "admin@aegis.ai",
        name: "Admin",
        company_id: "company-1",
        role: "admin",
      },
    });

    topologyState.mockReturnValue(mockTopologyResponse);

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
    render(
      <MemoryRouter initialEntries={["/topology?company_id=company-2"]}>
        <Topology />
      </MemoryRouter>,
    );

    expect(screen.getByText("Topologie")).toBeInTheDocument();
    expect(screen.getByTestId("reactflow")).toBeInTheDocument();
    expect(topologyState).toHaveBeenCalledWith("company-2");

    await waitFor(() => {
      expect(screen.getByText("api")).toBeInTheDocument();
      expect(screen.getByText("vulnerable")).toBeInTheDocument();
    });

    expect(lastReactFlowProps.edges[0]).toMatchObject({
      source: "host-1",
      target: "container-1",
      sourceHandle: "source-host-1-0",
      targetHandle: "target-container-1-0",
    });
  });
});
