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
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";
import { RoleBadge } from "../components/ui/RoleBadge";
import { ProfileCircle } from "../components/ui/ProfileCircle";

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

  const fetchCompanies = useCallback(async (query: string = "") => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/companies?search=${query}`);
      setCompanies((prev) => {
        return (data || []).map((c: Company) => {
          const old = prev.find((pc) => pc.id === c.id);
          return {
            ...c,
            isExpanded: expandedIdsRef.current.has(c.id),
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
        setSearchParams({ search: searchQuery }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchCompanies, setSearchParams]);

  // Auto-refresh members for expanded companies when search query changes
  useEffect(() => {
    expandedIds.forEach((id) => {
      fetchMembers(id, searchQuery);
    });
  }, [searchQuery]);

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

  // RBAC Helpers
  const canCreateCompany = ["superadmin", "admin", "commercial"].includes(
    currentUser?.role || "",
  );
  const canCreateUser = ["superadmin", "admin", "owner"].includes(
    currentUser?.role || "",
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Équipes
          </h1>
          <p className="text-gray-500 font-bold text-lg max-w-xl leading-relaxed">
            Gérez vos entités clientes et les comptes collaborateurs directement
            depuis ce portail centralisé.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {canCreateUser && (
            <button
              onClick={() => setIsNewUserOpen(true)}
              className="px-6 py-3.5 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:bg-gray-200 transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs"
            >
              <UserPlus className="w-4 h-4" />
              Créer un Utilisateur
            </button>
          )}
          {canCreateCompany && (
            <button
              onClick={() => setIsNewCompanyOpen(true)}
              className="px-6 py-3.5 bg-cyan-600 text-white font-black rounded-2xl flex items-center gap-3 hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-widest text-xs"
            >
              <Building2 className="w-4 h-4" />
              Nouvelle Entreprise
            </button>
          )}
        </div>
      </div>

      {/* Global Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-500 group-focus-within:text-cyan-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une entreprise (Nom, ID) ou un collaborateur (Nom, Email, ID)..."
          className="w-full bg-[#0B0D13] border border-gray-800/60 text-white rounded-3xl pl-16 pr-8 py-6 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 transition-all font-bold placeholder:text-gray-700 shadow-2xl"
        />
      </div>

      {/* Hierarchical List */}
      <div className="space-y-4">
        {loading && !companies.length ? (
          <div className="py-20 flex flex-col items-center gap-4 text-gray-600">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-bold uppercase tracking-widest text-xs">
              Chargement des données...
            </p>
          </div>
        ) : companies.length === 0 ? (
          <div className="py-20 bg-[#0B0D13]/40 border border-dashed border-gray-800 rounded-[3rem] flex flex-col items-center gap-4 text-gray-600 italic">
            <Globe className="w-10 h-10 opacity-20" />
            <p>Aucun résultat correspondant à votre recherche.</p>
          </div>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              className={`bg-[#0B0D13] border transition-all duration-300 overflow-hidden ${
                company.isExpanded
                  ? "border-cyan-500/30 rounded-[2.5rem] shadow-2xl shadow-cyan-500/5"
                  : "border-gray-800/60 rounded-3xl hover:border-gray-700"
              }`}
            >
              <div
                onClick={() => toggleCompany(company.id)}
                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
              >
                <div className="flex items-center gap-6">
                  {company.avatar_url ? (
                    <ProfileCircle
                      size="md"
                      avatarUrl={company.avatar_url}
                      name={company.name}
                      className="rounded-2xl"
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        company.name === "Aegis AI"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/30"
                          : "bg-gray-900 text-gray-400 border border-gray-800"
                      }`}
                    >
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                        {company.name}
                      </h3>
                      {company.name === "Aegis AI" && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-cyan-400/20">
                          Root
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> {company.owner_email}
                      </span>
                      <span className="hidden md:inline text-gray-800">|</span>
                      <span className="flex items-center gap-1.5 font-mono opacity-50">
                        {company.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1 px-4 border-r border-gray-800/60">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      Token Aegis
                    </span>
                    <code className="text-xs text-amber-500/80 font-mono flex items-center gap-2">
                      {company.deployment_token?.substring(0, 12)}...
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(company.deployment_token);
                        }}
                        className="hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </code>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-900 group-hover:bg-cyan-500 group-hover:text-white text-gray-600 transition-all">
                    {company.isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Members List */}
              {company.isExpanded && (
                <div className="border-t border-gray-800/60 bg-black/20 p-8 pt-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      Collaborateurs{" "}
                      <span className="px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">
                        {company.members?.length || 0}
                      </span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {company.members ? (
                      company.members.map((member) => (
                        <div
                          key={member.id}
                          className="bg-gray-900/40 border border-gray-800/40 p-5 rounded-2xl flex items-center gap-4 group/user hover:border-cyan-500/30 transition-all"
                        >
                          <ProfileCircle
                            size="sm"
                            avatarUrl={member.avatar_url}
                            name={member.name}
                          />
                          <div className="space-y-1 my-auto flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-white truncate">
                                {member.name}
                              </span>
                              <RoleBadge role={member.role} showIcon={false} />
                            </div>
                            <p className="text-xs text-gray-500 font-bold truncate">
                              {member.email}
                            </p>
                            <code className="text-[9px] text-gray-700 font-mono block opacity-0 group-hover/user:opacity-100 transition-opacity">
                              ID: {member.id}
                            </code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(member.id)}
                            className="p-2 text-gray-700 hover:text-cyan-500 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 flex justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-800" />
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
const CreateCompanyModal: React.FC<{
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0B0D13] border border-gray-800 rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="space-y-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
              Nouvelle Entité Aegis
            </h2>
            <p className="text-gray-500 font-bold">
              Configurez une nouvelle entreprise et son compte propriétaire.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Entreprise
                </h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase px-1">
                    Nom de l'entité
                  </label>
                  <input
                    required
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    placeholder="ex: Global CyberSec Inc."
                    className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-cyan-500 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Propriétaire
                </h3>
                <div className="space-y-4">
                  <input
                    required
                    value={formData.owner_name}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_name: e.target.value })
                    }
                    placeholder="Nom complet"
                    className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-indigo-500 transition-all font-bold"
                  />
                  <input
                    required
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_email: e.target.value })
                    }
                    placeholder="Email professionnel"
                    className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-indigo-500 transition-all font-bold"
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
                    className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:border-indigo-500 transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3 font-black text-sm">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-3xl transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5 fill-current" />
              )}
              Finaliser l'Onboarding
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateUserModal: React.FC<{
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
                  <option value="technicien">Technicien</option>
                  <option value="owner">Propriétaire (Owner)</option>
                  {isAegisUser && <option value="admin">Administrateur</option>}
                  {currentUser?.role === "superadmin" && (
                    <option value="superadmin">SuperAdmin</option>
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
              className="w-full py-6 bg-white text-black font-black rounded-3xl transition-all shadow-xl hover:bg-gray-200 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              Créer le Collaborateur
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const SuccessModal: React.FC<{ data: any; onClose: () => void }> = ({
  data,
  onClose,
}) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80">
    <div className="relative w-full max-w-3xl bg-[#0B0D13] border border-gray-800 rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-8">
        <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase">
          Onboarding Réussi !
        </h2>
        <p className="text-gray-400 font-bold">
          L'entreprise{" "}
          <span className="text-emerald-400">{data.company_name}</span> a été
          provisionnée.
        </p>

        <div className="space-y-4 text-left">
          <div className="bg-gradient-to-br from-[#0B0D13] to-[#151921] border border-cyan-500/20 rounded-3xl p-8 relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Token de Déploiement
            </h3>
            <code className="text-xl text-white font-mono block break-all mb-6">
              {data.deployment_token}
            </code>
            <button
              onClick={() =>
                navigator.clipboard.writeText(data.deployment_token)
              }
              className="w-full py-4 bg-cyan-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-500 transition-all"
            >
              <Copy className="w-4 h-4" /> Copier le Token
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/60">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                ID Entreprise
              </p>
              <p className="text-xs font-mono text-gray-300 break-all">
                {data.company_id}
              </p>
            </div>
            <div className="bg-gray-900/40 p-4 rounded-2xl border border-gray-800/60">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-1">
                ID Propriétaire
              </p>
              <p className="text-xs font-mono text-gray-300 break-all">
                {data.owner_id}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-5 bg-gray-800 text-white font-black rounded-3xl transition-all uppercase tracking-widest text-xs"
        >
          Terminer
        </button>
      </div>
    </div>
  </div>
);
