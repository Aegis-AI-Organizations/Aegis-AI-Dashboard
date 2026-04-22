import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Building2,
  UserPlus,
  History,
  Info,
  Calendar,
  User,
  Activity,
  ArrowRight,
  Loader2,
  AlertCircle,
  Copy,
  Download,
} from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";
import { RoleBadge } from "../components/ui/RoleBadge";
import { ProfileCircle } from "../components/ui/ProfileCircle";

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

export const Administration: React.FC = () => {
  const { user: currentUser } = useAuthStore();
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

  const parseDetails = (detailsStr: string) => {
    try {
      return JSON.parse(detailsStr);
    } catch (e) {
      return detailsStr;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATE"))
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (action.includes("START"))
      return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    if (action.includes("STOP") || action.includes("DELETE"))
      return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Administration
          </h1>
          <p className="text-gray-500 font-bold text-lg max-w-xl leading-relaxed">
            Centre de contrôle global du système. Gérez les entités et
            surveillez les actions critiques via l'Audit Trail.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => (window.location.href = "/users?action=new-user")}
            className="px-6 py-3.5 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:bg-gray-200 transition-all shadow-xl shadow-white/5 uppercase tracking-widest text-xs"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau Collaborateur
          </button>
          <button
            onClick={() => (window.location.href = "/users?action=new-company")}
            className="px-6 py-3.5 bg-cyan-600 text-white font-black rounded-2xl flex items-center gap-3 hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-widest text-xs"
          >
            <Building2 className="w-4 h-4" />
            Nouvelle Entreprise
          </button>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <History className="w-4 h-4" /> Journal d'Audit (Audit Trail)
          </h2>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-600">
            <span>Total: {total} logs</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="p-2 hover:text-white disabled:opacity-30 transition-colors"
              >
                Précédent
              </button>
              <span className="text-gray-400">
                {Math.floor(offset / limit) + 1} /{" "}
                {Math.ceil(total / limit) || 1}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="p-2 hover:text-white disabled:opacity-30 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0B0D13] border border-gray-800/60 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800/60 bg-black/20">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Date & Heure
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Acteur
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Action
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Cible
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    IP Address
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={6}
                        className="px-8 py-6 h-16 bg-gray-900/10"
                      ></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-8 py-20 text-center text-gray-600 italic"
                    >
                      Aucune activité enregistrée dans le journal.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-300">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-black text-gray-600 uppercase">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white font-mono">
                              {log.user_id.substring(0, 8)}...
                            </span>
                            <span className="text-[9px] font-bold text-gray-600 uppercase">
                              SuperAdmin
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getActionColor(
                            log.action,
                          )}`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-400">
                            {log.target_type}
                          </span>
                          <span className="text-[10px] font-mono text-gray-600">
                            {log.target_id.substring(0, 12)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-mono text-gray-500">
                          {log.ip_address || "Internal"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          className="p-2 text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all"
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
                          <Info className="w-4 h-4" />
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
