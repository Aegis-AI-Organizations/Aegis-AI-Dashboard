import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Get the intended destination from the router state (provided by ProtectedRoute)
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.access_token, data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Identifiants incorrects. Veuillez réessayer.");
      } else {
        setError("Une erreur est survenue lors de la connexion.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] px-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-lg shadow-cyan-500/5">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            AEGIS AI
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Plateforme de Cybersécurité Offensive
          </p>
        </div>

        <div className="bg-[#0B0D13] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/40" />

          <h2 className="text-xl font-semibold text-white mb-6">Connexion</h2>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-200 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#13151A] border border-gray-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
                  placeholder="admin@aegis.ai"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1"
                htmlFor="password"
              >
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#13151A] border border-gray-800 text-white text-sm rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se Connecter"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800/50 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-blue-200/70 leading-relaxed font-medium">
                  Difficulté d'accès ? Contactez votre administrateur système
                  via la console de management.
                </p>
                <a
                  href="mailto:help@aegis-ai.com"
                  className="text-[10px] text-cyan-400 hover:underline font-bold mt-1 inline-block"
                >
                  SUPPORT: HELP@AEGIS-AI.COM
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-600 font-medium">
          &copy; 2026 Aegis AI. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
