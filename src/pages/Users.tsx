import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Building2,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Mail,
  Copy,
  Terminal,
  Loader2,
  AlertCircle,
  Zap,
  CheckCircle2,
  X,
  Globe,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { pageTitle, button as buttonRecipe } from "styled-system/recipes";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";
import { RoleBadge } from "../components/ui/RoleBadge";
import { ProfileCircle } from "../components/ui/ProfileCircle";
import { useTeamsSSE } from "../hooks/useTeamsSSE";

interface Company {
  id: string;
  name: string;
  deployment_token: string;
  owner_email: string;
  avatar_url?: string;
  members?: User[];
  isExpanded?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
  avatar_url?: string;
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const expandedIdsRef = useRef<Set<string>>(expandedIds);
  expandedIdsRef.current = expandedIds;
  const [loading, setLoading] = useState(true);

  // Reference to prevent unnecessary refetches of members during company list updates
  const companiesRef = useRef<Company[]>([]);
  companiesRef.current = companies;

  // Modals state
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const actionHandledRef = useRef(false);

  // Handle auto-open modals from search params
  useEffect(() => {
    if (actionHandledRef.current) return;

    const action = searchParams.get("action");
    if (action === "new-company") {
      setIsNewCompanyOpen(true);
      actionHandledRef.current = true;
    } else if (action === "new-user") {
      setIsNewUserOpen(true);
      actionHandledRef.current = true;
    }
  }, [searchParams]);

