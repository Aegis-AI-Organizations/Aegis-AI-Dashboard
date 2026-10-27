import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ScanPipelineGraph } from "../components/ScanPipelineGraph";

let lastReactFlowProps: any = null;

vi.mock("@xyflow/react", () => ({
  ReactFlow: (props: any) => {
    lastReactFlowProps = props;
    const { nodes, edges, nodeTypes } = props;
    const PipelineNode = nodeTypes?.pipeline;

    return (
      <div data-testid="reactflow">
        {nodes.map((node: any) => (
          <div key={node.id} data-testid={`node-${node.id}`}>
            {PipelineNode ? (
              <PipelineNode id={node.id} data={node.data} />
            ) : null}
          </div>
        ))}
        {edges.map((edge: any) => (
          <div key={edge.id} data-testid={`edge-${edge.id}`} />
        ))}
      </div>
    );
  },
}));

describe("ScanPipelineGraph", () => {
  beforeEach(() => {
    lastReactFlowProps = null;
  });

  it("renders all four pipeline nodes", () => {
    render(<ScanPipelineGraph scanStatus="PENDING" />);

    expect(screen.getByTestId("node-frontend")).toBeInTheDocument();
    expect(screen.getByTestId("node-api")).toBeInTheDocument();
    expect(screen.getByTestId("node-agent")).toBeInTheDocument();
    expect(screen.getByTestId("node-target")).toBeInTheDocument();
  });

  it("marks agent and target active, with an animated edge, during ATTACKING", () => {
    render(<ScanPipelineGraph scanStatus="ATTACKING" />);

    const agentNode = lastReactFlowProps.nodes.find(
      (n: any) => n.id === "agent",
    );
    const targetNode = lastReactFlowProps.nodes.find(
      (n: any) => n.id === "target",
    );
    const frontendNode = lastReactFlowProps.nodes.find(
      (n: any) => n.id === "frontend",
    );

    expect(agentNode.data.active).toBe(true);
    expect(targetNode.data.active).toBe(true);
    expect(frontendNode.data.active).toBe(false);

    const activeEdge = lastReactFlowProps.edges.find(
      (e: any) => e.id === "agent-target",
    );
    expect(activeEdge.animated).toBe(true);
  });

  it("marks every node active with a success tone when COMPLETED", () => {
    render(<ScanPipelineGraph scanStatus="COMPLETED" />);

    expect(lastReactFlowProps.nodes.every((n: any) => n.data.active)).toBe(
      true,
    );
    expect(
      lastReactFlowProps.nodes.every((n: any) => n.data.tone === "success"),
    ).toBe(true);
    // Terminal state: edges are not animated even though they're active.
    expect(lastReactFlowProps.edges.every((e: any) => !e.animated)).toBe(true);
  });

  it("falls back to an idle, inactive graph for an unknown status", () => {
    render(<ScanPipelineGraph scanStatus="SOME_UNKNOWN_STATUS" />);

    expect(lastReactFlowProps.nodes.every((n: any) => !n.data.active)).toBe(
      true,
    );
  });
});
