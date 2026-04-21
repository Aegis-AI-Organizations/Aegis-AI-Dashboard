import React, { useState } from "react";
import {
  Building2,
  UserPlus,
  Mail,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Copy,
  Terminal,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../api/Axios";

export const Administration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{
    company_id: string;
    owner_id: string;
    deployment_token: string;
    company_name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/companies/onboard", {
        company_name: companyName,
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_password: ownerPassword,
      });
      setSuccessData({
        ...data,
        company_name: companyName,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'onboarding");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (successData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Onboarding Réussi !
            </h1>
            <p className="text-gray-400 font-bold max-w-md mx-auto">
              L'entreprise{" "}
              <span className="text-emerald-400">
                {successData.company_name}
              </span>{" "}
              a été créée avec succès.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Identifiants */}
          <div className="bg-[#0B0D13] border border-gray-800/60 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-500" /> Informations
              Client
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/40 rounded-2xl border border-gray-800/40 group">
                <p className="text-[10px] font-black text-gray-600 uppercase mb-1">
                  ID Entreprise
                </p>
                <div className="flex items-center justify-between">
                  <code className="text-cyan-400 font-mono text-sm break-all">
                    {successData.company_id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(successData.company_id)}
                    className="text-gray-500 hover:text-white p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-900/40 rounded-2xl border border-gray-800/40">
                <p className="text-[10px] font-black text-gray-600 uppercase mb-1">
                  ID Propriétaire
                </p>
                <div className="flex items-center justify-between">
                  <code className="text-gray-300 font-mono text-sm break-all">
                    {successData.owner_id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(successData.owner_id)}
                    className="text-gray-500 hover:text-white p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Token de Déploiement */}
          <div className="bg-gradient-to-br from-[#0B0D13] to-[#151921] border border-cyan-500/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] group-hover:bg-cyan-500/20 transition-all" />
            <h2 className="text-xs font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Token de Déploiement
            </h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed">
              Ce token est nécessaire pour l'installation de la sonde Rust
              (Aegis Agent).
              <span className="text-amber-500/80 font-bold block mt-2">
                Attention : Gardez-le précieusement.
              </span>
            </p>
            <div className="p-5 bg-black/40 rounded-2xl border border-cyan-500/30 flex flex-col gap-3">
              <code className="text-white font-mono text-lg break-all">
                {successData.deployment_token}
              </code>
              <button
                onClick={() => copyToClipboard(successData.deployment_token)}
                className="w-full py-3 bg-cyan-500 text-white font-black rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all text-xs"
              >
                <Copy className="w-3.5 h-3.5" /> Copier le token
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => setSuccessData(null)}
          className="w-full py-5 bg-gray-800/20 hover:bg-gray-800/40 text-gray-400 font-black rounded-[2rem] transition-all uppercase tracking-[0.2em] text-xs border border-gray-800/40"
        >
          Créer un autre Client
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="space-y-4">
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Administration
        </h1>
        <p className="text-gray-500 font-bold text-lg max-w-2xl leading-relaxed">
          Bienvenue dans le portail d'onboarding Aegis. Créez manuellement les
          entités entreprises et les comptes propriétaires pour vos nouveaux
          clients.
        </p>
      </div>

      <div className="bg-[#0B0D13] border border-gray-800/60 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <form onSubmit={handleOnboard} className="relative z-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left: Company Details */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-cyan-500 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs">
                  Entreprise
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ex: Global CyberSec Inc."
                    className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold placeholder:text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Right: Owner Details */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 text-indigo-500 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-black uppercase tracking-widest text-xs">
                  Propriétaire (Owner)
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <input
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-gray-700"
                    />
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                    Email professionnel
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="client@entreprise.com"
                      className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-gray-700"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                    Mot de passe initial
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold placeholder:text-gray-700"
                    />
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500 text-sm font-black">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-3xl transition-all shadow-2xl shadow-cyan-500/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative z-10 flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-white" />
                  Finaliser l'Onboarding
                </>
              )}
            </div>
          </button>
        </form>
      </div>

      {/* Helper Footer */}
      <div className="flex items-center justify-center gap-10 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <Building2 className="w-8 h-8 text-gray-500" />
        <div className="h-4 w-px bg-gray-800" />
        <UserPlus className="w-8 h-8 text-gray-500" />
        <div className="h-4 w-px bg-gray-800" />
        <Terminal className="w-8 h-8 text-gray-500" />
      </div>
    </div>
  );
};
