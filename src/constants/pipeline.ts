export type PipelineNodeId = "frontend" | "api" | "agent" | "target";

export type PipelineTone = "idle" | "active" | "success" | "error";

export interface PipelineNodeDefinition {
  id: PipelineNodeId;
  label: string;
  description: string;
}

export interface PipelineEdgeDefinition {
  id: string;
  source: PipelineNodeId;
  target: PipelineNodeId;
}

export const PIPELINE_NODES: PipelineNodeDefinition[] = [
  {
    id: "frontend",
    label: "Frontend",
    description: "Dashboard — soumet le scan, affiche le rapport final.",
  },
  {
    id: "api",
    label: "API",
    description:
      "Brain — orchestre le workflow Temporal, persiste les résultats.",
  },
  {
    id: "agent",
    label: "Agent",
    description:
      "Worker Pentest — exécute les probes offensifs (SQLi, XSS...).",
  },
  {
    id: "target",
    label: "Target",
    description: "Sandbox War Room — la cible jetable sous test.",
  },
];

export const PIPELINE_EDGES: PipelineEdgeDefinition[] = [
  { id: "frontend-api", source: "frontend", target: "api" },
  { id: "api-agent", source: "api", target: "agent" },
  { id: "agent-target", source: "agent", target: "target" },
];

interface PipelineState {
  activeNodes: Set<PipelineNodeId>;
  activeEdges: Set<string>;
  tone: PipelineTone;
}

const EMPTY_STATE: PipelineState = {
  activeNodes: new Set(),
  activeEdges: new Set(),
  tone: "idle",
};

// Maps a scan status to which pipeline node/edges are currently "lit up",
// mirroring the phases in Aegis-AI-Brain's PentestWorkflow.
const STATUS_PIPELINE_STATE: Record<string, PipelineState> = {
  PENDING: {
    activeNodes: new Set(["frontend", "api"]),
    activeEdges: new Set(["frontend-api"]),
    tone: "active",
  },
  PROVISIONING: {
    activeNodes: new Set(["api", "target"]),
    activeEdges: new Set(["api-agent"]),
    tone: "active",
  },
  SEEDING: {
    activeNodes: new Set(["api", "target"]),
    activeEdges: new Set(["api-agent"]),
    tone: "active",
  },
  RECONNAISSANCE: {
    activeNodes: new Set(["api", "agent", "target"]),
    activeEdges: new Set(["api-agent", "agent-target"]),
    tone: "active",
  },
  ATTACKING: {
    activeNodes: new Set(["agent", "target"]),
    activeEdges: new Set(["agent-target"]),
    tone: "active",
  },
  ANALYZING: {
    activeNodes: new Set(["api", "agent"]),
    activeEdges: new Set(["api-agent"]),
    tone: "active",
  },
  GENERATING_REPORT: {
    activeNodes: new Set(["frontend", "api"]),
    activeEdges: new Set(["frontend-api"]),
    tone: "active",
  },
  CLEANING_UP: {
    activeNodes: new Set(["api", "target"]),
    activeEdges: new Set(["api-agent"]),
    tone: "active",
  },
  COMPLETED: {
    activeNodes: new Set(["frontend", "api", "agent", "target"]),
    activeEdges: new Set(["frontend-api", "api-agent", "agent-target"]),
    tone: "success",
  },
  FAILED: {
    activeNodes: new Set(["frontend", "api"]),
    activeEdges: new Set(["frontend-api"]),
    tone: "error",
  },
  CANCELED: {
    activeNodes: new Set(["frontend", "api"]),
    activeEdges: new Set(["frontend-api"]),
    tone: "idle",
  },
};

export const getPipelineState = (status: string): PipelineState =>
  STATUS_PIPELINE_STATE[status] || EMPTY_STATE;
