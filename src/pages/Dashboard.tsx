import React from "react";
import { LaunchpadForm } from "../components/LaunchpadForm";
import { useScans } from "../hooks/useScans";
import { ShieldAlert, ChevronRight, Clock, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { STATUS_DETAILS } from "../constants/scan";
import { useAuthStore } from "../store/AuthStore";

import { css } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import { pageTitle, card } from "styled-system/recipes";

export const Dashboard: React.FC = () => {
  const { scans, isLoading, error, refetch } = useScans();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const canScan = ["admin", "superadmin", "owner", "operateur"].includes(
    user?.role || "",
  );

  // Take the top 3 most recent scans
  const recentScans = scans.slice(0, 3);

  const getStatusStyle = (status: string) => {
    const detail = STATUS_DETAILS[status] || STATUS_DETAILS.PENDING;
    const colorClass = detail.color.replace("text-", "");
    return `text-${colorClass} bg-${colorClass}/10 border-${colorClass}/20`;
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
    <div className={css({ minHeight: "calc(100vh - 8rem)" })}>
      <div className={css({ mb: "sectionGap" })}>
        <h1 className={pageTitle()}>Tableau de Bord Sécurité</h1>
        <p className={css({ color: "text.muted" })}>
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
            <div className={css({ mb: "4" })}>
              <h2
                className={css({
                  fontSize: "lg",
                  fontWeight: "bold",
                  color: "text.bright",
                  textTransform: "uppercase",
                  letterSpacing: "widest",
                  opacity: 0.8,
                })}
              >
                Nouvelle Analyse
              </h2>
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
            <h2
              className={css({
                fontSize: "lg",
                fontWeight: "bold",
                color: "text.bright",
                textTransform: "uppercase",
                letterSpacing: "widest",
                opacity: 0.8,
              })}
            >
              Derniers Pentests
            </h2>
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
                    h: "6",
                    w: "6",
                    borderBottom: "2px solid",
                    borderColor: "brand.primary",
                    mb: "3",
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
                  divideY: "1px",
                  divideColor: "whiteAlpha.100",
                })}
              >
                {recentScans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => handleScanClick(scan.id)}
                    className={css({
                      width: "full",
                      textAlign: "left",
                      p: "4",
                      transition: "colors",
                      display: "flex",
                      alignItems: "start",
                      gap: "4",
                      _hover: { bg: "whiteAlpha.50" },
                    })}
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
                          className={`${getStatusStyle(scan.status)} ${css({
                            px: "1.5",
                            py: "0.5",
                            borderRadius: "xs",
                            fontSize: "[9px]",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            letterSpacing: "wider",
                            border: "1px solid",
                          })}`}
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
                          truncate: true,
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
                            truncate: true,
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
