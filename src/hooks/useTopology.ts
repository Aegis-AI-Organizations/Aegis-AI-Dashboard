import { useEffect, useMemo, useState } from "react";
import { api } from "../api/Axios";
import type {
  TopologyApiEdge,
  TopologyApiNode,
  TopologyGraphEdge,
  TopologyGraphNode,
  TopologyHost,
  TopologyResponse,
} from "../types/topology";

const endpointCandidates = [
  "/topology",
  "/topology/latest",
  "/infrastructure/topology",
];

const buildFallbackTopology = () => ({
  nodes: [
    {
      id: "api-route",
      kind: "host" as const,
      label: "api.aegis-ai.fr",
      subtitle: "Route publique /api",
      ipAddresses: [],
      ports: [],
      exposedPorts: [],
      processes: [],
      vulnerable: false,
      highlighted: false,
      vulnerabilityCount: 0,
    },
  ],
  edges: [],
});

const getNodeKind = (node: TopologyApiNode): "host" | "container" => {
  const rawKind = (node.kind || node.type || "").toLowerCase();
  return rawKind === "host" ? "host" : "container";
};

export const formatTopologyPort = (port: {
  protocol?: string;
  container_port?: number;
  containerPort?: number;
  host_port?: number;
  hostPort?: number;
  port?: number;
  number?: number;
}) => {
  const exposedPort =
    port.container_port ??
    port.containerPort ??
    port.number ??
    port.port ??
    port.host_port ??
    port.hostPort;
  if (!exposedPort) {
    return "";
  }
  return `${port.protocol || "tcp"}/${exposedPort}`;
};

export const getNodeMatcher = (node: TopologyGraphNode) => {
  const aliases = [
    node.id,
    node.label,
    node.subtitle,
    node.hostId,
    ...node.ipAddresses,
  ].filter(Boolean);

  return aliases.map((value) => String(value).toLowerCase());
};

const normalizeHosts = (hosts: TopologyHost[]) => {
  const nodes: TopologyGraphNode[] = [];
  const edges: TopologyGraphEdge[] = [];

  hosts.forEach((host, hostIndex) => {
    const hostId = host.id || `host-${hostIndex}`;
    nodes.push({
      id: hostId,
      kind: "host",
      label: host.hostname || hostId,
      subtitle: (host.ip_addresses || host.ipAddresses || []).join(", "),
      ipAddresses: host.ip_addresses || host.ipAddresses || [],
      ports: [],
      exposedPorts: [],
      processes: host.processes || [],
      vulnerable: false,
      highlighted: false,
      vulnerabilityCount: 0,
    });

    (host.containers || []).forEach((container, containerIndex) => {
      const containerId =
        container.id || `${hostId}-container-${containerIndex}`;
      nodes.push({
        id: containerId,
        kind: "container",
        label: container.name || containerId,
        subtitle: container.image,
        image: container.image,
        env: container.env || container.env_vars || container.envVars || {},
        hostId,
        ipAddresses: [],
        ports: container.ports || [],
        exposedPorts: container.exposed_ports || container.exposedPorts || [],
        processes: container.processes || [],
        vulnerable: false,
        highlighted: false,
        vulnerabilityCount: 0,
      });
      edges.push({
        id: `${hostId}-${containerId}`,
        source: hostId,
        target: containerId,
        label: "runs",
      });
    });
  });

  return { nodes, edges };
};

const normalizeNodes = (
  apiNodes: TopologyApiNode[],
  apiEdges: TopologyApiEdge[] = [],
) => {
  const nodes = apiNodes.map<TopologyGraphNode>((node) => {
    const kind = getNodeKind(node);
    const ipAddresses = node.ip_addresses || node.ipAddresses || [];

    return {
      id: node.id,
      kind,
      label: node.label || node.name || node.hostname || node.id,
      subtitle: kind === "host" ? ipAddresses.join(", ") : node.image,
      image: node.image,
      env: node.env || node.env_vars || node.envVars || {},
      hostId: node.host_id || node.hostId,
      ipAddresses,
      ports: node.ports || [],
      exposedPorts: node.exposed_ports || node.exposedPorts || [],
      processes: node.processes || [],
      vulnerable: false,
      highlighted: false,
      vulnerabilityCount: 0,
    };
  });

  const hostEdges = nodes
    .filter((node) => node.kind === "container" && node.hostId)
    .map<TopologyGraphEdge>((node) => ({
      id: `${node.hostId}-${node.id}`,
      source: node.hostId!,
      target: node.id,
      label: "runs",
    }));

  const edges = apiEdges.map<TopologyGraphEdge>((edge, index) => ({
    id: edge.id || `${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.label || formatTopologyPort(edge),
  }));

  return { nodes, edges: [...hostEdges, ...edges] };
};

const normalizeTopology = (payload: TopologyResponse) => {
  if (payload.nodes?.length) {
    return normalizeNodes(payload.nodes, payload.edges);
  }

  const hosts = payload.hosts || [];
  if (hosts.length > 0) {
    return normalizeHosts(hosts);
  }

  return buildFallbackTopology();
};

export const useTopology = () => {
  const [topology, setTopology] = useState<{
    nodes: TopologyGraphNode[];
    edges: TopologyGraphEdge[];
  }>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTopology = async () => {
      setIsLoading(true);
      setError(null);

      for (const endpoint of endpointCandidates) {
        try {
          const response = await api.get<TopologyResponse>(endpoint);
          if (isMounted) {
            setTopology(normalizeTopology(response.data));
          }
          return;
        } catch (err) {
          const apiErr = err as { response?: { status?: number } };
          if (apiErr?.response?.status && apiErr.response.status !== 404) {
            if (isMounted) {
              setError(
                "Impossible de charger la topologie de l'infrastructure.",
              );
            }
            return;
          }
        }
      }

      if (isMounted) {
        setTopology(buildFallbackTopology());
        setError(null);
      }
    };

    fetchTopology().finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return useMemo(
    () => ({ ...topology, isLoading, error }),
    [topology, isLoading, error],
  );
};
