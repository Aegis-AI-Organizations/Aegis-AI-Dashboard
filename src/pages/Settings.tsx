import React, { useState } from "react";
import {
  User,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bell,
  CreditCard,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";
import { getPasswordError } from "../utils/validation";

type SettingsTab = "profil" | "securite" | "notifications" | "facturation";

export const Settings: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil");

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
      await api.put("/users/me/profile", { name });
      if (email !== user?.email) {
        await api.put("/users/me/email", { new_email: email });
      }
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

    // Complexity Validation
    const complexityError = getPasswordError(newPassword);
    if (complexityError) {
      setPasswordMessage({ type: "error", text: complexityError });
      return;
    }

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

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "securite", label: "Sécurité", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "facturation", label: "Facturation", icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Paramètres
        </h1>
        <p className="text-gray-400">
          Gérez votre compte et vos préférences de sécurité.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation - Sidebar on Desktop / Horizontal on Mobile */}
        <nav className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide border-b lg:border-b-0 lg:border-r border-gray-800/40 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap group ${
                activeTab === tab.id
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5 font-semibold"
                  : "text-gray-400 hover:bg-gray-800/40 hover:text-gray-200"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 ${
                  activeTab === tab.id
                    ? "text-cyan-400"
                    : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {tab.label}
              {activeTab === tab.id && (
                <div className="ml-auto block lg:hidden">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 w-full min-h-[500px]">
          {activeTab === "profil" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
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
                      <label
                        htmlFor="fullname"
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1"
                      >
                        Nom Complet
                      </label>
                      <input
                        id="fullname"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1"
                      >
                        Email
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-cyan-500 transition-all"
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
                      <p className="text-sm font-medium">
                        {profileMessage.text}
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2"
                  >
                    {profileLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Enregistrer les modifications
                  </button>
                </form>
              </section>
            </div>
          )}

          {activeTab === "securite" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <section className="bg-[#0B0D13]/60 border border-gray-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                <div className="px-8 py-6 border-b border-gray-800/60 bg-gray-800/10 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Changer le Mot de Passe
                  </h2>
                </div>
                <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
                  <div className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                      <label
                        htmlFor="old_password"
                        className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1"
                      >
                        Ancien Mot de Passe
                      </label>
                      <input
                        id="old_password"
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="new_password"
                          className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1"
                        >
                          Nouveau Mot de Passe
                        </label>
                        <input
                          id="new_password"
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="confirm_password"
                          className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1"
                        >
                          Confirmation
                        </label>
                        <input
                          id="confirm_password"
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#13151A] border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-800/10 border border-gray-800/60">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        Exigences de sécurité
                      </h4>
                      <ul className="space-y-2">
                        <li
                          className={`flex items-center gap-2 text-xs ${
                            newPassword.length >= 8
                              ? "text-emerald-400"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              newPassword.length >= 8
                                ? "bg-emerald-400"
                                : "bg-gray-600"
                            }`}
                          />
                          Minimum 8 caractères
                        </li>
                        <li
                          className={`flex items-center gap-2 text-xs ${
                            /[A-Z]/.test(newPassword)
                              ? "text-emerald-400"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[A-Z]/.test(newPassword)
                                ? "bg-emerald-400"
                                : "bg-gray-600"
                            }`}
                          />
                          Une majuscule
                        </li>
                        <li
                          className={`flex items-center gap-2 text-xs ${
                            /[0-9]/.test(newPassword)
                              ? "text-emerald-400"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[0-9]/.test(newPassword)
                                ? "bg-emerald-400"
                                : "bg-gray-600"
                            }`}
                          />
                          Un chiffre
                        </li>
                        <li
                          className={`flex items-center gap-2 text-xs ${
                            /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                              ? "text-emerald-400"
                              : "text-gray-500"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                                ? "bg-emerald-400"
                                : "bg-gray-600"
                            }`}
                          />
                          Un caractère spécial
                        </li>
                      </ul>
                    </div>
                  </div>

                  {passwordMessage && (
                    <div
                      className={`p-4 rounded-xl flex items-center gap-3 max-w-lg ${
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
                      <p className="text-sm font-medium">
                        {passwordMessage.text}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-3 bg-white text-[#050810] hover:bg-gray-200 disabled:opacity-50 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 border border-white/10"
                  >
                    {passwordLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Modifier le mot de passe
                  </button>
                </form>
              </section>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <section className="bg-[#0B0D13]/60 border border-gray-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
                  <Bell className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Centre de Notifications
                </h2>
                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                  Paramétrez vos alertes par email et push pour ne rater aucune
                  activité critique.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
                  Bientôt disponible
                </div>
              </section>
            </div>
          )}

          {activeTab === "facturation" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <section className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border border-gray-800/60 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl p-12 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-6">
                  <CreditCard className="w-8 h-8 text-cyan-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Gestion de la Facturation
                </h2>
                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                  Consultez votre abonnement, vos factures et les statistiques
                  d'utilisation globales.
                </p>
                <Link
                  to="/billing"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-900/40"
                >
                  Ouvrir le portail de facturation
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
