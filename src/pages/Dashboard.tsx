import React from "react";
import { LaunchpadForm } from "../components/LaunchpadForm";
import { useAgentStatus } from "../hooks/useAgentStatus";
import { useScans } from "../hooks/useScans";
import {
  Activity,
  Box,
  ChevronRight,
  Clock,
  ExternalLink,
  RadioTower,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { STATUS_DETAILS } from "../constants/scan";
import { config } from "../config";
import { useAuthStore } from "../store/AuthStore";

import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import {
  pageTitle,
  pageSubtitle,
  card,
  sectionTitle,
} from "styled-system/recipes";

export const Dashboard: React.FC = () => {
  const { scans, isLoading, error, refetch } = useScans();
  const {
    summary: agentSummary,
    isLoading: isAgentStatusLoading,
    error: agentStatusError,
  } = useAgentStatus();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const canScan = ["admin", "superadmin", "owner", "operateur"].includes(
    user?.role || "",
  );
  const agentInstallDocsUrl = `${config.docsBaseUrl.replace(
    /\/$/,
    "",
  )}/docs/Agent/install-infrastructure`;

  // Take the top 3 most recent scans
  const recentScans = scans.slice(0, 3);

  const getStatusColor = (status: string) => {
    if (status === "COMPLETED") return "cyan.400";
    if (status === "RUNNING") return "purple.400";
    if (status === "FAILED") return "red.400";
    return "text.muted";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date inconnue";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const formatAgentLastSeen = (dateString?: string | null) => {
    if (!dateString) return "Aucune remontee";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const handleScanClick = (scanId: string) => {
    navigate("/vulnerabilities", { state: { openScanId: scanId } });
  };

  return (
    <div className={css({ "& > * + *": { mt: "sectionGap" } })}>
      <div>
        <h1 className={pageTitle()}>Tableau de Bord Sécurité</h1>
        <p className={pageSubtitle()}>
          Aperçu complet de votre posture de sécurité et des opérations de
          pentest.
        </p>
      </div>

      <div
        className={grid({
          columns: { base: 1, lg: 2 },
          gap: "8",
          alignItems: "start",
        })}
      >
        <div className={css({ width: "full", maxWidth: "xl" })}>
          <div className={css({ mb: "2" })}>
            <h2 className={sectionTitle()}>Etat des agents</h2>
          </div>

          <div className={card()}>
            {isAgentStatusLoading ? (
              <div
                className={flex({
                  align: "center",
                  justify: "center",
                  minH: "32",
                  color: "text.muted",
                  fontSize: "sm",
                })}
              >
                Chargement des agents...
              </div>
            ) : agentStatusError ? (
              <div
                className={css({
                  color: "red.400/80",
                  fontSize: "sm",
                  textAlign: "center",
                  py: "8",
                })}
              >
                Impossible de charger l'etat des agents.
              </div>
            ) : (
              <div className={css({ "& > * + *": { mt: "6" } })}>
                <div
                  className={flex({
                    align: "center",
                    justify: "space-between",
                    gap: "4",
                  })}
                >
                  <div>
                    <p
                      className={css({
                        color: "text.muted",
                        fontSize: "xs",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      })}
                    >
                      Agents deployes
                    </p>
                    <p
                      className={css({
                        color: "text.bright",
                        fontSize: "4xl",
                        fontWeight: "black",
                        lineHeight: "1",
                        mt: "2",
                      })}
                    >
                      {agentSummary.total_agents}
                    </p>
                  </div>
                  <div
                    className={css({
                      p: "3",
                      borderRadius: "lg",
                      bg: "cyan.500/10",
                      border: "1px solid",
                      borderColor: "cyan.400/20",
                    })}
                  >
                    <RadioTower
                      className={css({ w: "6", h: "6", color: "cyan.300" })}
                    />
                  </div>
                </div>

                {agentSummary.total_agents === 0 && (
                  <div
                    className={css({
                      border: "1px solid",
                      borderColor: "cyan.400/20",
                      bg: "cyan.400/5",
                      borderRadius: "md",
                      p: "4",
                    })}
                  >
                    <div
                      className={flex({
                        align: { base: "stretch", sm: "center" },
                        justify: "space-between",
                        gap: "4",
                        flexDir: { base: "column", sm: "row" },
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
                          Aucun agent connecté
                        </p>
                        <p
                          className={css({
                            color: "text.muted",
                            fontSize: "xs",
                            mt: "1",
                          })}
                        >
                          Installez une sonde pour remonter les heartbeats.
                        </p>
                      </div>
                      <a
                        href={agentInstallDocsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={css({
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "2",
                          px: "3",
                          py: "2",
                          minH: "10",
                          borderRadius: "md",
                          bg: "brand.primary",
                          color: "white",
                          fontSize: "sm",
                          fontWeight: "bold",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          textDecoration: "none",
                          transition: "colors",
                          _hover: { bg: "brand.accent" },
                        })}
                      >
                        Déployer son premier agent
                        <ExternalLink
                          aria-hidden="true"
                          className={css({ w: "4", h: "4" })}
                        />
                      </a>
                    </div>
                  </div>
                )}

                <div
                  className={grid({
                    columns: 2,
                    gap: "3",
                  })}
                >
                  <div
                    className={css({
                      border: "1px solid",
                      borderColor: "emerald.400/20",
                      bg: "emerald.400/5",
                      borderRadius: "md",
                      p: "4",
                    })}
                  >
                    <div className={flex({ align: "center", gap: "2" })}>
                      <Activity
                        className={css({
                          w: "4",
                          h: "4",
                          color: "emerald.300",
                        })}
                      />
                      <span
                        className={css({
                          color: "text.muted",
                          fontSize: "xs",
                          fontWeight: "bold",
                        })}
                      >
                        Actifs
                      </span>
                    </div>
                    <p
                      className={css({
                        color: "emerald.300",
                        fontSize: "2xl",
                        fontWeight: "black",
                        mt: "2",
                      })}
                    >
                      {agentSummary.active_agents}
                    </p>
                  </div>

                  <div
                    className={css({
                      border: "1px solid",
                      borderColor: "orange.400/20",
                      bg: "orange.400/5",
                      borderRadius: "md",
                      p: "4",
                    })}
                  >
                    <div className={flex({ align: "center", gap: "2" })}>
                      <WifiOff
                        className={css({
                          w: "4",
                          h: "4",
                          color: "orange.300",
                        })}
                      />
                      <span
                        className={css({
                          color: "text.muted",
                          fontSize: "xs",
                          fontWeight: "bold",
                        })}
                      >
                        Inactifs
                      </span>
                    </div>
                    <p
                      className={css({
                        color: "orange.300",
                        fontSize: "2xl",
                        fontWeight: "black",
                        mt: "2",
                      })}
                    >
                      {agentSummary.inactive_agents}
                    </p>
                  </div>
                </div>

                <div
                  className={flex({
                    align: "center",
                    justify: "space-between",
                    gap: "3",
                    color: "text.muted",
                    fontSize: "xs",
                    borderTop: "1px solid",
                    borderColor: "whiteAlpha.100",
                    pt: "4",
                  })}
                >
                  <span>Derniere remontee</span>
                  <span
                    className={css({
                      color: "text.bright",
                      fontWeight: "semibold",
                      textAlign: "right",
                    })}
                  >
                    {formatAgentLastSeen(agentSummary.last_seen)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Launchpad Form on the left/top - Only for roles with scan permission */}
        {canScan && (
          <div className={css({ width: "full", maxWidth: "xl" })}>
            <div className={css({ mb: "2" })}>
              <h2 className={sectionTitle()}>Nouvelle Analyse</h2>
            </div>

            <div className={card()}>
              <p
                className={css({
                  fontSize: "sm",
                  color: "text.muted",
                  mb: "6",
                })}
              >
                Sélectionnez les composants remontés par les agents, ou lancez
                un pentest sur toute la topologie disponible.
              </p>
              <LaunchpadForm onScanUpdate={refetch} />
            </div>
          </div>
        )}

        {/* Recent Scans Widget on the right/bottom */}
        <div
          className={css({ width: "full", maxWidth: { xl: "2xl", lg: "xl" } })}
        >
          <div
            className={flex({
              mb: "4",
              alignItems: "center",
              justify: "space-between",
            })}
          >
            <h2 className={sectionTitle()}>Derniers Pentests</h2>
            <button
              onClick={() => navigate("/vulnerabilities")}
              className={css({
                fontSize: "xs",
                color: "brand.primary",
                fontWeight: "medium",
                transition: "colors",
                cursor: "pointer",
                _hover: { color: "brand.accent", textDecoration: "underline" },
                display: "flex",
                alignItems: "center",
              })}
            >
              Voir tout l'historique
              <ChevronRight className={css({ w: "3.5", h: "3.5", ml: "1" })} />
            </button>
          </div>

          <div className={card({ p: "0" })}>
            {isLoading ? (
              <div
                className={flex({
                  flexDir: "column",
                  align: "center",
                  justify: "center",
                  p: "8",
                })}
              >
                <div
                  className={css({
                    animation: "spin",
                    borderRadius: "full",
                    h: "8",
                    w: "8",
                    borderTop: "2px solid",
                    borderRight: "2px solid",
                    borderColor: "brand.primary",
                    borderLeft: "2px solid",
                    borderLeftColor: "transparent",
                    mb: "4",
                  })}
                ></div>
                <p className={css({ fontSize: "sm", color: "gray.500" })}>
                  Chargement...
                </p>
              </div>
            ) : error ? (
              <div
                className={css({
                  p: "6",
                  textAlign: "center",
                  fontSize: "sm",
                  color: "red.400/80",
                })}
              >
                Impossible de charger les derniers scans.
              </div>
            ) : recentScans.length === 0 ? (
              <div
                className={flex({
                  flexDir: "column",
                  align: "center",
                  justify: "center",
                  p: "8",
                  textAlign: "center",
                })}
              >
                <ShieldAlert
                  className={css({
                    w: "10",
                    h: "10",
                    color: "gray.600",
                    mb: "3",
                  })}
                />
                <p className={css({ fontSize: "sm", color: "text.muted" })}>
                  Aucun scan récent trouvé.
                </p>
                <p
                  className={css({
                    fontSize: "xs",
                    color: "gray.500",
                    mt: "1",
                  })}
                >
                  Lancez une analyse depuis le formulaire.
                </p>
              </div>
            ) : (
              <div
                className={css({
                  "& > button + button": {
                    borderTop: "1px solid",
                    borderColor: "whiteAlpha.100",
                  },
                })}
              >
                {recentScans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => handleScanClick(scan.id)}
                    className={cx(
                      "group",
                      css({
                        width: "full",
                        textAlign: "left",
                        p: "4",
                        transition: "colors",
                        display: "flex",
                        alignItems: "start",
                        gap: "4",
                        _hover: { bg: "whiteAlpha.50" },
                      }),
                    )}
                  >
                    <div
                      className={css({
                        flexShrink: 0,
                        bg: "whiteAlpha.100",
                        p: "2",
                        borderRadius: "lg",
                        border: "1px solid",
                        borderColor: "whiteAlpha.100",
                        mt: "0.5",
                      })}
                    >
                      <Box
                        className={css({ w: "4", h: "4", color: "text.muted" })}
                      />
                    </div>
                    <div className={css({ flex: 1, minWidth: 0 })}>
                      <div
                        className={flex({
                          align: "center",
                          justify: "space-between",
                          mb: "1",
                        })}
                      >
                        <span
                          className={css({
                            px: "2.5",
                            py: "1",
                            borderRadius: "full",
                            fontSize: "[10px]",
                            fontWeight: "black",
                            textTransform: "uppercase",
                            letterSpacing: "widest",
                            border: "1px solid",
                            borderColor: `${getStatusColor(scan.status)}/20`,
                            bg: `${getStatusColor(scan.status)}/10`,
                            color: getStatusColor(scan.status),
                          })}
                        >
                          {STATUS_DETAILS[scan.status]?.label || scan.status}
                        </span>
                        <div
                          className={flex({
                            align: "center",
                            fontSize: "[10px]",
                            color: "gray.500",
                          })}
                        >
                          <Clock className={css({ w: "3", h: "3", mr: "1" })} />
                          {formatDate(scan.started_at)}
                        </div>
                      </div>
                      <p
                        className={css({
                          fontSize: "sm",
                          fontWeight: "medium",
                          color: "text.bright",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          mb: "0.5",
                        })}
                      >
                        {scan.target_image}
                      </p>
                      <div className={flex({ align: "center", gap: "2" })}>
                        <p
                          className={css({
                            fontFamily: "mono",
                            fontSize: "[10px]",
                            color: "gray.500",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                          })}
                        >
                          ID: {scan.id.split("-")[0]}...
                        </p>
                        {scan.company_name && (
                          <span
                            className={css({
                              fontSize: "[10px]",
                              color: "brand.accent",
                              fontWeight: "black",
                              textTransform: "uppercase",
                              letterSpacing: "tighter",
                            })}
                          >
                            • {scan.company_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={css({
                        w: "4",
                        h: "4",
                        color: "gray.600",
                        alignSelf: "center",
                        transition: "all",
                        _groupHover: {
                          color: "brand.primary",
                          transform: "translateX(4px)",
                        },
                      })}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
