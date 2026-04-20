import React, { useState } from "react";
import {
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";

export const Settings: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const accessToken = useAuthStore((s) => s.accessToken);

  // Profile Form State
  const [name, setName] = useState(user?.email.split("@")[0] || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);

    try {
      // 1. Update Name
      await api.put("/users/me/profile", { name });

      // 2. Update Email (if changed)
      if (email !== user?.email) {
        await api.put("/users/me/email", { new_email: email });
      }

      // Update local store
      if (user && accessToken) {
        setAuth(accessToken, { ...user, email });
      }

      setProfileMessage({
        type: "success",
        text: "Profil mis à jour avec succès.",
      });
    } catch (err: any) {
      setProfileMessage({
        type: "error",
        text: err.response?.data?.error || "Erreur lors de la mise à jour.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put("/users/me/password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({
        type: "success",
        text: "Mot de passe modifié avec succès.",
      });
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err.response?.data?.error || "Ancien mot de passe incorrect.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Paramètres
        </h1>
        <p className="text-gray-400">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

      {/* Profile Section */}
      <section className="bg-[#0B0D13]/60 border border-gray-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="px-8 py-6 border-b border-gray-800/60 bg-gray-800/10 flex items-center gap-3">
          <User className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-semibold text-white">
            Informations du Profil
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Nom Complet
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="jean@example.com"
                />
              </div>
            </div>
          </div>

          {profileMessage && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
                profileMessage.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {profileMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm font-medium">{profileMessage.text}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2"
            >
              {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </section>

      {/* Security Section */}
      <section className="bg-[#0B0D13]/60 border border-gray-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="px-8 py-6 border-b border-gray-800/60 bg-gray-800/10 flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">
            Sécurité du Compte
          </h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
          <div className="space-y-2 max-w-md">
            <label className="text-sm font-medium text-gray-400 ml-1">
              Ancien Mot de Passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-gray-600" />
              </div>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Nouveau Mot de Passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-600" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">
                Confirmer le Mot de Passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-600" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
                passwordMessage.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm font-medium">{passwordMessage.text}</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-6 py-3 bg-gray-100 hover:bg-white text-gray-900 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Modifier le mot de passe
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