  const fetchCompanies = useCallback(async (query: string = "") => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/companies?search=${query}`);
      const results = data || [];

      // If searching, auto-expand all found companies
      if (query && results.length > 0) {
        const resultIds = results.map((c: Company) => c.id);
        setExpandedIds((prev) => {
          const next = new Set(prev);
          resultIds.forEach((id: string) => next.add(id));
          return next;
        });
      }

      setCompanies((prev) => {
        return results.map((c: Company) => {
          const old = prev.find((pc) => pc.id === c.id);
          return {
            ...c,
            isExpanded: query ? true : expandedIdsRef.current.has(c.id),
            members: old?.members,
          };
        });
      });
    } catch (err) {
      console.error("Failed to fetch companies", err);
      setCompanies([]); // Clear results on error to avoid showing stale data
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync search with URL
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies(searchQuery);
      if (searchQuery) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("search", searchQuery);
            return next;
          },
          { replace: true },
        );
      } else {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.delete("search");
            return next;
          },
          { replace: true },
        );
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchCompanies, setSearchParams]);

  // Auto-refresh members for expanded companies when search query or expanded set changes
  useEffect(() => {
    expandedIds.forEach((id) => {
      fetchMembers(id, searchQuery);
    });
  }, [expandedIds, searchQuery]);

  // Real-time updates via SSE
  useTeamsSSE(() => {
    fetchCompanies(searchQuery);
  });

  const toggleCompany = async (companyId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
        // Fetch members if not already present
        const comp = companies.find((c) => c.id === companyId);
        if (!comp?.members) {
          fetchMembers(companyId, searchQuery);
        }
      }
      return next;
    });

    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id === companyId) {
          return { ...c, isExpanded: !c.isExpanded };
        }
        return c;
      }),
    );
  };

  const fetchMembers = async (companyId: string, query: string = "") => {
    try {
      const { data } = await api.get(
        `/admin/users?company_id=${companyId}&search=${query}`,
      );
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, members: data } : c)),
      );
    } catch (err) {
      console.error("Failed to fetch members", err);
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, members: [] } : c)),
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // RBAC Helpers - Consolidated management hub for Platform Admins and Organization Owners
  const canCreateCompany = ["superadmin", "admin"].includes(
    currentUser?.role || "",
  );
  const canCreateUser = ["superadmin", "admin", "owner"].includes(
    currentUser?.role || "",
  );

  return (
    <div
      className={css({
        maxW: "7xl",
        mx: "auto",
        display: "flex",
        flexDir: "column",
        gap: "12",
        animation: "fadeIn 0.5s ease-out",
        pb: "20",
      })}
    >
      {/* Header & Main Actions */}
      <div
        className={flex({
          direction: { base: "column", md: "row" },
          justify: "space-between",
          align: { base: "flex-start", md: "flex-end" },
          gap: "8",
        })}
      >
        <div className={css({ "& > * + *": { mt: "3" } })}>
          <h1 className={pageTitle()}>Équipes</h1>
          <p
            className={css({
              color: "text.muted",
              fontWeight: "bold",
              fontSize: "lg",
              maxW: "xl",
              lineHeight: "relaxed",
            })}
          >
            Gérez vos entités clientes et les comptes collaborateurs directement
            depuis ce portail centralisé.
          </p>
        </div>

        <div className={flex({ flexWrap: "wrap", gap: "4" })}>
          {canCreateUser && (
            <button
              onClick={() => setIsNewUserOpen(true)}
              className={buttonRecipe({ variant: "primary", size: "lg" })}
            >
              <UserPlus className={css({ w: "4", h: "4" })} />
              Créer un Utilisateur
            </button>
          )}
          {canCreateCompany && (
            <button
              onClick={() => setIsNewCompanyOpen(true)}
              className={buttonRecipe({ variant: "primary", size: "lg" })}
            >
              <Building2 className={css({ w: "4", h: "4" })} />
              Nouvelle Entreprise
            </button>
          )}
        </div>
      </div>
      {/* Global Search */}
      <div className={css({ position: "relative" })}>
        <div
          className={css({
            position: "absolute",
            insetY: "0",
            left: "6",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          })}
        >
          <Search className={css({ w: "5", h: "5", color: "gray.500" })} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une entreprise (Nom, ID) ou un collaborateur (Nom, Email, ID)..."
          className={css({
            w: "full",
            bg: "bg.card",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            color: "white",
            borderRadius: "3xl",
            pl: "16",
            pr: "8",
            py: "6",
            fontSize: "lg",
            fontWeight: "bold",
            _focus: { outline: "none", borderColor: "brand.primary" },
            transition: "all",
            _placeholder: { color: "gray.700" },
            boxShadow: "2xl",
          })}
        />
      </div>{" "}
      {/* Hierarchical List */}
      <div className={css({ "& > * + *": { mt: "4" } })}>
        {loading && !companies.length ? (
          <div
            className={flex({
              py: "20",
              direction: "column",
              align: "center",
              gap: "4",
              color: "text.muted",
            })}
          >
            <Loader2
              className={css({
                w: "10",
                h: "10",
                animation: "spin 1s linear infinite",
              })}
            />
            <p
              className={css({
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "widest",
                fontSize: "xs",
              })}
            >
              Chargement des données...
            </p>
          </div>
        ) : companies.length === 0 ? (
          <div
            className={flex({
              py: "20",
              bg: "whiteAlpha.50",
              border: "1px dashed",
              borderColor: "whiteAlpha.100",
              borderRadius: "3rem",
              direction: "column",
              align: "center",
              gap: "4",
              color: "text.muted",
              fontStyle: "italic",
            })}
          >
            <Globe className={css({ w: "10", h: "10", opacity: 0.2 })} />
            <p>Aucun résultat correspondant à votre recherche.</p>
          </div>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              className={css({
                bg: "bg.card",
                border: "1px solid",
                borderColor: company.isExpanded
                  ? "brand.primary/30"
                  : "whiteAlpha.100",
                borderRadius: company.isExpanded ? "2.5rem" : "3xl",
                boxShadow: company.isExpanded ? "2xl" : "none",
                transition: "all",
                transitionDuration: "300ms",
                overflow: "hidden",
                _hover: {
                  borderColor: company.isExpanded
                    ? "brand.primary/30"
                    : "whiteAlpha.200",
                },
              })}
            >
              <div
                onClick={() => toggleCompany(company.id)}
                className={flex({
                  p: { base: "6", md: "8" },
                  direction: { base: "column", md: "row" },
                  align: { md: "center" },
                  justify: "space-between",
                  gap: "6",
                  cursor: "pointer",
                })}
              >
                <div className={flex({ align: "center", gap: "6" })}>
                  {company.avatar_url ? (
                    <ProfileCircle
                      size="md"
                      avatarUrl={company.avatar_url}
                      name={company.name}
                      className={css({ borderRadius: "2xl" })}
                    />
                  ) : (
                    <div
                      className={cx(
                        flex({
                          w: "14",
                          h: "14",
                          borderRadius: "2xl",
                          align: "center",
                          justify: "center",
                          transition: "all",
                          border: "1px solid",
                        }),
                        company.name === "Aegis AI"
                          ? css({
                              bg: "brand.primary/10",
                              color: "brand.primary",
                              borderColor: "brand.primary/30",
                            })
                          : css({
                              bg: "bg.main",
                              color: "gray.400",
                              borderColor: "whiteAlpha.100",
                            }),
                      )}
                    >
                      <Building2 className={css({ w: "6", h: "6" })} />
                    </div>
                  )}
                  <div className={css({ "& > * + *": { mt: "1" } })}>
                    <div className={flex({ align: "center", gap: "3" })}>
                      <h3
                        className={css({
                          fontSize: "xl",
                          fontWeight: "900",
                          color: "white",
                          letterSpacing: "tight",
                          _groupHover: { color: "brand.primary" },
                          transition: "colors",
                        })}
                      >
                        {company.name}
                      </h3>
                      {company.name === "Aegis AI" && (
                        <span
                          className={css({
                            px: "2",
                            py: "0.5",
                            bg: "brand.primary/20",
                            color: "brand.primary",
                            fontSize: "10px",
                            fontWeight: "900",
                            textTransform: "uppercase",
                            letterSpacing: "widest",
                            borderRadius: "md",
                            border: "1px solid",
                            borderColor: "brand.primary/20",
                          })}
                        >
                          Root
                        </span>
                      )}
                    </div>
                    <div
                      className={flex({
                        align: "center",
                        gap: "4",
                        fontSize: "xs",
                        fontWeight: "bold",
                        color: "text.muted",
                      })}
                    >
                      <span className={flex({ align: "center", gap: "1.5" })}>
                        <Mail className={css({ w: "3", h: "3" })} />{" "}
                        {company.owner_email}
                      </span>
                      <span
                        className={css({
                          display: { base: "none", md: "inline" },
                          color: "whiteAlpha.200",
                        })}
                      >
                        |
                      </span>
                      <span
                        className={flex({
                          align: "center",
                          gap: "1.5",
                          fontFamily: "mono",
                          opacity: 0.5,
                        })}
                      >
                        {company.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className={flex({ align: "center", gap: "4" })}>
                  <div
                    className={css({
                      p: "3",
                      borderRadius: "xl",
                      bg: company.isExpanded
                        ? "brand.primary"
                        : "whiteAlpha.100",
                      color: company.isExpanded ? "white" : "gray.600",
                      transition: "all",
                      _groupHover: {
                        bg: company.isExpanded
                          ? "brand.primary"
                          : "brand.primary/20",
                        color: "white",
                      },
                    })}
                  >
                    {company.isExpanded ? (
                      <ChevronDown className={css({ w: "5", h: "5" })} />
                    ) : (
                      <ChevronRight className={css({ w: "5", h: "5" })} />
                    )}
                  </div>
                </div>
              </div>{" "}
              {/* Expanded Members List */}
              {company.isExpanded && (
                <div
                  className={css({
                    borderTop: "1px solid",
                    borderColor: "whiteAlpha.50",
                    bg: "blackAlpha.200",
                    p: "8",
                    pt: "4",
                    animation: "slideInFromTop 0.3s ease-out",
                  })}
                >
                  <div
                    className={flex({
                      align: "center",
                      justify: "space-between",
                      mb: "6",
                    })}
                  >
                    <h4
                      className={css({
                        fontSize: "10px",
                        fontWeight: "900",
                        color: "text.muted",
                        textTransform: "uppercase",
                        letterSpacing: "0.2em",
                        display: "flex",
                        alignItems: "center",
                        gap: "2",
                      })}
                    >
                      Collaborateurs{" "}
                      <span
                        className={css({
                          px: "2",
                          py: "0.5",
                          bg: "whiteAlpha.100",
                          borderRadius: "full",
                          color: "gray.400",
                        })}
                      >
                        {company.members?.length || 0}
                      </span>
                    </h4>
                  </div>

                  <div
                    className={css({
                      display: "grid",
                      gridTemplateColumns: { base: "1", md: "2", lg: "3" },
                      gap: "4",
                    })}
                  >
                    {company.members ? (
                      company.members.map((member) => (
                        <div
                          key={member.id}
                          className={flex({
                            bg: "whiteAlpha.50",
                            border: "1px solid",
                            borderColor: "whiteAlpha.50",
                            p: "5",
                            borderRadius: "2xl",
                            align: "center",
                            gap: "4",
                            transition: "all",
                            _hover: { borderColor: "brand.primary/30" },
                            position: "relative",
                          })}
                        >
                          <ProfileCircle
                            size="sm"
                            avatarUrl={member.avatar_url}
                            name={member.name}
                          />
                          <div
                            className={css({
                              "& > * + *": { mt: "1" },
                              my: "auto",
                              flex: "1",
                              minW: "0",
                            })}
                          >
                            <div
                              className={flex({
                                align: "center",
                                gap: "3",
                              })}
                            >
                              <span
                                className={css({
                                  fontSize: "sm",
                                  fontWeight: "900",
                                  color: "white",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                })}
                              >
                                {member.name || "Utilisateur sans nom"}
                              </span>
                              <RoleBadge role={member.role} showIcon={false} />
                            </div>
                            {member.email && (
                              <p
                                className={css({
                                  fontSize: "xs",
                                  color: "text.muted",
                                  fontWeight: "bold",
                                  textOverflow: "ellipsis",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                })}
                              >
                                {member.email}
                              </p>
                            )}
                            <code
                              className={css({
                                fontSize: "9px",
                                color: "whiteAlpha.300",
                                fontFamily: "mono",
                                display: "block",
                                opacity: { base: 1, md: 0 },
                                _groupHover: { opacity: 1 },
                                transition: "opacity",
                              })}
                            >
                              ID: {member.id}
                            </code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(member.id)}
                            className={css({
                              p: "2",
                              color: "gray.700",
                              _hover: { color: "brand.primary" },
                              transition: "colors",
                            })}
                          >
                            <Copy className={css({ w: "3.5", h: "3.5" })} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div
                        className={flex({
                          gridColumn: "span 1 / -1",
                          py: "10",
                          justify: "center",
                        })}
                      >
                        <Loader2
                          className={css({
                            w: "6",
                            h: "6",
                            animation: "spin 1s linear infinite",
                            color: "whiteAlpha.200",
                          })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {/* MODAL: Create Company */}
      {isNewCompanyOpen && (
        <CreateCompanyModal
          onClose={() => setIsNewCompanyOpen(false)}
          onSuccess={(data) => {
            setIsNewCompanyOpen(false);
            setSuccessData(data);
            fetchCompanies(searchQuery);
          }}
        />
      )}
      {/* MODAL: Create User */}
      {isNewUserOpen && (
        <CreateUserModal
          onClose={() => setIsNewUserOpen(false)}
          onSuccess={() => {
            setIsNewUserOpen(false);
            fetchCompanies(searchQuery);
            // Also refresh members for all expanded companies to show the new user
            expandedIds.forEach((id) => fetchMembers(id, searchQuery));
          }}
          currentUser={currentUser}
          companies={companies}
        />
      )}
      {/* MODAL: Success Result */}
      {successData && (
        <SuccessModal data={successData} onClose={() => setSuccessData(null)} />
      )}
    </div>
  );
};

// Sub-components for Modals
export const CreateCompanyModal: React.FC<{
  onClose: () => void;
  onSuccess: (data: any) => void;
}> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    owner_name: "",
    owner_email: "",
    owner_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/companies/onboard", formData);
      onSuccess({ ...data, company_name: formData.company_name });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={css({
        position: "fixed",
        inset: "0",
        zIndex: "100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "6",
        backdropBlur: "xl",
        bg: "black/60",
        overflowY: "auto",
      })}
    >
      <div
        className={css({
          position: "relative",
          w: "full",
          maxW: "4xl",
          bg: "bg.card",
          border: "1px solid",
          borderColor: "whiteAlpha.100",
          borderRadius: "3.5rem",
          p: "12",
          boxShadow: "2xl",
          animation: "zoomIn 0.3s ease-out",
          my: "auto",
        })}
      >
        <button
          onClick={onClose}
          className={css({
            position: "absolute",
            top: "8",
            right: "8",
            color: "gray.500",
            _hover: { color: "white" },
            transition: "colors",
          })}
        >
          <X className={css({ w: "8", h: "8" })} />
        </button>

        <div className={css({ "& > * + *": { mt: "10" } })}>
          <div className={css({ "& > * + *": { mt: "2" } })}>
            <h2
              className={css({
                fontSize: "4xl",
                fontWeight: "900",
                color: "white",
                letterSpacing: "tight",
                textTransform: "uppercase",
              })}
            >
              Nouvelle Entité Aegis
            </h2>
            <p className={css({ color: "text.muted", fontWeight: "bold" })}>
              Configurez une nouvelle entreprise et son compte propriétaire.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className={css({ "& > * + *": { mt: "10" } })}
          >
            <div
              className={css({
                display: "grid",
                gridTemplateColumns: { base: "1", md: "2" },
                gap: "10",
              })}
            >
              <div className={css({ "& > * + *": { mt: "6" } })}>
                <h3
                  className={flex({
                    fontSize: "xs",
                    fontWeight: "900",
                    color: "brand.primary",
                    textTransform: "uppercase",
                    letterSpacing: "widest",
                    align: "center",
                    gap: "2",
                  })}
                >
                  <Building2 className={css({ w: "4", h: "4" })} /> Entreprise
                </h3>
                <div className={css({ "& > * + *": { mt: "2" } })}>
                  <label
                    className={css({
                      fontSize: "10px",
                      fontWeight: "900",
                      color: "text.muted",
                      textTransform: "uppercase",
                      px: "1",
                    })}
                  >
                    Nom de l'entité
                  </label>
                  <input
                    required
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    placeholder="ex: Global CyberSec Inc."
                    className={css({
                      w: "full",
                      bg: "whiteAlpha.50",
                      border: "1px solid",
                      borderColor: "whiteAlpha.100",
                      color: "white",
                      borderRadius: "2xl",
                      px: "6",
                      py: "4",
                      _focus: { borderColor: "brand.primary", outline: "none" },
                      transition: "all",
                      fontWeight: "bold",
                    })}
                  />
                </div>
              </div>
              <div className={css({ "& > * + *": { mt: "6" } })}>
                <h3
                  className={flex({
                    fontSize: "xs",
                    fontWeight: "900",
                    color: "indigo.500",
                    textTransform: "uppercase",
                    letterSpacing: "widest",
                    align: "center",
                    gap: "2",
                  })}
                >
                  <UserPlus className={css({ w: "4", h: "4" })} /> Propriétaire
                </h3>
                <div className={css({ "& > * + *": { mt: "4" } })}>
                  <input
                    required
                    value={formData.owner_name}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_name: e.target.value })
                    }
                    placeholder="Nom complet"
                    className={css({
                      w: "full",
                      bg: "whiteAlpha.50",
                      border: "1px solid",
                      borderColor: "whiteAlpha.100",
                      color: "white",
                      borderRadius: "2xl",
                      px: "6",
                      py: "4",
                      _focus: { borderColor: "indigo.500", outline: "none" },
                      transition: "all",
                      fontWeight: "bold",
                    })}
                  />
                  <input
                    required
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_email: e.target.value })
                    }
                    placeholder="Email professionnel"
                    className={css({
                      w: "full",
                      bg: "whiteAlpha.50",
                      border: "1px solid",
                      borderColor: "whiteAlpha.100",
                      color: "white",
                      borderRadius: "2xl",
                      px: "6",
                      py: "4",
                      _focus: { borderColor: "indigo.500", outline: "none" },
                      transition: "all",
                      fontWeight: "bold",
                    })}
                  />
                  <input
                    required
                    type="password"
                    value={formData.owner_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        owner_password: e.target.value,
                      })
                    }
                    placeholder="Mot de passe initial"
                    className={css({
                      w: "full",
                      bg: "whiteAlpha.50",
                      border: "1px solid",
                      borderColor: "whiteAlpha.100",
                      color: "white",
                      borderRadius: "2xl",
                      px: "6",
                      py: "4",
                      _focus: { borderColor: "indigo.500", outline: "none" },
                      transition: "all",
                      fontWeight: "bold",
                    })}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div
                className={flex({
                  p: "4",
                  bg: "red.500/10",
                  border: "1px solid",
                  borderColor: "red.500/20",
                  color: "red.500",
                  borderRadius: "2xl",
                  align: "center",
                  gap: "3",
                  fontWeight: "900",
                  fontSize: "sm",
                })}
              >
                <AlertCircle className={css({ w: "5", h: "5" })} />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className={cx(
                buttonRecipe({ variant: "primary", size: "lg" }),
                css({ w: "full", py: "8!" }),
              )}
            >
              {loading ? (
                <Loader2
                  className={css({
                    animation: "spin 1s linear infinite",
                    w: "5",
                    h: "5",
                  })}
                />
              ) : (
                <Zap className={css({ w: "5", h: "5", fill: "current" })} />
              )}
              Finaliser l'Onboarding
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const CreateUserModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
  companies: Company[];
}> = ({ onClose, onSuccess, currentUser, companies }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
    company_id: currentUser?.role === "owner" ? currentUser?.company_id : "",
  });

  const selectedCompany = companies.find((c) => c.id === formData.company_id);
  const isSelectingAegis = selectedCompany?.name === "Aegis AI";

  useEffect(() => {
    const internalRoles = ["admin", "superadmin", "technicien"];
    if (!isSelectingAegis && internalRoles.includes(formData.role)) {
      setFormData((prev) => ({ ...prev, role: "viewer" }));
    }
  }, [isSelectingAegis, formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/admin/users", formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const isAegisUser = ["superadmin", "admin"].includes(currentUser?.role || "");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0B0D13] border border-gray-800 rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
              Nouveau Collaborateur
            </h2>
            <p className="text-gray-500 font-bold">
              Ajoutez un nouvel utilisateur à votre organisation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase px-1">
                Choix de l'Entreprise
              </label>
              <select
                value={formData.company_id}
                onChange={(e) =>
                  setFormData({ ...formData, company_id: e.target.value })
                }
                disabled={!isAegisUser}
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-cyan-500 transition-all font-bold appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Sélectionnez une entreprise...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {currentUser?.role === "owner" && (
                <p className="text-[9px] text-cyan-500/60 font-medium px-1 italic">
                  Note: Le choix est restreint à votre entreprise actuelle.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase px-1">
                  Nom Complet
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Prénom Nom"
                  className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-cyan-500 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase px-1">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-cyan-500 transition-all font-bold"
                >
                  <option value="viewer">Lecteur (Viewer)</option>
                  <option value="operateur">Opérateur</option>
                  <option value="owner">Propriétaire (Owner)</option>
                  {isSelectingAegis && (
                    <>
                      <option value="technicien">Technicien</option>
                      {isAegisUser && (
                        <option value="admin">Administrateur</option>
                      )}
                      {currentUser?.role === "superadmin" && (
                        <option value="superadmin">SuperAdmin</option>
                      )}
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase px-1">
                Email
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@domain.com"
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-cyan-500 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase px-1">
                Mot de passe provisoire
              </label>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="8+ caractères"
                className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-cyan-500 transition-all font-bold"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 font-black text-sm">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className={cx(
                buttonRecipe({ variant: "primary", size: "lg" }),
                css({
                  w: "full",
                  py: "8!",
                  bg: "white!",
                  color: "black!",
                  _hover: { bg: "gray.200!" },
                }),
              )}
            >
              {loading ? (
                <Loader2
                  className={css({
                    animation: "spin 1s linear infinite",
                    w: "5",
                    h: "5",
                  })}
                />
              ) : (
                <UserPlus className={css({ w: "5", h: "5" })} />
              )}
              Créer le Collaborateur
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const SuccessModal: React.FC<{ data: any; onClose: () => void }> = ({
  data,
  onClose,
}) => (
  <div
    className={css({
      position: "fixed",
      inset: "0",
      zIndex: "120",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: "6",
      backdropBlur: "2xl",
      bg: "black/80",
    })}
  >
    <div
      className={css({
        position: "relative",
        w: "full",
        maxW: "3xl",
        bg: "bg.card",
        border: "1px solid",
        borderColor: "whiteAlpha.100",
        borderRadius: "3.5rem",
        p: "12",
        boxShadow: "2xl",
        animation: "zoomIn 0.5s ease-out",
      })}
    >
      <div className={css({ textAlign: "center", spaceY: "8" })}>
        <div
          className={flex({
            w: "24",
            h: "24",
            borderRadius: "2rem",
            bg: "emerald.500/10",
            border: "1px solid",
            borderColor: "emerald.500/20",
            align: "center",
            justify: "center",
            color: "emerald.400",
            mx: "auto",
          })}
        >
          <CheckCircle2 className={css({ w: "12", h: "12" })} />
        </div>
        <h2
          className={css({
            fontSize: "4xl",
            fontWeight: "900",
            color: "white",
            letterSpacing: "tight",
            textTransform: "uppercase",
          })}
        >
          Onboarding Réussi !
        </h2>
        <p className={css({ color: "gray.400", fontWeight: "bold" })}>
          L'entreprise{" "}
          <span className={css({ color: "emerald.400" })}>
            {data.company_name}
          </span>{" "}
          a été provisionnée.
        </p>

        <div className={css({ spaceY: "4", textAlign: "left" })}>
          <div
            className={css({
              bgGradient: "to-br",
              gradientFrom: "bg.main",
              gradientTo: "whiteAlpha.50",
              border: "1px solid",
              borderColor: "brand.primary/20",
              borderRadius: "3xl",
              p: "8",
              position: "relative",
              overflow: "hidden",
            })}
          >
            <h3
              className={flex({
                fontSize: "10px",
                fontWeight: "900",
                color: "brand.primary",
                textTransform: "uppercase",
                letterSpacing: "widest",
                mb: "2",
                align: "center",
                gap: "2",
              })}
            >
              <Terminal className={css({ w: "4", h: "4" })} /> Token de
              Déploiement
            </h3>
            <code
              className={css({
                fontSize: "xl",
                color: "white",
                fontFamily: "mono",
                display: "block",
                wordBreak: "break-all",
                mb: "6",
              })}
            >
              {data.deployment_token}
            </code>
            <button
              onClick={() =>
                navigator.clipboard.writeText(data.deployment_token)
              }
              className={cx(
                buttonRecipe({ variant: "primary" }),
                css({ w: "full", py: "4!" }),
              )}
            >
              <Copy className={css({ w: "4", h: "4" })} /> Copier le Token
            </button>
          </div>
          <div
            className={css({
              display: "grid",
              gridTemplateColumns: "2",
              gap: "4",
            })}
          >
            <div
              className={css({
                bg: "whiteAlpha.50",
                p: "4",
                borderRadius: "2xl",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
              })}
            >
              <p
                className={css({
                  fontSize: "9px",
                  fontWeight: "900",
                  color: "gray.500",
                  textTransform: "uppercase",
                  mb: "1",
                })}
              >
                ID Entreprise
              </p>
              <p
                className={css({
                  fontSize: "xs",
                  fontFamily: "mono",
                  color: "gray.300",
                  wordBreak: "break-all",
                })}
              >
                {data.company_id}
              </p>
            </div>
            <div
              className={css({
                bg: "whiteAlpha.50",
                p: "4",
                borderRadius: "2xl",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
              })}
            >
              <p
                className={css({
                  fontSize: "9px",
                  fontWeight: "900",
                  color: "gray.500",
                  textTransform: "uppercase",
                  mb: "1",
                })}
              >
                ID Propriétaire
              </p>
              <p
                className={css({
                  fontSize: "xs",
                  fontFamily: "mono",
                  color: "gray.300",
                  wordBreak: "break-all",
                })}
              >
                {data.owner_id}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className={css({
            w: "full",
            py: "5",
            bg: "whiteAlpha.100",
            _hover: { bg: "whiteAlpha.200" },
            color: "white",
            fontWeight: "900",
            borderRadius: "3xl",
            transition: "all",
            textTransform: "uppercase",
            letterSpacing: "widest",
            fontSize: "xs",
          })}
        >
          Terminer
        </button>
      </div>
    </div>
  </div>
);
