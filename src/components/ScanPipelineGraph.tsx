import { memo, useMemo } from "react";
import { ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Bot, Monitor, Server, Target as TargetIcon } from "lucide-react";
import { css } from "styled-system/css";
import {
  PIPELINE_EDGES,
  PIPELINE_NODES,
  getPipelineState,
  type PipelineNodeId,
  type PipelineTone,
} from "../constants/pipeline";

interface ScanPipelineGraphProps {
  scanStatus: string;
}

interface PipelineFlowNodeData {
  [key: string]: unknown;
  label: string;
  description: string;
  active: boolean;
  tone: PipelineTone;
}

const NODE_ICONS: Record<PipelineNodeId, typeof Monitor> = {
  frontend: Monitor,
  api: Server,
  agent: Bot,
  target: TargetIcon,
};

const TONE_COLORS: Record<PipelineTone, string> = {
  idle: "whiteAlpha.300",
  active: "{colors.brand.primary}",
  success: "{colors.emerald.400}",
  error: "{colors.red.400}",
};

const nodeToneColor = (tone: PipelineTone, active: boolean) =>
  active ? TONE_COLORS[tone] : "whiteAlpha.300";

const PipelineNode = memo(
  ({ id, data }: NodeProps<Node<PipelineFlowNodeData>>) => {
    const Icon = NODE_ICONS[id as PipelineNodeId];
    const color = nodeToneColor(data.tone, data.active);

    return (
      <div
        title={data.description}
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2",
          w: "28",
          p: "3",
          border: "1px solid",
          borderColor: data.active ? color : "whiteAlpha.200",
          borderRadius: "lg",
          bg: data.active ? "rgba(8, 13, 24, 0.95)" : "rgba(8, 13, 24, 0.6)",
          boxShadow: data.active
            ? `0 0 20px -4px ${color}`
            : "0 6px 16px rgba(0, 0, 0, 0.2)",
          transition: "all 200ms ease",
        })}
      >
        <Icon
          className={css({ w: "6", h: "6" })}
          style={{ color: data.active ? color : "var(--colors-text-muted)" }}
        />
        <span
          className={css({
            fontSize: "xs",
            fontWeight: "semibold",
            color: data.active ? "white" : "text.muted",
            textAlign: "center",
          })}
        >
          {data.label}
        </span>
      </div>
    );
  },
);

const nodeTypes = { pipeline: PipelineNode };

const NODE_X_STEP = 180;

export const ScanPipelineGraph: React.FC<ScanPipelineGraphProps> = ({
  scanStatus,
}) => {
  const { activeNodes, activeEdges, tone } = getPipelineState(scanStatus);

  const nodes = useMemo<Node<PipelineFlowNodeData>[]>(
    () =>
      PIPELINE_NODES.map((definition, index) => ({
        id: definition.id,
        type: "pipeline",
        position: { x: index * NODE_X_STEP, y: 0 },
        draggable: false,
        selectable: false,
        data: {
          label: definition.label,
          description: definition.description,
          active: activeNodes.has(definition.id),
          tone,
        },
      })),
    [activeNodes, tone],
  );

  const edges = useMemo<Edge[]>(
    () =>
      PIPELINE_EDGES.map((definition) => {
        const active = activeEdges.has(definition.id);
        const color = nodeToneColor(tone, active);
        return {
          id: definition.id,
          source: definition.source,
          target: definition.target,
          animated: active && tone === "active",
          style: {
            stroke: active ? color : "var(--colors-whiteAlpha-300)",
            strokeWidth: active ? 2 : 1,
          },
        };
      }),
    [activeEdges, tone],
  );

  return (
    <div
      className={css({
        w: "full",
        h: "36",
        "--xy-background-color": "transparent",
      })}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
};
