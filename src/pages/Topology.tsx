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
import {
  AlertTriangle,
  Box,
  Building2,
  Network,
  RefreshCw,
  Server,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import {
  button as buttonRecipe,
  pageSubtitle,
  pageTitle,
} from "styled-system/recipes";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";
import { useTopology, getNodeMatcher } from "../hooks/useTopology";
import { useTopologySSE } from "../hooks/useTopologySSE";
import { useCompanies } from "../hooks/useCompanies";
import type { Company } from "../hooks/useCompanies";
import type { TopologyGraphNode } from "../types/topology";
import type { Vulnerability } from "../types/vulnerability";

const nodeWidth = 250;
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
  const { user } = useAuthStore();
  const isInternalViewer = ["superadmin", "admin"].includes(user?.role || "");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompanyId = searchParams.get("company_id")?.trim() || "";
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    initialCompanyId || user?.company_id || "",
  );
  const {
    companies,
    isLoading: isCompaniesLoading,
    error: companiesError,
  } = useCompanies(companySearch);
  const fallbackSelectedCompany = useMemo<Company | null>(() => {
    if (!selectedCompanyId) {
      return null;
    }

    return (
      companies.find((company) => company.id === selectedCompanyId) ?? {
        id: selectedCompanyId,
        name: selectedCompanyId,
        owner_email: "",
      }
    );
  }, [companies, selectedCompanyId]);
  const selectedCompany = useMemo(
    () => fallbackSelectedCompany,
    [fallbackSelectedCompany],
  );
  const companyOptions = useMemo(() => {
    if (!selectedCompany) {
      return companies;
    }

    if (companies.some((company) => company.id === selectedCompany.id)) {
      return companies;
    }

    return [selectedCompany, ...companies];
  }, [companies, selectedCompany]);
  const effectiveCompanyId = isInternalViewer
    ? selectedCompanyId || user?.company_id || undefined
    : undefined;
  const { nodes, edges, isLoading, error } = useTopology(effectiveCompanyId);
  const lastVulnerability = useTopologySSE();
  const [vulnerableNodes, setVulnerableNodes] = useState<
    Record<string, number>
  >({});
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!isInternalViewer) {
      setSelectedCompanyId(user.company_id);
      return;
    }

    if (initialCompanyId) {
      setSelectedCompanyId(initialCompanyId);
      return;
    }

    if (!selectedCompanyId) {
      setSelectedCompanyId(user.company_id);
    }
  }, [initialCompanyId, isInternalViewer, selectedCompanyId, user]);

  useEffect(() => {
    if (!isInternalViewer || !selectedCompanyId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("company_id", selectedCompanyId);
    if (searchParams.get("company_id") !== selectedCompanyId) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [isInternalViewer, searchParams, selectedCompanyId, setSearchParams]);

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
    const hostOrder = nodes.filter((node) => node.kind === "host");
    const hostIndexes = new Map(
      hostOrder.map((host, index) => [host.id, index] as const),
    );
    const containersByHost = new Map<string, TopologyGraphNode[]>();

    nodes
      .filter((node) => node.kind === "container" && node.hostId)
      .forEach((node) => {
        const hostId = node.hostId!;
        const current = containersByHost.get(hostId) || [];
        current.push(node);
        containersByHost.set(hostId, current);
      });

    return nodes.map((node, index) => {
      const hostIndex =
        node.kind === "host"
          ? hostIndexes.get(node.id) ?? 0
          : hostIndexes.get(node.hostId || "") ?? index;

      const siblingIndex =
        node.kind === "host"
          ? 0
          : containersByHost
              .get(node.hostId || "")
              ?.findIndex((candidate) => candidate.id === node.id) ?? 0;

      const clusterX = hostIndex * 560;
      const hostX = clusterX + 140;
      const containerX = clusterX + (siblingIndex % 2) * 280;
      const containerY = 220 + Math.floor(siblingIndex / 2) * 170;

      return {
        id: node.id,
        type: "topology",
        position: {
          x: node.kind === "host" ? hostX : containerX,
          y: node.kind === "host" ? 0 : containerY,
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

      {isInternalViewer && (
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: { base: "1fr", lg: "minmax(0, 420px) auto" },
            gap: "4",
            alignItems: "end",
          })}
        >
          <div
            className={css({
              display: "grid",
              gap: "3",
              p: "4",
              borderRadius: "lg",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              bg: "whiteAlpha.50",
            })}
          >
            <div
              className={flex({
                align: "center",
                gap: "2",
                color: "text.muted",
                fontSize: "sm",
              })}
            >
              <Building2 size={16} />
              Entreprise consultée
            </div>
            <input
              type="search"
              value={companySearch}
              onChange={(event) => setCompanySearch(event.target.value)}
              placeholder="Rechercher une entreprise..."
              className={css({
                width: "100%",
                bg: "blackAlpha.300",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                color: "white",
                borderRadius: "md",
                px: "3",
                py: "2.5",
                outline: "none",
                _focusVisible: {
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px var(--colors-brand-primary)",
                },
              })}
            />
            <select
              value={selectedCompanyId}
              onChange={(event) => setSelectedCompanyId(event.target.value)}
              className={css({
                width: "100%",
                bg: "blackAlpha.300",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                color: "white",
                borderRadius: "md",
                px: "3",
                py: "2.5",
                outline: "none",
                _focusVisible: {
                  borderColor: "brand.primary",
                  boxShadow: "0 0 0 1px var(--colors-brand-primary)",
                },
              })}
            >
              {!selectedCompanyId && (
                <option value="">Sélectionner une entreprise</option>
              )}
              {companyOptions.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <div
              className={css({
                color: "text.muted",
                fontSize: "sm",
              })}
            >
              {selectedCompany?.name
                ? `Entreprise active: ${selectedCompany.name}`
                : selectedCompanyId
                  ? `Entreprise active: ${selectedCompanyId}`
                  : "Aucune entreprise sélectionnée"}
            </div>
            {isCompaniesLoading && (
              <div className={css({ color: "text.muted", fontSize: "sm" })}>
                Chargement des entreprises...
              </div>
            )}
            {companiesError && (
              <div className={css({ color: "red.200", fontSize: "sm" })}>
                {companiesError}
              </div>
            )}
          </div>
          <div
            className={flex({
              gap: "3",
              flexWrap: "wrap",
              justify: { base: "flex-start", lg: "flex-end" },
            })}
          >
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={buttonRecipe({ variant: "secondary" })}
            >
              <RefreshCw className={css({ w: "4", h: "4", mr: "2" })} />
              Rafraîchir
            </button>
          </div>
        </div>
      )}

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
        {!isLoading && !error && nodes.length === 0 && (
          <div
            className={flex({
              align: "center",
              justify: "center",
              direction: "column",
              gap: "2",
              h: "full",
              color: "text.muted",
              textAlign: "center",
              px: "6",
            })}
          >
            <div className={css({ fontWeight: "700", color: "text.main" })}>
              Aucune topologie détectée pour cette entreprise.
            </div>
            <div className={css({ maxW: "lg" })}>
              Lancez un scan ou changez d&apos;entreprise pour afficher les
              hosts, conteneurs et connexions détectés.
            </div>
          </div>
        )}

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
