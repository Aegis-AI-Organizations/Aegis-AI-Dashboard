import React, { memo, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AlertTriangle, Box, Network, Server } from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import { pageSubtitle, pageTitle } from "styled-system/recipes";
import { api } from "../api/Axios";
import { useTopology, getNodeMatcher } from "../hooks/useTopology";
import { useTopologySSE } from "../hooks/useTopologySSE";
import type { TopologyGraphNode } from "../types/topology";
import type { Vulnerability } from "../types/vulnerability";

const nodeWidth = 250;
const hostColumnGap = 360;
const containerRowGap = 150;

interface FlowNodeData extends TopologyGraphNode {
  [key: string]: unknown;
}

const TopologyNode = memo(({ data }: NodeProps<Node<FlowNodeData>>) => {
  const Icon = data.kind === "host" ? Server : Box;

  return (
    <div
      className={cx(
        css({
          width: `${nodeWidth}px`,
          border: "1px solid",
          borderColor: data.vulnerable ? "red.400" : "whiteAlpha.200",
          borderRadius: "lg",
          bg: data.vulnerable
            ? "rgba(127, 29, 29, 0.82)"
            : "rgba(8, 13, 24, 0.92)",
          color: "text.main",
          boxShadow: data.vulnerable
            ? "0 0 26px rgba(248, 113, 113, 0.48)"
            : "0 12px 30px rgba(0, 0, 0, 0.26)",
          overflow: "hidden",
          transition:
            "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
        }),
        data.highlighted ? "topology-node-alert" : "",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className={css({ bg: data.vulnerable ? "red.300" : "brand.primary" })}
      />
      <div
        className={flex({
          align: "center",
          gap: "3",
          px: "4",
          py: "3",
          borderBottom: "1px solid",
          borderColor: "whiteAlpha.100",
        })}
      >
        <div
          className={flex({
            align: "center",
            justify: "center",
            w: "9",
            h: "9",
            borderRadius: "md",
            bg: data.vulnerable ? "red.400/20" : "brand.primary/10",
            color: data.vulnerable ? "red.100" : "brand.primary",
            flexShrink: 0,
          })}
        >
          <Icon size={18} />
        </div>
        <div className={css({ minW: "0", flex: "1" })}>
          <div
            className={css({
              fontWeight: "800",
              fontSize: "sm",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
            title={data.label}
          >
            {data.label}
          </div>
          <div
            className={css({
              color: data.vulnerable ? "red.100" : "text.muted",
              fontSize: "xs",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
            title={data.subtitle}
          >
            {data.kind === "host" ? "Host" : "Container"}
            {data.subtitle ? ` · ${data.subtitle}` : ""}
          </div>
        </div>
        {data.vulnerable && (
          <div
            className={flex({
              align: "center",
              justify: "center",
              w: "8",
              h: "8",
              borderRadius: "md",
              bg: "red.300/20",
              color: "red.100",
              flexShrink: 0,
            })}
            title={`${data.vulnerabilityCount} vulnérabilité(s) détectée(s)`}
          >
            <AlertTriangle size={16} />
          </div>
        )}
      </div>

      <div className={grid({ columns: 2, gap: "0", fontSize: "xs" })}>
        <div className={css({ px: "4", py: "3", color: "text.muted" })}>
          Ports
        </div>
        <div className={css({ px: "4", py: "3", textAlign: "right" })}>
          {data.ports.length || "-"}
        </div>
        <div
          className={css({
            px: "4",
            py: "3",
            color: "text.muted",
            borderTop: "1px solid",
            borderColor: "whiteAlpha.100",
          })}
        >
          Process
        </div>
        <div
          className={css({
            px: "4",
            py: "3",
            textAlign: "right",
            borderTop: "1px solid",
            borderColor: "whiteAlpha.100",
          })}
        >
          {data.processes.length || "-"}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className={css({ bg: data.vulnerable ? "red.300" : "brand.primary" })}
      />
    </div>
  );
});

TopologyNode.displayName = "TopologyNode";

const nodeTypes = {
  topology: TopologyNode,
};

const matchEventToNodes = (
  nodes: TopologyGraphNode[],
  eventTarget: string | undefined,
) => {
  if (!eventTarget) {
    return [];
  }

  const normalizedTarget = eventTarget.toLowerCase();

  return nodes
    .filter((node) =>
      getNodeMatcher(node).some(
        (alias) =>
          alias === normalizedTarget ||
          normalizedTarget.includes(alias) ||
          alias.includes(normalizedTarget),
      ),
    )
    .map((node) => node.id);
};

export const Topology: React.FC = () => {
  const { nodes, edges, isLoading, error } = useTopology();
  const lastVulnerability = useTopologySSE();
  const [vulnerableNodes, setVulnerableNodes] = useState<
    Record<string, number>
  >({});
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!lastVulnerability || nodes.length === 0) {
      return;
    }

    let timeout: number | undefined;
    let isCancelled = false;

    const flashNodes = (ids: string[]) => {
      const uniqueIds = [...new Set(ids)];
      if (uniqueIds.length === 0 || isCancelled) {
        return;
      }

      setHighlightedNodes((current) => new Set([...current, ...uniqueIds]));

      timeout = window.setTimeout(() => {
        setHighlightedNodes((current) => {
          const next = new Set(current);
          uniqueIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 4200);
    };

    const candidates = [
      lastVulnerability.nodeId,
      lastVulnerability.containerId,
      lastVulnerability.targetId,
      lastVulnerability.targetEndpoint,
    ];

    const enrichedEventMatches = candidates.flatMap((candidate) =>
      matchEventToNodes(nodes, candidate),
    );

    if (lastVulnerability.isVulnerabilityEvent) {
      const uniqueIds = [...new Set(enrichedEventMatches)];
      setVulnerableNodes((current) => {
        const next = { ...current };
        uniqueIds.forEach((id) => {
          next[id] = (next[id] || 0) + 1;
        });
        return next;
      });
      flashNodes(uniqueIds);
    }

    const shouldFetchScanVulnerabilities =
      lastVulnerability.scanId &&
      lastVulnerability.scanId !== "ping" &&
      lastVulnerability.status !== "HEARTBEAT";

    if (shouldFetchScanVulnerabilities) {
      api
        .get<Vulnerability[]>(
          `/scans/${lastVulnerability.scanId}/vulnerabilities`,
        )
        .then((response) => {
          if (isCancelled) {
            return;
          }

          const nextCounts: Record<string, number> = {};
          response.data.forEach((vulnerability) => {
            matchEventToNodes(nodes, vulnerability.target_endpoint).forEach(
              (nodeId) => {
                nextCounts[nodeId] = (nextCounts[nodeId] || 0) + 1;
              },
            );
          });

          const changedIds = Object.keys(nextCounts);
          setVulnerableNodes((current) => {
            const next = { ...current };
            Object.entries(nextCounts).forEach(([nodeId, count]) => {
              next[nodeId] = Math.max(next[nodeId] || 0, count);
            });
            return next;
          });
          flashNodes(changedIds);
        })
        .catch((err) => {
          console.error("Failed to refresh scan vulnerabilities:", err);
        });
    }

    return () => {
      isCancelled = true;
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [lastVulnerability, nodes]);

  useEffect(() => {
    setHighlightedNodes((current) => {
      const knownIds = new Set(nodes.map((node) => node.id));
      const next = new Set([...current].filter((id) => knownIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [nodes]);

  useEffect(() => {
    setVulnerableNodes((current) => {
      const knownIds = new Set(nodes.map((node) => node.id));
      const next = Object.fromEntries(
        Object.entries(current).filter(([id]) => knownIds.has(id)),
      );
      return Object.keys(next).length === Object.keys(current).length
        ? current
        : next;
    });
  }, [nodes]);

  const flowNodes = useMemo<Node<FlowNodeData>[]>(() => {
    const hostIndexes = new Map<string, number>();

    return nodes.map((node, index) => {
      const hostIndex =
        node.kind === "host"
          ? hostIndexes.set(node.id, hostIndexes.size).get(node.id) || 0
          : hostIndexes.get(node.hostId || "") ?? index;

      const siblingIndex =
        node.kind === "host"
          ? 0
          : nodes
              .filter(
                (candidate) =>
                  candidate.kind === "container" &&
                  candidate.hostId === node.hostId,
              )
              .findIndex((candidate) => candidate.id === node.id) + 1;

      return {
        id: node.id,
        type: "topology",
        position: {
          x: hostIndex * hostColumnGap,
          y: node.kind === "host" ? 0 : siblingIndex * containerRowGap,
        },
        data: {
          ...node,
          vulnerable: Boolean(vulnerableNodes[node.id]),
          highlighted: highlightedNodes.has(node.id),
          vulnerabilityCount: vulnerableNodes[node.id] || 0,
        },
      };
    });
  }, [highlightedNodes, nodes, vulnerableNodes]);

  const flowEdges = useMemo<Edge[]>(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated:
          Boolean(vulnerableNodes[edge.source]) ||
          Boolean(vulnerableNodes[edge.target]),
        style: {
          stroke:
            vulnerableNodes[edge.source] || vulnerableNodes[edge.target]
              ? "#f87171"
              : "#22d3ee",
          strokeWidth: 2,
        },
        labelStyle: { fill: "#94a3b8", fontSize: 11 },
      })),
    [edges, vulnerableNodes],
  );

  return (
    <div
      className={css({
        display: "flex",
        flexDir: "column",
        gap: "6",
        minH: "0",
      })}
    >
      <div
        className={flex({
          align: { base: "flex-start", md: "center" },
          justify: "space-between",
          gap: "4",
          flexDir: { base: "column", md: "row" },
        })}
      >
        <div>
          <h1 className={pageTitle()}>Topologie</h1>
          <p className={pageSubtitle()}>
            Carte interactive des hosts, conteneurs et connexions réseau
            détectés.
          </p>
        </div>
        <div
          className={flex({
            align: "center",
            gap: "2",
            px: "3",
            py: "2",
            borderRadius: "md",
            bg: "whiteAlpha.50",
            color: lastVulnerability ? "red.200" : "text.muted",
            fontSize: "sm",
          })}
        >
          <Network size={16} />
          {lastVulnerability
            ? "Flux SSE actif · alerte reçue"
            : "Flux SSE actif"}
        </div>
      </div>

      <div
        className={css({
          position: "relative",
          h: { base: "68vh", md: "calc(100vh - 220px)" },
          minH: "520px",
          border: "1px solid",
          borderColor: "whiteAlpha.100",
          borderRadius: "lg",
          overflow: "hidden",
          bg: "rgba(5, 8, 16, 0.7)",
        })}
      >
        {isLoading && (
          <div
            className={flex({
              align: "center",
              justify: "center",
              h: "full",
              color: "text.muted",
            })}
          >
            Chargement de la topologie...
          </div>
        )}

        {!isLoading && error && (
          <div
            className={flex({
              align: "center",
              justify: "center",
              h: "full",
              color: "red.200",
              textAlign: "center",
              px: "6",
            })}
          >
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.25}
            maxZoom={1.8}
            panOnDrag
            nodesDraggable
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#1e293b" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(node) =>
                (node.data as FlowNodeData).vulnerable ? "#ef4444" : "#06b6d4"
              }
              maskColor="rgba(2, 6, 23, 0.72)"
              pannable
              zoomable
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};
