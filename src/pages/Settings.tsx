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
  ArrowRight,
  Settings as SettingsIcon,
  ChevronRight,
  Smartphone,
  Globe,
  Database,
  History,
  Zap,
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
  const [name, setName] = useState(user?.name || "");
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
        setAuth(accessToken, { ...user, name, email });
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

  const getInitials = (n: string) => {
    if (!n) return "??";
    return n
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "securite", label: "Sécurité", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "facturation", label: "Facturation", icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-700">
      {/* Header with Glassmorphism Accent */}
      <div className="relative">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl mb-2">
              Paramètres
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              Personnalisez votre espace de travail, gérez vos identifiants et
              supervisez votre abonnement.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/20 border border-gray-700/30 rounded-2xl backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">
              Statut: Opérationnel
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation - Ultra Modern Glass Sidebar */}
        <aside className="lg:col-span-3">
          <nav className="flex lg:flex-col gap-2 p-1 bg-gray-950/20 border border-gray-800/40 rounded-3xl backdrop-blur-md sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${
                  activeTab === tab.id
                    ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.05)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    activeTab === tab.id ? "text-cyan-400" : "text-gray-500"
                  }`}
                />
                <span className="font-semibold tracking-wide">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="ml-auto">
                    <ChevronRight className="w-4 h-4 text-cyan-500" />
                  </div>
                )}
                {activeTab === tab.id && (
                  <div className="absolute left-0 w-1 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 min-h-[600px]">
          <div className="transition-all duration-500 ease-out">
            {activeTab === "profil" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                {/* Profile Overview Card */}
                <section className="bg-gradient-to-b from-[#11141D] to-[#0A0C12] border border-gray-800/80 rounded-3xl shadow-2xl overflow-hidden group">
                  <div className="h-24 bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-purple-600/20 relative">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                  </div>
                  <div className="px-10 pb-10 relative">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-12 mb-10">
                      <div className="relative group/avatar">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 border-4 border-[#0A0C12] shadow-2xl flex items-center justify-center text-3xl font-black text-white relative z-10">
                          {getInitials(name)}
                        </div>
                        <div className="absolute inset-0 rounded-3xl bg-cyan-400 blur-xl opacity-0 group-hover/avatar:opacity-20 transition-opacity duration-500" />
                      </div>
                      <div className="flex-1 pb-2">
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {name || "Aegis User"}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-400 font-medium">
                          <Mail className="w-4 h-4" />
                          {email}
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label
                            htmlFor="fullname"
                            className="text-sm font-bold text-gray-400 flex items-center gap-2 px-1"
                          >
                            <User className="w-4 h-4 text-cyan-500" />
                            NOM & PRÉNOM
                          </label>
                          <input
                            id="fullname"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-700"
                            placeholder="Ex: Jean Dupont"
                          />
                        </div>
                        <div className="space-y-3">
                          <label
                            htmlFor="email"
                            className="text-sm font-bold text-gray-400 flex items-center gap-2 px-1"
                          >
                            <Globe className="w-4 h-4 text-cyan-500" />
                            ADRESSE EMAIL
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 placeholder:text-gray-700"
                            placeholder="jean@example.com"
                          />
                        </div>
                      </div>

                      {profileMessage && (
                        <div
                          className={`p-5 rounded-2xl flex items-center gap-4 animate-in zoom-in-95 duration-300 ${
                            profileMessage.type === "success"
                              ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                              : "bg-red-500/5 border border-red-500/20 text-red-400"
                          }`}
                        >
                          {profileMessage.type === "success" ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <AlertCircle className="w-6 h-6" />
                          )}
                          <span className="font-semibold">
                            {profileMessage.text}
                          </span>
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          disabled={profileLoading}
                          className="group relative px-10 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-900/20 overflow-hidden"
                        >
                          <div className="relative z-10 flex items-center gap-3">
                            {profileLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            )}
                            Enregistrer les modifications
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                {/* Account Stats Mock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#11141D] border border-gray-800/60 p-6 rounded-3xl flex items-center gap-5 hover:border-gray-700 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <History className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Dernière Connexion
                      </p>
                      <p className="text-white font-bold">Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="bg-[#11141D] border border-gray-800/60 p-6 rounded-3xl flex items-center gap-5 hover:border-gray-700 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Stockage Utilisé
                      </p>
                      <p className="text-white font-bold">1.2 GB / 5 GB</p>
                    </div>
                  </div>
                  <div className="bg-[#11141D] border border-gray-800/60 p-6 rounded-3xl flex items-center gap-5 hover:border-gray-700 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Rôle Utilisateur
                      </p>
                      <p className="text-white font-bold capitalize">
                        {user?.role || "Viewer"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "securite" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                <section className="bg-[#11141D] border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
                  <div className="px-10 py-8 border-b border-gray-800/50 bg-gray-800/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Sécurité du Compte
                        </h2>
                        <p className="text-gray-500 text-sm">
                          Maintenez votre compte sécurisé avec un mot de passe
                          robuste.
                        </p>
                      </div>
                    </div>
                  </div>
                  <form
                    onSubmit={handleUpdatePassword}
                    className="p-10 space-y-10"
                  >
                    <div className="space-y-8 max-w-2xl">
                      <div className="space-y-3">
                        <label
                          htmlFor="old_password"
                          className="text-sm font-bold text-gray-400 flex items-center gap-2 px-1"
                        >
                          ANCIEN MOT DE PASSE
                        </label>
                        <input
                          id="old_password"
                          type="password"
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-700"
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label
                            htmlFor="new_password"
                            className="text-sm font-bold text-gray-400 px-1"
                          >
                            NOUVEAU MOT DE PASSE
                          </label>
                          <input
                            id="new_password"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-700"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-3">
                          <label
                            htmlFor="confirm_password"
                            className="text-sm font-bold text-gray-400 px-1"
                          >
                            CONFIRMATION
                          </label>
                          <input
                            id="confirm_password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-gray-700"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {/* Password Requirements Display */}
                      <div className="bg-gray-950/40 border border-gray-800 rounded-2xl p-6 space-y-4">
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                          Niveau de Sécurité Requis
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "8+ caractères",
                              valid: newPassword.length >= 8,
                            },
                            {
                              label: "Majuscule",
                              valid: /[A-Z]/.test(newPassword),
                            },
                            {
                              label: "Un chiffre",
                              valid: /[0-9]/.test(newPassword),
                            },
                            {
                              label: "Signe spécial",
                              valid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
                            },
                          ].map((req, rid) => (
                            <div key={rid} className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-all duration-500 ${
                                  req.valid
                                    ? "bg-emerald-500 shadow-emerald-500/50 scale-125"
                                    : "bg-gray-700"
                                }`}
                              />
                              <span
                                className={`text-xs font-bold transition-colors duration-500 ${
                                  req.valid
                                    ? "text-emerald-400"
                                    : "text-gray-600"
                                }`}
                              >
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {passwordMessage && (
                      <div
                        className={`p-5 rounded-2xl flex items-center gap-4 max-w-2xl animate-in zoom-in-95 duration-300 ${
                          passwordMessage.type === "success"
                            ? "bg-emerald-500/5 border border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/5 border border-red-500/20 text-red-400"
                        }`}
                      >
                        {passwordMessage.type === "success" ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <AlertCircle className="w-6 h-6" />
                        )}
                        <span className="font-semibold">
                          {passwordMessage.text}
                        </span>
                      </div>
                    )}

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-8 py-4 bg-white text-gray-950 hover:bg-gray-200 disabled:opacity-50 font-black rounded-2xl transition-all shadow-xl shadow-white/5 flex items-center gap-3"
                      >
                        {passwordLoading && (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        )}
                        Mettre à jour le mot de passe
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                <section className="bg-[#11141D] border border-gray-800 rounded-3xl shadow-xl overflow-hidden p-10">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Centre de Notifications
                        </h2>
                        <p className="text-gray-500 text-sm italic">
                          Gérez vos préférences d'alertes.
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Prévisualisation
                    </div>
                  </div>

                  <div className="space-y-10">
                    {[
                      {
                        icon: Mail,
                        title: "Alertes par Email",
                        desc: "Soyez informé des vulnérabilités critiques via votre boîte mail.",
                        enabled: true,
                      },
                      {
                        icon: Smartphone,
                        title: "Notifications Push",
                        desc: "Alertes instantanées sur vos appareils mobiles et bureau.",
                        enabled: false,
                      },
                      {
                        icon: Shield,
                        title: "Rapports Hebdomadaires",
                        desc: "Un digest complet de votre posture de sécurité chaque lundi.",
                        enabled: true,
                      },
                    ].map((notif, nid) => (
                      <div
                        key={nid}
                        className="flex items-center justify-between p-6 bg-gray-900/30 rounded-2xl border border-gray-800/40 hover:border-gray-800 transition-colors group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-gray-800/50 flex items-center justify-center text-gray-500 group-hover:text-cyan-400 transition-colors">
                            <notif.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">
                              {notif.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {notif.desc}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-500 ${
                            notif.enabled ? "bg-cyan-500" : "bg-gray-800"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                              notif.enabled ? "translate-x-8" : "translate-x-1"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "facturation" && (
              <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
                <section className="bg-gradient-to-br from-[#11141D] to-[#0A0C12] border border-gray-800 rounded-3xl shadow-xl overflow-hidden p-10 flex flex-col md:flex-row gap-10">
                  <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          Plan & Facturation
                        </h2>
                        <p className="text-gray-500 text-sm">
                          Gérez votre abonnement Aegis AI.
                        </p>
                      </div>
                    </div>

                    <div className="p-8 bg-gradient-to-r from-purple-600/10 to-transparent border border-purple-500/20 rounded-3xl relative overflow-hidden group">
                      <div className="relative z-10">
                        <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4">
                          PLAN ACTUEL
                        </div>
                        <div className="text-4xl font-black text-white mb-2">
                          PRO{" "}
                          <span className="text-lg font-normal text-gray-500">
                            / mois
                          </span>
                        </div>
                        <p className="text-gray-400 mb-8 max-w-xs leading-relaxed">
                          Accès complet aux scans par IA, rapports illimités et
                          support prioritaire 24/7.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Link
                            to="/billing"
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center gap-2"
                          >
                            Gérer l'abonnement
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <div className="px-6 py-3 bg-white/5 border border-white/5 text-gray-300 font-bold rounded-2xl cursor-not-allowed">
                            Changer de plan
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-5 scale-150 rotate-12 group-hover:opacity-10 group-hover:scale-175 transition-all duration-1000">
                        <Zap className="w-48 h-48 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-80 space-y-6">
                    <div className="bg-gray-950/20 border border-gray-800/60 rounded-3xl p-8 space-y-6">
                      <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <SettingsIcon className="w-4 h-4 text-cyan-500" />
                        PROCHAIN PRÉLÈVEMENT
                      </h4>
                      <div>
                        <p className="text-3xl font-black text-white">$49.00</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Prévu pour le 1 Mai 2026
                        </p>
                      </div>
                      <div className="h-px bg-gray-800" />
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Moyen de paiement
                          </span>
                          <span className="text-white font-bold">
                            •••• 4242
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">
                            Dernière facture
                          </span>
                          <span className="text-cyan-400 font-bold underline cursor-pointer">
                            PDF #812
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
