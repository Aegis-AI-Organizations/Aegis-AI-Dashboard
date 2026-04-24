import React from "react";
import { LaunchpadForm } from "../components/LaunchpadForm";
import { useScans } from "../hooks/useScans";
import { ShieldAlert, ChevronRight, Clock, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { STATUS_DETAILS } from "../constants/scan";
import { useAuthStore } from "../store/AuthStore";

import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import { pageTitle, card, sectionTitle } from "styled-system/recipes";

export const Dashboard: React.FC = () => {
  const { scans, isLoading, error, refetch } = useScans();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const canScan = ["admin", "superadmin", "owner", "operateur"].includes(
    user?.role || "",
  );

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

  const handleScanClick = (scanId: string) => {
    navigate("/vulnerabilities", { state: { openScanId: scanId } });
  };

  return (
    <div className={css({ "& > * + *": { mt: "sectionGap" } })}>
      <div>
        <h1 className={pageTitle()}>Tableau de Bord Sécurité</h1>
        <p className={css({ color: "text.muted", fontSize: "lg" })}>
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
                Entrez l'image Docker cible pour démarrer l'analyse de
                vulnérabilités.
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
