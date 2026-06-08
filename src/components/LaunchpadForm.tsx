import React, { useState } from "react";
import {
  AlertCircle,
  Box,
  CheckSquare,
  Loader2,
  Play,
  Server,
  Square,
} from "lucide-react";
import { useCreateScan } from "../hooks/useCreateScan";
import { formatTopologyPort, useTopology } from "../hooks/useTopology";
import { ScanProgressTracker } from "./ScanProgressTracker";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { button as buttonRecipe } from "styled-system/recipes";

interface LaunchpadFormProps {
  onScanUpdate?: () => void;
}

export const LaunchpadForm: React.FC<LaunchpadFormProps> = ({
  onScanUpdate,
}) => {
  const [selectedTargetIds, setSelectedTargetIds] = useState<Set<string>>(
    new Set(),
  );
  const [activeTargetLabel, setActiveTargetLabel] = useState("Topologie");
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<string>("PENDING");

  const { createScan, isLoading, error } = useCreateScan();
  const {
    nodes,
    isLoading: isTopologyLoading,
    error: topologyError,
  } = useTopology();

  const hosts = nodes.filter((node) => node.kind === "host");
  const containers = nodes.filter((node) => node.kind === "container");
  const selectedCount = selectedTargetIds.size;
  const canSubmit = !isLoading && !isTopologyLoading && containers.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNodeIds = [...selectedTargetIds];
    const targetLabel = targetNodeIds.length
      ? `${targetNodeIds.length} cible(s) selectionnee(s)`
      : "Topologie complete";
    const data = await createScan({ targetNodeIds, targetLabel });

    if (data) {
      setActiveTargetLabel(targetLabel);
      setActiveScanId(data.scan_id);
      setInitialStatus(data.status || "PENDING");
      onScanUpdate?.();
    }
  };

  const handleReset = () => {
    setActiveScanId(null);
    setSelectedTargetIds(new Set());
    setActiveTargetLabel("Topologie");
    setInitialStatus("PENDING");
  };

  const toggleTarget = (targetId: string) => {
    setSelectedTargetIds((current) => {
      const next = new Set(current);
      if (next.has(targetId)) {
        next.delete(targetId);
      } else {
        next.add(targetId);
      }
      return next;
    });
  };

  const selectAllTargets = () => {
    setSelectedTargetIds(new Set(containers.map((node) => node.id)));
  };

  const clearTargets = () => {
    setSelectedTargetIds(new Set());
  };

  if (activeScanId) {
    return (
      <ScanProgressTracker
        scanId={activeScanId}
        targetImage={activeTargetLabel}
        initialStatus={initialStatus}
        onReset={handleReset}
        onScanUpdate={onScanUpdate}
      />
    );
  }

  return (
    <div
      className={css({ width: "full", fontFamily: "sans", color: "text.main" })}
    >
      <form onSubmit={handleSubmit} className={css({ spaceY: "5" })}>
        <div
          className={css({
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            borderRadius: "lg",
            overflow: "hidden",
            bg: "whiteAlpha.50",
          })}
        >
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "3",
              px: "4",
              py: "3",
              borderBottom: "1px solid",
              borderColor: "whiteAlpha.100",
            })}
          >
            <div>
              <p
                className={css({
                  color: "text.bright",
                  fontSize: "sm",
                  fontWeight: "bold",
                })}
              >
                Topologie detectee
              </p>
              <p
                className={css({
                  color: "text.muted",
                  fontSize: "xs",
                  mt: "0.5",
                })}
              >
                {hosts.length} host(s), {containers.length} container(s)
              </p>
            </div>
            <div className={flex({ align: "center", gap: "2" })}>
              <button
                type="button"
                onClick={selectAllTargets}
                disabled={isLoading || containers.length === 0}
                className={css({
                  color: "brand.primary",
                  fontSize: "xs",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _disabled: { opacity: 0.5, cursor: "not-allowed" },
                })}
              >
                Tout cibler
              </button>
              <button
                type="button"
                onClick={clearTargets}
                disabled={isLoading || selectedCount === 0}
                className={css({
                  color: "text.muted",
                  fontSize: "xs",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _disabled: { opacity: 0.5, cursor: "not-allowed" },
                })}
              >
                Vider
              </button>
            </div>
          </div>

          <div className={css({ maxH: "80", overflowY: "auto" })}>
            {isTopologyLoading ? (
              <div
                className={flex({
                  align: "center",
                  justify: "center",
                  gap: "2",
                  p: "5",
                  color: "text.muted",
                  fontSize: "sm",
                })}
              >
                <Loader2
                  className={css({ w: "4", h: "4", animation: "spin" })}
                />
                Chargement de la topologie...
              </div>
            ) : topologyError ? (
              <div
                className={css({
                  p: "4",
                  color: "red.300",
                  fontSize: "sm",
                })}
              >
                {topologyError}
              </div>
            ) : containers.length === 0 ? (
              <div
                className={css({
                  p: "4",
                  color: "text.muted",
                  fontSize: "sm",
                })}
              >
                Aucune cible exploitable n'a encore ete remontee par les
                agents.
              </div>
            ) : (
              containers.map((node) => {
                const selected = selectedTargetIds.has(node.id);
                const host = hosts.find((item) => item.id === node.hostId);
                const ports = [...node.exposedPorts, ...node.ports]
                  .map(formatTopologyPort)
                  .filter(Boolean)
                  .slice(0, 3);

                return (
                  <button
                    type="button"
                    key={node.id}
                    onClick={() => toggleTarget(node.id)}
                    disabled={isLoading}
                    className={css({
                      width: "full",
                      display: "flex",
                      alignItems: "start",
                      gap: "3",
                      px: "4",
                      py: "3",
                      textAlign: "left",
                      borderBottom: "1px solid",
                      borderColor: "whiteAlpha.100",
                      bg: selected ? "brand.primary/10" : "transparent",
                      cursor: "pointer",
                      transition: "background",
                      _hover: { bg: "whiteAlpha.100" },
                      _disabled: { opacity: 0.6, cursor: "not-allowed" },
                    })}
                  >
                    <span
                      className={css({
                        color: selected ? "brand.primary" : "text.muted",
                        mt: "0.5",
                        flexShrink: 0,
                      })}
                    >
                      {selected ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </span>
                    <span
                      className={flex({
                        align: "center",
                        justify: "center",
                        w: "9",
                        h: "9",
                        borderRadius: "md",
                        bg: "cyan.400/10",
                        color: "cyan.300",
                        flexShrink: 0,
                      })}
                    >
                      <Box size={17} />
                    </span>
                    <span className={css({ flex: 1, minW: 0 })}>
                      <span
                        className={css({
                          display: "block",
                          color: "text.bright",
                          fontSize: "sm",
                          fontWeight: "bold",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        })}
                      >
                        {node.label}
                      </span>
                      <span
                        className={css({
                          display: "block",
                          color: "text.muted",
                          fontSize: "xs",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          mt: "0.5",
                        })}
                      >
                        {node.image || node.subtitle || "Image inconnue"}
                      </span>
                      <span
                        className={flex({
                          align: "center",
                          gap: "2",
                          color: "gray.500",
                          fontSize: "[11px]",
                          mt: "1.5",
                        })}
                      >
                        {host && (
                          <>
                            <Server size={12} />
                            <span>{host.label}</span>
                          </>
                        )}
                        {ports.length > 0 && <span>{ports.join(", ")}</span>}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <p
          className={css({
            fontSize: "sm",
            color: "text.muted",
            lineHeight: "relaxed",
          })}
        >
          {selectedCount > 0
            ? `${selectedCount} cible(s) seront clonees et testees.`
            : "Aucune cible selectionnee: le scan utilisera toute la topologie disponible."}
        </p>

        {error && (
          <div
            className={flex({
              align: "start",
              bg: "red.500/10",
              border: "1px solid",
              borderColor: "red.500/20",
              borderRadius: "lg",
              p: "3",
              color: "red.500",
              fontSize: "sm",
            })}
          >
            <AlertCircle
              className={css({
                w: "5",
                h: "5",
                mr: "2",
                flexShrink: 0,
                mt: "0.5",
              })}
            />
            <p className={css({ lineHeight: "tight" })}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={buttonRecipe({ variant: "primary", size: "lg" })}
          style={{ width: "100%" }}
        >
          {isLoading ? (
            <Loader2
              data-testid="loading-spinner"
              className={css({ w: "5", h: "5", animation: "spin", mr: "2" })}
            />
          ) : (
            <Play
              className={css({ w: "5", h: "5", mr: "2", fill: "current" })}
            />
          )}
          {isLoading ? "Lancement..." : "Lancer le Scan"}
        </button>
      </form>
    </div>
  );
};
