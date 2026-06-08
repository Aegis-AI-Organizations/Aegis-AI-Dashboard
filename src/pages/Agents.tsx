import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  Server,
  Trash2,
} from "lucide-react";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";
import { RoleBadge } from "../components/ui/RoleBadge";
import { css, cx } from "styled-system/css";
import { card, pageSubtitle, pageTitle } from "styled-system/recipes";
import { flex, grid } from "styled-system/patterns";

type Agent = {
  id: string;
  company_id: string;
  name: string;
  status: string;
  last_seen: string | null;
  created_at: string;
};

type ManagedCompany = {
  id: string;
  name: string;
  owner_email?: string;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { error?: unknown } } })
    .response?.data?.error;
  return typeof message === "string" ? message : fallback;
};

const statusPillClass = (status: string) =>
  status === "RUNNING"
    ? css({
        bg: "emerald.500/10",
        color: "emerald.400",
      })
    : css({
        bg: "red.500/10",
        color: "red.400",
      });

const SectionShell: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <section
    className={cx(
      card(),
      css({
        p: "10",
        borderRadius: "3xl",
        "& > * + *": { mt: "8" },
      }),
    )}
  >
    {children}
  </section>
);

export const Agents: React.FC = () => {
  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";
  const canManageClientAgents = ["admin", "superadmin"].includes(
    user?.role || "",
  );

  const [ownerAgents, setOwnerAgents] = useState<Agent[]>([]);
  const [ownerAgentsLoading, setOwnerAgentsLoading] = useState(false);
  const [ownerAgentsError, setOwnerAgentsError] = useState<string | null>(null);
  const [ownerTokenLoading, setOwnerTokenLoading] = useState<
    "rotate" | "revoke" | null
  >(null);
  const [ownerTokenMessage, setOwnerTokenMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [rotatedOwnerToken, setRotatedOwnerToken] = useState("");

  const [managedCompanies, setManagedCompanies] = useState<ManagedCompany[]>(
    [],
  );
  const [companySearch, setCompanySearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [clientAgents, setClientAgents] = useState<Agent[]>([]);
  const [clientAgentsLoading, setClientAgentsLoading] = useState(false);
  const [clientAgentsError, setClientAgentsError] = useState<string | null>(
    null,
  );
  const [clientTokenLoading, setClientTokenLoading] = useState<
    "rotate" | "revoke" | null
  >(null);
  const [clientTokenMessage, setClientTokenMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [rotatedClientToken, setRotatedClientToken] = useState("");

  const selectedCompany = useMemo(
    () => managedCompanies.find((company) => company.id === selectedCompanyId),
    [managedCompanies, selectedCompanyId],
  );

  const fetchOwnerAgents = useCallback(async () => {
    setOwnerAgentsLoading(true);
    setOwnerAgentsError(null);
    try {
      const { data } = await api.get<{ agents: Agent[] }>("/agents");
      setOwnerAgents(data.agents || []);
    } catch (error: unknown) {
      setOwnerAgentsError(
        getApiErrorMessage(error, "Impossible de charger la liste des agents"),
      );
    } finally {
      setOwnerAgentsLoading(false);
    }
  }, []);

  const fetchManagedCompanies = useCallback(
    async (search: string, currentCompanyId: string) => {
      setCompaniesLoading(true);
      setCompaniesError(null);
      try {
        const { data } = await api.get<ManagedCompany[]>(
          `/admin/companies?search=${encodeURIComponent(search)}`,
        );
        setManagedCompanies(data || []);
        if (!currentCompanyId && data?.length) {
          setSelectedCompanyId(data[0].id);
        } else if (
          currentCompanyId &&
          !data?.some((company) => company.id === currentCompanyId)
        ) {
          setSelectedCompanyId(data?.[0]?.id || "");
        }
      } catch (error: unknown) {
        setManagedCompanies([]);
        setCompaniesError(
          getApiErrorMessage(
            error,
            "Impossible de charger les entreprises clientes",
          ),
        );
      } finally {
        setCompaniesLoading(false);
      }
    },
    [],
  );

  const fetchClientAgents = useCallback(async (companyId: string) => {
    setClientAgentsLoading(true);
    setClientAgentsError(null);
    try {
      const { data } = await api.get<{ agents: Agent[] }>(
        `/agents?company_id=${encodeURIComponent(companyId)}`,
      );
      setClientAgents(data.agents || []);
    } catch (error: unknown) {
      setClientAgentsError(
        getApiErrorMessage(
          error,
          "Impossible de charger les agents de cette entreprise",
        ),
      );
    } finally {
      setClientAgentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      fetchOwnerAgents();
    }
  }, [fetchOwnerAgents, isOwner]);

  useEffect(() => {
    if (canManageClientAgents) {
      fetchManagedCompanies("", "");
    }
  }, [canManageClientAgents, fetchManagedCompanies]);

  useEffect(() => {
    if (canManageClientAgents && selectedCompanyId) {
      fetchClientAgents(selectedCompanyId);
      setRotatedClientToken("");
      setClientTokenMessage(null);
    }
  }, [canManageClientAgents, fetchClientAgents, selectedCompanyId]);

  const rotateOwnerToken = async () => {
    setOwnerTokenLoading("rotate");
    setOwnerTokenMessage(null);
    try {
      const { data } = await api.post<{ agent_token?: string }>(
        "/companies/me/agent-token/rotate",
      );
      if (data?.agent_token) {
        setRotatedOwnerToken(data.agent_token);
        setOwnerTokenMessage({
          type: "success",
          text: "Nouveau token généré. Copiez-le maintenant.",
        });
      }
    } catch (error: unknown) {
      setOwnerTokenMessage({
        type: "error",
        text: getApiErrorMessage(error, "Impossible de régénérer le token"),
      });
    } finally {
      setOwnerTokenLoading(null);
    }
  };

  const revokeOwnerToken = async () => {
    setOwnerTokenLoading("revoke");
    setOwnerTokenMessage(null);
    try {
      await api.post("/companies/me/agent-token/revoke");
      setRotatedOwnerToken("");
      setOwnerTokenMessage({
        type: "success",
        text: "Token agent révoqué.",
      });
    } catch (error: unknown) {
      setOwnerTokenMessage({
        type: "error",
        text: getApiErrorMessage(error, "Impossible de révoquer le token"),
      });
    } finally {
      setOwnerTokenLoading(null);
    }
  };

  const copyOwnerToken = async () => {
    if (!rotatedOwnerToken) return;
    await navigator.clipboard.writeText(rotatedOwnerToken);
    setOwnerTokenMessage({ type: "success", text: "Token copié." });
  };

  const rotateClientToken = async () => {
    if (!selectedCompanyId) return;
    setClientTokenLoading("rotate");
    setClientTokenMessage(null);
    try {
      const { data } = await api.post<{ agent_token?: string }>(
        `/admin/companies/${selectedCompanyId}/agent-token/rotate`,
      );
      if (data?.agent_token) {
        setRotatedClientToken(data.agent_token);
        setClientTokenMessage({
          type: "success",
          text: "Token client régénéré.",
        });
      }
    } catch (error: unknown) {
      setClientTokenMessage({
        type: "error",
        text: getApiErrorMessage(
          error,
          "Impossible de régénérer le token client",
        ),
      });
    } finally {
      setClientTokenLoading(null);
    }
  };

  const revokeClientToken = async () => {
    if (!selectedCompanyId) return;
    setClientTokenLoading("revoke");
    setClientTokenMessage(null);
    try {
      await api.post(
        `/admin/companies/${selectedCompanyId}/agent-token/revoke`,
      );
      setRotatedClientToken("");
      setClientTokenMessage({
        type: "success",
        text: "Token agent client révoqué.",
      });
    } catch (error: unknown) {
      setClientTokenMessage({
        type: "error",
        text: getApiErrorMessage(
          error,
          "Impossible de révoquer le token client",
        ),
      });
    } finally {
      setClientTokenLoading(null);
    }
  };

  const copyClientToken = async () => {
    if (!rotatedClientToken) return;
    await navigator.clipboard.writeText(rotatedClientToken);
    setClientTokenMessage({ type: "success", text: "Token client copié." });
  };

  return (
    <div className={css({ "& > * + *": { mt: "sectionGap" } })}>
      <div
        className={flex({
          direction: { base: "column", md: "row" },
          justify: "space-between",
          align: { base: "start", md: "end" },
          gap: "6",
        })}
      >
        <div className={css({ "& > * + *": { mt: "2" } })}>
          <h1 className={pageTitle()}>Agents</h1>
          <p className={pageSubtitle()}>
            Gérez les agents déployés et les tokens d'installation depuis une
            page dédiée.
          </p>
        </div>
        <div
          className={flex({
            align: "center",
            gap: "3",
            px: "5",
            py: "2.5",
            bg: "brand.primary/5",
            border: "1px solid",
            borderColor: "brand.primary/20",
            borderRadius: "2xl",
          })}
        >
          <div
            className={css({
              w: "2",
              h: "2",
              borderRadius: "full",
              bg: "brand.primary",
              animation: "pulse 2s infinite",
              boxShadow: "0 0 10px {colors.brand.primary}",
            })}
          />
          <RoleBadge role={user?.role || "viewer"} />
        </div>
      </div>

      {isOwner && (
        <SectionShell>
          <div
            className={flex({
              justify: "space-between",
              align: { base: "start", md: "center" },
              direction: { base: "column", md: "row" },
              gap: "6",
            })}
          >
            <div className={css({ "& > * + *": { mt: "2" } })}>
              <div
                className={flex({
                  align: "center",
                  gap: "3",
                  color: "brand.primary",
                  fontSize: "xs",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "widest",
                })}
              >
                <Server className={css({ w: "4", h: "4" })} />
                Gestion des agents
              </div>
              <h2
                className={css({
                  color: "white",
                  fontWeight: "900",
                  fontSize: "2xl",
                })}
              >
                Agents Déployés
              </h2>
              <p
                className={css({
                  color: "text.muted",
                  maxW: "2xl",
                  fontWeight: "medium",
                })}
              >
                Visualisez et gérez l'état de tous les agents Aegis collectant
                des données sur votre infrastructure.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchOwnerAgents}
              disabled={ownerAgentsLoading}
              className={flex({
                align: "center",
                gap: "2",
                px: "4",
                py: "2.5",
                bg: "whiteAlpha.50",
                _hover: { bg: "whiteAlpha.100" },
                color: "white",
                fontSize: "xs",
                fontWeight: "bold",
                borderRadius: "xl",
                cursor: "pointer",
              })}
            >
              <RefreshCw
                className={cx(
                  css({ w: "3.5", h: "3.5" }),
                  ownerAgentsLoading &&
                    css({ animation: "spin 1s linear infinite" }),
                )}
              />
              Actualiser
            </button>
          </div>

          {ownerAgentsLoading ? (
            <div
              className={flex({
                align: "center",
                justify: "center",
                py: "12",
              })}
            >
              <Loader2
                className={css({
                  w: "8",
                  h: "8",
                  animation: "spin 1s linear infinite",
                  color: "brand.primary",
                })}
              />
            </div>
          ) : ownerAgentsError ? (
            <div
              className={flex({
                align: "center",
                gap: "3",
                p: "4",
                bg: "red.500/10",
                border: "1px solid",
                borderColor: "red.500/20",
                color: "red.400",
                borderRadius: "xl",
              })}
            >
              <AlertCircle className={css({ w: "5", h: "5" })} />
              <span className={css({ fontWeight: "medium" })}>
                {ownerAgentsError}
              </span>
            </div>
          ) : ownerAgents.length === 0 ? (
            <div
              className={flex({
                direction: "column",
                align: "center",
                justify: "center",
                py: "12",
                px: "6",
                bg: "whiteAlpha.50/5",
                border: "1px dashed",
                borderColor: "whiteAlpha.100",
                borderRadius: "2xl",
                textAlign: "center",
                gap: "4",
              })}
            >
              <Server
                className={css({
                  w: "12",
                  h: "12",
                  color: "text.muted/40",
                })}
              />
              <div>
                <h3
                  className={css({
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "lg",
                  })}
                >
                  Aucun agent actif
                </h3>
                <p
                  className={css({
                    color: "text.muted",
                    fontSize: "sm",
                    mt: "1",
                  })}
                >
                  Installez l'agent sur vos serveurs pour commencer à collecter
                  des données.
                </p>
              </div>
            </div>
          ) : (
            <div className={css({ overflowX: "auto" })}>
              <table
                className={css({
                  w: "full",
                  borderCollapse: "collapse",
                  textAlign: "left",
                })}
              >
                <thead>
                  <tr
                    className={css({
                      borderBottom: "1px solid",
                      borderColor: "whiteAlpha.100",
                    })}
                  >
                    <th
                      className={css({
                        pb: "4",
                        color: "text.muted",
                        fontSize: "xs",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "wider",
                      })}
                    >
                      Nom
                    </th>
                    <th
                      className={css({
                        pb: "4",
                        color: "text.muted",
                        fontSize: "xs",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "wider",
                      })}
                    >
                      ID de l'Agent
                    </th>
                    <th
                      className={css({
                        pb: "4",
                        color: "text.muted",
                        fontSize: "xs",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "wider",
                      })}
                    >
                      Statut
                    </th>
                    <th
                      className={css({
                        pb: "4",
                        color: "text.muted",
                        fontSize: "xs",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "wider",
                      })}
                    >
                      Dernier Heartbeat
                    </th>
                    <th
                      className={css({
                        pb: "4",
                        color: "text.muted",
                        fontSize: "xs",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "wider",
                      })}
                    >
                      Enregistré le
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ownerAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className={css({
                        borderBottom: "1px solid",
                        borderColor: "whiteAlpha.50",
                        _last: { borderBottom: "none" },
                      })}
                    >
                      <td
                        className={css({
                          py: "4",
                          pr: "4",
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "sm",
                        })}
                      >
                        {agent.name || "Unnamed Agent"}
                      </td>
                      <td
                        className={css({
                          py: "4",
                          pr: "4",
                          color: "text.muted",
                          fontFamily: "mono",
                          fontSize: "xs",
                        })}
                      >
                        {agent.id}
                      </td>
                      <td className={css({ py: "4", pr: "4" })}>
                        <span
                          className={cx(
                            css({
                              display: "inline-flex",
                              alignItems: "center",
                              px: "2.5",
                              py: "0.5",
                              borderRadius: "full",
                              fontSize: "xs",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                            }),
                            statusPillClass(agent.status),
                          )}
                        >
                          {agent.status}
                        </span>
                      </td>
                      <td
                        className={css({
                          py: "4",
                          pr: "4",
                          color: "text.muted",
                          fontSize: "sm",
                        })}
                      >
                        {agent.last_seen
                          ? new Date(agent.last_seen).toLocaleString()
                          : "Jamais"}
                      </td>
                      <td
                        className={css({
                          py: "4",
                          color: "text.muted",
                          fontSize: "sm",
                        })}
                      >
                        {agent.created_at
                          ? new Date(agent.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div
            className={css({
              p: "6",
              bg: "whiteAlpha.50/5",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              borderRadius: "2xl",
              "& > * + *": { mt: "4" },
            })}
          >
            <h3
              className={css({
                color: "white",
                fontWeight: "bold",
                fontSize: "sm",
                textTransform: "uppercase",
                letterSpacing: "wide",
              })}
            >
              Commande de déploiement automatique (Linux Systemd)
            </h3>
            <p className={css({ color: "text.muted", fontSize: "sm" })}>
              Lancer la commande suivante sur votre hôte Linux pour installer et
              démarrer automatiquement le service de l'agent.
            </p>
            <div
              className={flex({
                direction: { base: "column", md: "row" },
                align: { base: "stretch", md: "center" },
                gap: "4",
                p: "4",
                bg: "blackAlpha.40",
                borderRadius: "xl",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
              })}
            >
              <code
                className={css({
                  flex: "1",
                  color: "brand.primary",
                  fontSize: "xs",
                  fontFamily: "mono",
                  overflowWrap: "anywhere",
                })}
              >
                {`curl -fsSL "https://api.aegis-ai.fr/install.sh?token=${
                  rotatedOwnerToken || "VOTRE_TOKEN_AGENT"
                }" | sudo bash`}
              </code>
              <button
                type="button"
                onClick={async () => {
                  const token = rotatedOwnerToken || "VOTRE_TOKEN_AGENT";
                  await navigator.clipboard.writeText(
                    `curl -fsSL "https://api.aegis-ai.fr/install.sh?token=${token}" | sudo bash`,
                  );
                  setOwnerTokenMessage({
                    type: "success",
                    text: "Commande copiée dans le presse-papiers.",
                  });
                }}
                className={flex({
                  align: "center",
                  justify: "center",
                  gap: "2",
                  px: "4",
                  py: "2",
                  bg: "whiteAlpha.100",
                  _hover: { bg: "whiteAlpha.200" },
                  color: "white",
                  borderRadius: "lg",
                  fontWeight: "bold",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "wider",
                })}
              >
                <Copy className={css({ w: "3.5", h: "3.5" })} />
                Copier la commande
              </button>
            </div>
          </div>
        </SectionShell>
      )}

      {isOwner && (
        <SectionShell>
          <div
            className={flex({
              direction: { base: "column", md: "row" },
              justify: "space-between",
              align: { base: "start", md: "center" },
              gap: "6",
            })}
          >
            <div className={css({ "& > * + *": { mt: "2" } })}>
              <div
                className={flex({
                  align: "center",
                  gap: "3",
                  color: "brand.primary",
                  fontSize: "xs",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "widest",
                })}
              >
                <KeyRound className={css({ w: "4", h: "4" })} />
                Token agent d'infrastructure
              </div>
              <h2
                className={css({
                  color: "white",
                  fontWeight: "900",
                  fontSize: "2xl",
                })}
              >
                Rotation et révocation du Token
              </h2>
              <p
                className={css({
                  color: "text.muted",
                  maxW: "2xl",
                  fontWeight: "medium",
                })}
              >
                Le token clair n'est jamais affiché en continu. Après rotation,
                il est visible une seule fois pour mettre à jour vos agents
                déployés.
              </p>
            </div>

            <div
              className={flex({
                direction: { base: "column", sm: "row" },
                gap: "3",
                w: { base: "full", md: "auto" },
              })}
            >
              <button
                type="button"
                onClick={rotateOwnerToken}
                disabled={ownerTokenLoading !== null}
                className={flex({
                  align: "center",
                  justify: "center",
                  gap: "3",
                  px: "6",
                  py: "4",
                  bg: "brand.primary",
                  color: "white",
                  fontWeight: "900",
                  borderRadius: "2xl",
                  textTransform: "uppercase",
                  fontSize: "xs",
                  letterSpacing: "widest",
                  _disabled: { opacity: 0.6, cursor: "not-allowed" },
                })}
              >
                {ownerTokenLoading === "rotate" ? (
                  <Loader2
                    className={css({
                      w: "4",
                      h: "4",
                      animation: "spin 1s linear infinite",
                    })}
                  />
                ) : (
                  <RefreshCw className={css({ w: "4", h: "4" })} />
                )}
                Régénérer
              </button>

              <button
                type="button"
                onClick={revokeOwnerToken}
                disabled={ownerTokenLoading !== null}
                className={flex({
                  align: "center",
                  justify: "center",
                  gap: "3",
                  px: "6",
                  py: "4",
                  bg: "red.500/10",
                  color: "red.300",
                  border: "1px solid",
                  borderColor: "red.500/20",
                  fontWeight: "900",
                  borderRadius: "2xl",
                  textTransform: "uppercase",
                })}
              >
                {ownerTokenLoading === "revoke" ? (
                  <Loader2
                    className={css({
                      w: "4",
                      h: "4",
                      animation: "spin 1s linear infinite",
                    })}
                  />
                ) : (
                  <Trash2 className={css({ w: "4", h: "4" })} />
                )}
                Révoquer
              </button>
            </div>
          </div>

          {rotatedOwnerToken && (
            <div
              className={flex({
                align: "center",
                direction: { base: "column", md: "row" },
                gap: "4",
                p: "4",
                bg: "whiteAlpha.50",
                borderRadius: "xl",
              })}
            >
              <code
                className={css({
                  flex: "1",
                  color: "white",
                  fontFamily: "mono",
                  fontSize: "sm",
                  overflowWrap: "anywhere",
                })}
              >
                {rotatedOwnerToken}
              </code>
              <button
                type="button"
                onClick={copyOwnerToken}
                className={flex({
                  align: "center",
                  gap: "2",
                  px: "4",
                  py: "2",
                  bg: "whiteAlpha.100",
                  color: "white",
                  borderRadius: "lg",
                  fontSize: "xs",
                  fontWeight: "bold",
                })}
              >
                <Copy className={css({ w: "3.5", h: "3.5" })} />
                Copier token
              </button>
            </div>
          )}

          {ownerTokenMessage && (
            <div
              className={flex({
                align: "center",
                gap: "3",
                p: "4",
                borderRadius: "xl",
                fontSize: "sm",
                fontWeight: "bold",
                bg:
                  ownerTokenMessage.type === "success"
                    ? "emerald.500/10"
                    : "red.500/10",
                color:
                  ownerTokenMessage.type === "success"
                    ? "emerald.400"
                    : "red.400",
              })}
            >
              {ownerTokenMessage.type === "success" ? (
                <CheckCircle2 className={css({ w: "4", h: "4" })} />
              ) : (
                <AlertCircle className={css({ w: "4", h: "4" })} />
              )}
              {ownerTokenMessage.text}
            </div>
          )}
        </SectionShell>
      )}

      {canManageClientAgents && (
        <SectionShell>
          <div className={css({ "& > * + *": { mt: "2" } })}>
            <div
              className={flex({
                align: "center",
                gap: "3",
                color: "brand.primary",
                fontSize: "xs",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "widest",
              })}
            >
              <Building2 className={css({ w: "4", h: "4" })} />
              Console Aegis personnel
            </div>
            <h2
              className={css({
                color: "white",
                fontWeight: "900",
                fontSize: "2xl",
              })}
            >
              Agents des entreprises clientes
            </h2>
            <p
              className={css({
                color: "text.muted",
                maxW: "2xl",
                fontWeight: "medium",
              })}
            >
              Consultez les agents déployés et gérez le token d'installation
              d'une entreprise cliente.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              fetchManagedCompanies(companySearch, selectedCompanyId);
            }}
            className={flex({
              direction: { base: "column", md: "row" },
              gap: "3",
            })}
          >
            <label
              className={flex({
                flex: "1",
                align: "center",
                gap: "3",
                px: "4",
                py: "3",
                bg: "whiteAlpha.50",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                borderRadius: "xl",
              })}
            >
              <Search
                className={css({ w: "4", h: "4", color: "text.muted" })}
              />
              <input
                aria-label="Rechercher une entreprise cliente"
                value={companySearch}
                onChange={(event) => setCompanySearch(event.target.value)}
                placeholder="Rechercher une entreprise cliente..."
                className={css({
                  flex: "1",
                  bg: "transparent",
                  color: "white",
                  outline: "none",
                  fontSize: "sm",
                })}
              />
            </label>
            <button
              type="submit"
              disabled={companiesLoading}
              className={flex({
                align: "center",
                justify: "center",
                gap: "2",
                px: "5",
                py: "3",
                bg: "brand.primary",
                color: "white",
                borderRadius: "xl",
                fontSize: "xs",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "widest",
                _disabled: { opacity: 0.6, cursor: "not-allowed" },
              })}
            >
              {companiesLoading && (
                <Loader2
                  className={css({
                    w: "4",
                    h: "4",
                    animation: "spin 1s linear infinite",
                  })}
                />
              )}
              Rechercher
            </button>
          </form>

          {companiesError && (
            <div
              className={flex({
                align: "center",
                gap: "3",
                p: "4",
                bg: "red.500/10",
                border: "1px solid",
                borderColor: "red.500/20",
                color: "red.400",
                borderRadius: "xl",
              })}
            >
              <AlertCircle className={css({ w: "5", h: "5" })} />
              {companiesError}
            </div>
          )}

          <div
            className={grid({
              columns: { base: 1, lg: 3 },
              gap: "6",
            })}
          >
            <div className={css({ "& > * + *": { mt: "3" } })}>
              <p
                className={css({
                  color: "text.muted",
                  fontSize: "xs",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "wider",
                })}
              >
                Entreprises
              </p>
              {managedCompanies.length === 0 && !companiesLoading ? (
                <p className={css({ color: "text.muted", fontSize: "sm" })}>
                  Aucune entreprise trouvée.
                </p>
              ) : (
                managedCompanies.map((company) => (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={css({
                      w: "full",
                      p: "4",
                      textAlign: "left",
                      bg:
                        company.id === selectedCompanyId
                          ? "brand.primary/10"
                          : "whiteAlpha.50",
                      border: "1px solid",
                      borderColor:
                        company.id === selectedCompanyId
                          ? "brand.primary/40"
                          : "whiteAlpha.100",
                      borderRadius: "xl",
                      cursor: "pointer",
                      "& > * + *": { mt: "1" },
                    })}
                  >
                    <span
                      className={css({
                        display: "block",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "sm",
                      })}
                    >
                      {company.name}
                    </span>
                    <span
                      className={css({
                        display: "block",
                        color: "text.muted",
                        fontSize: "xs",
                      })}
                    >
                      {company.owner_email || company.id}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div
              className={css({
                gridColumn: { base: "auto", lg: "span 2" },
                "& > * + *": { mt: "5" },
              })}
            >
              <div
                className={flex({
                  justify: "space-between",
                  align: "center",
                  gap: "4",
                })}
              >
                <div>
                  <h3
                    className={css({
                      color: "white",
                      fontSize: "lg",
                      fontWeight: "bold",
                    })}
                  >
                    {selectedCompany?.name || "Sélectionnez une entreprise"}
                  </h3>
                  {selectedCompany && (
                    <p className={css({ color: "text.muted", fontSize: "xs" })}>
                      {selectedCompany.id}
                    </p>
                  )}
                </div>
                {selectedCompanyId && (
                  <button
                    type="button"
                    onClick={() => fetchClientAgents(selectedCompanyId)}
                    disabled={clientAgentsLoading}
                    className={flex({
                      align: "center",
                      gap: "2",
                      px: "4",
                      py: "2.5",
                      bg: "whiteAlpha.50",
                      color: "white",
                      fontSize: "xs",
                      fontWeight: "bold",
                      borderRadius: "xl",
                    })}
                  >
                    <RefreshCw className={css({ w: "3.5", h: "3.5" })} />
                    Actualiser
                  </button>
                )}
              </div>

              {clientAgentsLoading ? (
                <div
                  className={flex({
                    justify: "center",
                    align: "center",
                    py: "10",
                  })}
                >
                  <Loader2
                    className={css({
                      w: "8",
                      h: "8",
                      color: "brand.primary",
                      animation: "spin 1s linear infinite",
                    })}
                  />
                </div>
              ) : clientAgentsError ? (
                <div className={css({ color: "red.400", fontSize: "sm" })}>
                  {clientAgentsError}
                </div>
              ) : !selectedCompanyId ? (
                <div className={css({ color: "text.muted", fontSize: "sm" })}>
                  Sélectionnez une entreprise pour afficher ses agents.
                </div>
              ) : clientAgents.length === 0 ? (
                <div
                  className={css({
                    p: "6",
                    color: "text.muted",
                    fontSize: "sm",
                    textAlign: "center",
                    bg: "whiteAlpha.50",
                    borderRadius: "xl",
                  })}
                >
                  Aucun agent enregistré pour cette entreprise.
                </div>
              ) : (
                <div className={css({ overflowX: "auto" })}>
                  <table
                    className={css({
                      w: "full",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    })}
                  >
                    <thead>
                      <tr
                        className={css({
                          borderBottom: "1px solid",
                          borderColor: "whiteAlpha.100",
                        })}
                      >
                        <th
                          className={css({
                            pb: "3",
                            color: "text.muted",
                            fontSize: "xs",
                          })}
                        >
                          Agent
                        </th>
                        <th
                          className={css({
                            pb: "3",
                            color: "text.muted",
                            fontSize: "xs",
                          })}
                        >
                          Statut
                        </th>
                        <th
                          className={css({
                            pb: "3",
                            color: "text.muted",
                            fontSize: "xs",
                          })}
                        >
                          Dernier heartbeat
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientAgents.map((agent) => (
                        <tr
                          key={agent.id}
                          className={css({
                            borderBottom: "1px solid",
                            borderColor: "whiteAlpha.50",
                          })}
                        >
                          <td
                            className={css({
                              py: "4",
                              color: "white",
                              fontSize: "sm",
                            })}
                          >
                            <strong>{agent.name || "Unnamed Agent"}</strong>
                            <span
                              className={css({
                                display: "block",
                                color: "text.muted",
                                fontSize: "xs",
                                fontFamily: "mono",
                              })}
                            >
                              {agent.id}
                            </span>
                          </td>
                          <td
                            className={css({
                              py: "4",
                              color: "white",
                              fontSize: "xs",
                            })}
                          >
                            {agent.status}
                          </td>
                          <td
                            className={css({
                              py: "4",
                              color: "text.muted",
                              fontSize: "sm",
                            })}
                          >
                            {agent.last_seen
                              ? new Date(agent.last_seen).toLocaleString()
                              : "Jamais"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </SectionShell>
      )}

      {selectedCompany && (
        <SectionShell>
          <div
            className={flex({
              direction: { base: "column", md: "row" },
              justify: "space-between",
              align: { base: "start", md: "center" },
              gap: "5",
            })}
          >
            <div className={css({ "& > * + *": { mt: "2" } })}>
              <div
                className={flex({
                  align: "center",
                  gap: "3",
                  color: "brand.primary",
                  fontSize: "xs",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  letterSpacing: "widest",
                })}
              >
                <KeyRound className={css({ w: "4", h: "4" })} />
                Token agent client
              </div>
              <h2
                className={css({
                  color: "white",
                  fontWeight: "900",
                  fontSize: "xl",
                })}
              >
                {selectedCompany.name}
              </h2>
              <p className={css({ color: "text.muted", fontSize: "sm" })}>
                Le nouveau token est affiché uniquement après rotation.
              </p>
            </div>
            <div
              className={flex({
                gap: "3",
                direction: { base: "column", sm: "row" },
              })}
            >
              <button
                type="button"
                onClick={rotateClientToken}
                disabled={clientTokenLoading !== null}
                className={flex({
                  align: "center",
                  gap: "2",
                  px: "5",
                  py: "3",
                  bg: "brand.primary",
                  color: "white",
                  borderRadius: "xl",
                  fontSize: "xs",
                  fontWeight: "900",
                  textTransform: "uppercase",
                })}
              >
                <RefreshCw className={css({ w: "4", h: "4" })} />
                Régénérer client
              </button>
              <button
                type="button"
                onClick={revokeClientToken}
                disabled={clientTokenLoading !== null}
                className={flex({
                  align: "center",
                  gap: "2",
                  px: "5",
                  py: "3",
                  bg: "red.500/10",
                  color: "red.300",
                  border: "1px solid",
                  borderColor: "red.500/20",
                  borderRadius: "xl",
                  fontSize: "xs",
                  fontWeight: "900",
                  textTransform: "uppercase",
                })}
              >
                <Trash2 className={css({ w: "4", h: "4" })} />
                Révoquer client
              </button>
            </div>
          </div>

          {rotatedClientToken && (
            <div
              className={flex({
                align: "center",
                direction: { base: "column", md: "row" },
                gap: "4",
                p: "4",
                bg: "whiteAlpha.50",
                borderRadius: "xl",
              })}
            >
              <code
                className={css({
                  flex: "1",
                  color: "white",
                  fontFamily: "mono",
                  fontSize: "sm",
                  overflowWrap: "anywhere",
                })}
              >
                {rotatedClientToken}
              </code>
              <button
                type="button"
                onClick={copyClientToken}
                className={flex({
                  align: "center",
                  gap: "2",
                  px: "4",
                  py: "2",
                  bg: "whiteAlpha.100",
                  color: "white",
                  borderRadius: "lg",
                  fontSize: "xs",
                  fontWeight: "bold",
                })}
              >
                <Copy className={css({ w: "3.5", h: "3.5" })} />
                Copier token client
              </button>
            </div>
          )}

          {clientTokenMessage && (
            <div
              className={flex({
                align: "center",
                gap: "3",
                p: "4",
                borderRadius: "xl",
                fontSize: "sm",
                fontWeight: "bold",
                bg:
                  clientTokenMessage.type === "success"
                    ? "emerald.500/10"
                    : "red.500/10",
                color:
                  clientTokenMessage.type === "success"
                    ? "emerald.400"
                    : "red.400",
              })}
            >
              {clientTokenMessage.type === "success" ? (
                <CheckCircle2 className={css({ w: "4", h: "4" })} />
              ) : (
                <AlertCircle className={css({ w: "4", h: "4" })} />
              )}
              {clientTokenMessage.text}
            </div>
          )}
        </SectionShell>
      )}
    </div>
  );
};
