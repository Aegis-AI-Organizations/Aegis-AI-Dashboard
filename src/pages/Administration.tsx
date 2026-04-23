import React, { useState, useEffect } from "react";
import { Building2, UserPlus, History, Info, User } from "lucide-react";
import { api } from "../api/Axios";

interface AuditLog {
  id: string;
  user_id: string;
  company_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string; // JSON string
  ip_address: string;
  timestamp: string;
}

export const parseDetails = (detailsStr: string) => {
  try {
    return JSON.parse(detailsStr);
  } catch (e) {
    return detailsStr;
  }
};

export const getActionColor = (action: string) => {
  if (action.includes("CREATE")) return "emerald.400";
  if (action.includes("START")) return "cyan.400";
  if (action.includes("STOP") || action.includes("DELETE")) return "red.400";
  return "text.muted";
};

import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";
import {
  pageTitle,
  card,
  sectionTitle,
  button as buttonRecipe,
} from "styled-system/recipes";

export const Administration: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/audit-logs?limit=${limit}&offset=${offset}`,
      );
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [offset]);

  return (
    <div
      className={css({
        maxWidth: "7xl",
        mx: "auto",
        spaceY: "sectionGap",
        pb: "20",
      })}
    >
      {/* Header */}
      <div
        className={flex({
          flexDir: { base: "column", md: "row" },
          justify: "space-between",
          align: { base: "start", md: "end" },
          gap: "8",
        })}
      >
        <div className={css({ spaceY: "3" })}>
          <h1 className={pageTitle()}>Administration</h1>
          <p
            className={css({
              color: "text.muted",
              fontWeight: "bold",
              fontSize: "lg",
              maxWidth: "xl",
              lineHeight: "relaxed",
            })}
          >
            Centre de contrôle global du système. Gérez les entités et
            surveillez les actions critiques via l'Audit Trail.
          </p>
        </div>

        <div className={flex({ flexWrap: "wrap", gap: "4" })}>
          <button
            onClick={() => (window.location.href = "/users?action=new-user")}
            className={buttonRecipe({ variant: "secondary" })}
          >
            <UserPlus className={css({ w: "4", h: "4" })} />
            Nouveau Collaborateur
          </button>
          <button
            onClick={() => (window.location.href = "/users?action=new-company")}
            className={buttonRecipe({ variant: "primary" })}
          >
            <Building2 className={css({ w: "4", h: "4" })} />
            Nouvelle Entreprise
          </button>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className={css({ spaceY: "6" })}>
        <div className={flex({ align: "center", justify: "space-between" })}>
          <h2 className={sectionTitle()}>
            <History className={css({ w: "4", h: "4" })} /> Journal d'Audit
            (Audit Trail)
          </h2>
          <div
            className={flex({
              align: "center",
              gap: "4",
              fontSize: "xs",
              fontWeight: "bold",
              color: "gray.600",
            })}
          >
            <span>Total: {total} logs</span>
            <div className={flex({ align: "center", gap: "2" })}>
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className={css({
                  p: "2",
                  _hover: { color: "white" },
                  _disabled: { opacity: 0.3 },
                  transition: "colors",
                })}
              >
                Précédent
              </button>
              <span className={css({ color: "gray.400" })}>
                {Math.floor(offset / limit) + 1} /{" "}
                {Math.ceil(total / limit) || 1}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className={css({
                  p: "2",
                  _hover: { color: "white" },
                  _disabled: { opacity: 0.3 },
                  transition: "colors",
                })}
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        <div
          className={cx(
            card({ p: "0" }),
            css({ overflow: "hidden", borderRadius: "[2.5rem]" }),
          )}
        >
          <div className={css({ overflowX: "auto" })}>
            <table className={css({ width: "full", textAlign: "left" })}>
              <thead>
                <tr
                  className={css({
                    borderBottom: "1px solid",
                    borderColor: "whiteAlpha.100",
                    bg: "whiteAlpha.50",
                  })}
                >
                  <th
                    className={css({
                      px: "8",
                      py: "5",
                      fontSize: "[10px]",
                      fontWeight: "black",
                      color: "gray.500",
                      textTransform: "uppercase",
                      letterSpacing: "widest",
                    })}
                  >
                    Date & Heure
                  </th>
                  <th
                    className={css({
                      px: "8",
                      py: "5",
                      fontSize: "[10px]",
                      fontWeight: "black",
                      color: "gray.500",
                      textTransform: "uppercase",
                      letterSpacing: "widest",
                    })}
                  >
                    Acteur
                  </th>
                  <th
                    className={css({
                      px: "8",
                      py: "5",
                      fontSize: "[10px]",
                      fontWeight: "black",
                      color: "gray.500",
                      textTransform: "uppercase",
                      letterSpacing: "widest",
                    })}
                  >
                    Action
                  </th>
                  <th
                    className={css({
                      px: "8",
                      py: "5",
                      fontSize: "[10px]",
                      fontWeight: "black",
                      color: "gray.500",
                      textTransform: "uppercase",
                      letterSpacing: "widest",
                    })}
                  >
                    Cible
                  </th>
                  <th
                    className={css({
                      px: "8",
                      py: "5",
                      fontSize: "[10px]",
                      fontWeight: "black",
                      color: "gray.500",
                      textTransform: "uppercase",
                      letterSpacing: "widest",
                    })}
                  >
                    IP Address
                  </th>
                  <th
                    className={css({
                      px: "8",
                      py: "5",
                      fontSize: "[10px]",
                      fontWeight: "black",
                      color: "gray.500",
                      textTransform: "uppercase",
                      letterSpacing: "widest",
                      textAlign: "right",
                    })}
                  >
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody
                className={css({
                  divideY: "1px",
                  divideColor: "whiteAlpha.100",
                })}
              >
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className={css({ animation: "pulse" })}>
                      <td
                        colSpan={6}
                        className={css({
                          px: "8",
                          py: "6",
                          h: "16",
                          bg: "whiteAlpha.50",
                        })}
                      ></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={css({
                        px: "8",
                        py: "20",
                        textAlign: "center",
                        color: "gray.600",
                        fontStyle: "italic",
                      })}
                    >
                      Aucune activité enregistrée dans le journal.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className={css({
                        _hover: { bg: "whiteAlpha.50" },
                        transition: "colors",
                      })}
                    >
                      <td className={css({ px: "8", py: "6" })}>
                        <div className={flex({ flexDir: "column" })}>
                          <span
                            className={css({
                              fontSize: "sm",
                              fontWeight: "bold",
                              color: "gray.300",
                            })}
                          >
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                          <span
                            className={css({
                              fontSize: "[10px]",
                              fontWeight: "black",
                              color: "gray.600",
                              textTransform: "uppercase",
                            })}
                          >
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className={css({ px: "8", py: "6" })}>
                        <div className={flex({ align: "center", gap: "3" })}>
                          <div
                            className={flex({
                              w: "8",
                              h: "8",
                              borderRadius: "lg",
                              bg: "bg.main",
                              border: "1px solid",
                              borderColor: "whiteAlpha.100",
                              align: "center",
                              justify: "center",
                              color: "gray.500",
                            })}
                          >
                            <User className={css({ w: "4", h: "4" })} />
                          </div>
                          <div className={flex({ flexDir: "column" })}>
                            <span
                              className={css({
                                fontSize: "xs",
                                fontWeight: "black",
                                color: "white",
                                fontFamily: "mono",
                              })}
                            >
                              {log.user_id.substring(0, 8)}...
                            </span>
                            <span
                              className={css({
                                fontSize: "[9px]",
                                fontWeight: "bold",
                                color: "gray.600",
                                textTransform: "uppercase",
                              })}
                            >
                              SuperAdmin
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={css({ px: "8", py: "6" })}>
                        <span
                          className={css({
                            px: "3",
                            py: "1",
                            borderRadius: "full",
                            fontSize: "[9px]",
                            fontWeight: "black",
                            textTransform: "uppercase",
                            letterSpacing: "widest",
                            border: "1px solid",
                            borderColor: `${getActionColor(log.action)}/20`,
                            bg: `${getActionColor(log.action)}/10`,
                            color: getActionColor(log.action),
                          })}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className={css({ px: "8", py: "6" })}>
                        <div className={flex({ flexDir: "column" })}>
                          <span
                            className={css({
                              fontSize: "xs",
                              fontWeight: "bold",
                              color: "gray.400",
                            })}
                          >
                            {log.target_type}
                          </span>
                          <span
                            className={css({
                              fontSize: "[10px]",
                              fontFamily: "mono",
                              color: "gray.600",
                            })}
                          >
                            {log.target_id.substring(0, 12)}...
                          </span>
                        </div>
                      </td>
                      <td className={css({ px: "8", py: "6" })}>
                        <span
                          className={css({
                            fontSize: "xs",
                            fontFamily: "mono",
                            color: "gray.500",
                          })}
                        >
                          {log.ip_address || "Internal"}
                        </span>
                      </td>
                      <td
                        className={css({
                          px: "8",
                          py: "6",
                          textAlign: "right",
                        })}
                      >
                        <button
                          className={css({
                            p: "2",
                            color: "gray.600",
                            _hover: {
                              color: "brand.primary",
                              bg: "brand.primary/10",
                            },
                            borderRadius: "xl",
                            transition: "all",
                          })}
                          title="Voir les détails JSON"
                          onClick={() =>
                            alert(
                              JSON.stringify(
                                parseDetails(log.details),
                                null,
                                2,
                              ),
                            )
                          }
                        >
                          <Info className={css({ w: "4", h: "4" })} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
