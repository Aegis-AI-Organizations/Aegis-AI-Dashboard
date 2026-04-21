import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Shield,
  Mail,
  Lock,
  Loader2,
  Bell,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  Camera,
  History,
  Database,
} from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";
import { getPasswordError } from "../utils/validation";
import { ProfileCircle } from "../components/ui/ProfileCircle";

type SettingsTab = "profil" | "securite" | "notifications" | "facturation";

export const Settings: React.FC = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil");

  // Local Form States - Starting empty as requested
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Separate password states for confirming changes
  const [currentPasswordName, setCurrentPasswordName] = useState("");
  const [currentPasswordEmail, setCurrentPasswordEmail] = useState("");

  // Sync avatar only (name and email are only for new inputs now)
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  // Status states
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setNameMessage({ type: "error", text: "Image trop lourde (max 20MB)" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setAvatarUrl(base64String);
      try {
        await api.put("/users/me/profile", {
          name: user?.name || "",
          avatar_url: base64String,
        });
        if (accessToken && user) {
          setAuth(accessToken, { ...user, avatar_url: base64String });
        }
      } catch (err) {
        console.error("Avatar save failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameMessage({ type: "error", text: "Le nom ne peut pas être vide" });
      return;
    }

    setNameLoading(true);
    setNameMessage(null);
    try {
      // 1. Verify password independently
      await api.post("/auth/login", {
        email: user?.email,
        password: currentPasswordName,
      });

      // 2. Perform strictly the profile update
      await api.put("/users/me/profile", {
        name,
        avatar_url: avatarUrl,
      });

      // 3. Refresh user data
      try {
        const { data: freshUser } = await api.get("/auth/me");
        if (accessToken) setAuth(accessToken, freshUser);
      } catch {
        if (accessToken && user)
          setAuth(accessToken, { ...user, name, avatar_url: avatarUrl });
      }

      setNameMessage({ type: "success", text: "Profil mis à jour" });
      setName("");
      setCurrentPasswordName("");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setNameMessage({ type: "error", text: "Mot de passe incorrect" });
      } else {
        setNameMessage({
          type: "error",
          text: err.response?.data?.error || "Erreur de sauvegarde",
        });
      }
    } finally {
      setNameLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || email === user?.email) {
      setEmailMessage({
        type: "error",
        text: "Veuillez entrer une adresse différente",
      });
      return;
    }

    setEmailLoading(true);
    setEmailMessage(null);
    try {
      // 1. Verify password independently
      await api.post("/auth/login", {
        email: user?.email,
        password: currentPasswordEmail,
      });

      // 2. Perform the update
      await api.put("/users/me/email", { email });

      // 3. Refresh user data
      try {
        const { data: freshUser } = await api.get("/auth/me");
        if (accessToken) setAuth(accessToken, freshUser);
      } catch {
        if (accessToken && user) setAuth(accessToken, { ...user, email });
      }

      setEmailMessage({ type: "success", text: "Email mis à jour" });
      setEmail("");
      setCurrentPasswordEmail("");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setEmailMessage({ type: "error", text: "Mot de passe incorrect" });
      } else {
        setEmailMessage({
          type: "error",
          text:
            err.response?.data?.error ||
            "Erreur lors de la mise à jour de l'email",
        });
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = getPasswordError(newPassword);
    if (error) {
      setPasswordMessage({ type: "error", text: error });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Mots de passe différents" });
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
      setPasswordMessage({ type: "success", text: "Mot de passe modifié" });
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: "Ancien mot de passe invalide",
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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Paramètres
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-xl leading-relaxed">
            Gérez votre identité numérique, sécurisez votre accès et configurez
            vos préférences Aegis AI.
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
            Connecté en tant que {user?.role}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Modern Sidebar Tabs */}
        <aside className="lg:w-72 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 p-1.5 bg-gray-900/40 border border-gray-800/60 rounded-[2.5rem] overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] transition-all duration-300 min-w-max ${
                  activeTab === tab.id
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 ${
                    activeTab === tab.id ? "scale-110" : ""
                  }`}
                />
                <span className="text-sm font-black uppercase tracking-widest">
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
          {activeTab === "profil" && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-[#0B0D13] border border-gray-800/60 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10 transition-all duration-500">
                  {/* Interactive Avatar */}
                  <div
                    className="relative group/avatar cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ProfileCircle
                      size="xl"
                      className="ring-8 ring-gray-900/50 group-hover/avatar:ring-cyan-500/20 transition-all duration-500"
                    />
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 rounded-2xl transition-all duration-300 backdrop-blur-[2px]">
                      <Camera className="w-10 h-10 text-white animate-in zoom-in-50 duration-300" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-4xl font-black text-white tracking-tight">
                        {user?.name || "Aegis User"}
                      </h2>
                      <p className="text-gray-500 font-bold tracking-wide uppercase text-sm">
                        {user?.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="px-4 py-1.5 bg-gray-800/60 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-700/50">
                        {user?.role}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />{" "}
                        Modifier la photo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Name Update Form */}
                  <form
                    onSubmit={handleUpdateName}
                    className="space-y-6 bg-gray-900/20 p-8 rounded-[2rem] border border-gray-800/40 shadow-inner"
                  >
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="name"
                          className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-cyan-500" /> Nouveau
                          nom
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nouveau nom complet"
                          className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-3">
                        <label
                          htmlFor="currentPasswordName"
                          className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5 text-cyan-500" /> Mot de
                          passe actuel
                        </label>
                        <input
                          id="currentPasswordName"
                          type="password"
                          required
                          value={currentPasswordName}
                          onChange={(e) =>
                            setCurrentPasswordName(e.target.value)
                          }
                          placeholder="Obligatoire pour valider"
                          className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold"
                        />
                      </div>
                    </div>

                    {nameMessage && (
                      <div
                        className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                          nameMessage.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {nameMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}{" "}
                        {nameMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={nameLoading}
                      className="relative w-full py-5 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-500 text-cyan-500 hover:text-white font-black rounded-2xl transition-all group overflow-hidden uppercase tracking-widest text-xs mt-2"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-3">
                        {nameLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        ) : (
                          <Zap className="w-4 h-4 shrink-0" />
                        )}
                        Enregistrer le nom
                      </div>
                    </button>
                  </form>

                  {/* Email Update Form */}
                  <form
                    onSubmit={handleUpdateEmail}
                    className="space-y-6 bg-gray-900/20 p-8 rounded-[2rem] border border-gray-800/40 shadow-inner"
                  >
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label
                          htmlFor="email"
                          className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2"
                        >
                          <Mail className="w-3.5 h-3.5 text-cyan-500" />{" "}
                          Nouvelle adresse email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nouvelle.adresse@aegis.com"
                          className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold"
                        />
                      </div>

                      <div className="space-y-3">
                        <label
                          htmlFor="currentPasswordEmail"
                          className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5 text-cyan-500" /> Mot de
                          passe actuel
                        </label>
                        <input
                          id="currentPasswordEmail"
                          type="password"
                          required
                          value={currentPasswordEmail}
                          onChange={(e) =>
                            setCurrentPasswordEmail(e.target.value)
                          }
                          placeholder="Obligatoire pour valider"
                          className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all font-bold"
                        />
                      </div>
                    </div>

                    {emailMessage && (
                      <div
                        className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                          emailMessage.type === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {emailMessage.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}{" "}
                        {emailMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className="w-full py-5 bg-cyan-600/10 hover:bg-cyan-600 border border-cyan-500/30 hover:border-cyan-500 text-cyan-500 hover:text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs mt-2"
                    >
                      <div className="flex items-center justify-center gap-3">
                        {emailLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        ) : (
                          <Zap className="w-4 h-4 shrink-0" />
                        )}
                        Mettre à jour l'identifiant
                      </div>
                    </button>
                  </form>
                </div>
              </div>

              {/* Fast Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    label: "Dernière Connexion",
                    value: "A l'instant",
                    icon: History,
                    color: "text-amber-500",
                  },
                  {
                    label: "Stockage Profil",
                    value: "Vérification...",
                    icon: Database,
                    color: "text-purple-500",
                  },
                  {
                    label: "Rôle Actuel",
                    value: user?.role || "Chargement...",
                    icon: Shield,
                    color: "text-cyan-500",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-[#0B0D13] border border-gray-800/60 p-6 rounded-[2rem] flex items-center gap-5 hover:bg-gray-800/20 transition-all group"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${stat.color.replace(
                        "text-",
                        "bg-",
                      )}/10 flex items-center justify-center ${stat.color}`}
                    >
                      <stat.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {stat.label}
                      </p>
                      <p className="text-white font-bold tracking-tight">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "securite" && (
            <div className="space-y-6">
              <section className="bg-[#0B0D13] border border-gray-800/60 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none" />

                <div className="flex items-center gap-6 mb-12 border-b border-gray-800/40 pb-8">
                  <div className="p-4 bg-amber-500/10 rounded-3xl text-amber-500 ring-1 ring-amber-500/20">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                      Sécurité du Compte
                    </h2>
                    <p className="text-gray-500 font-medium">
                      Renforcez votre protection avec un mot de passe complexe.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-12">
                  <div className="grid grid-cols-1 gap-10 max-w-2xl">
                    <div className="space-y-3">
                      <label
                        htmlFor="oldPassword"
                        className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2"
                      >
                        Mot de passe actuel
                      </label>
                      <input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold placeholder:text-gray-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label
                          htmlFor="newPassword"
                          className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2"
                        >
                          Nouveau mot de passe
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="8+ caractères"
                          className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold placeholder:text-gray-800"
                        />
                      </div>
                      <div className="space-y-3">
                        <label
                          htmlFor="confirmPassword"
                          className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] px-2"
                        >
                          Confirmation
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Répétez le mot de passe"
                          className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold placeholder:text-gray-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sleek Password Complexity Bar */}
                  <div className="bg-gray-900/30 border border-gray-800/40 rounded-3xl p-8 max-w-2xl space-y-6">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
                      <Shield className="w-3.5 h-3.5" /> Exigences de sécurité
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: "8+ symb.", valid: newPassword.length >= 8 },
                        {
                          label: "Majuscule",
                          valid: /[A-Z]/.test(newPassword),
                        },
                        { label: "Chiffre", valid: /[0-9]/.test(newPassword) },
                        {
                          label: "Spécial",
                          valid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
                        },
                      ].map((req, rid) => (
                        <div
                          key={rid}
                          className="flex flex-col items-center gap-3 group"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                              req.valid
                                ? "bg-emerald-400 scale-150 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                                : "bg-gray-800 group-hover:bg-gray-700"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-black uppercase tracking-tighter ${
                              req.valid ? "text-emerald-400" : "text-gray-600"
                            }`}
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {passwordMessage && (
                    <div
                      className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold max-w-2xl ${
                        passwordMessage.type === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {passwordMessage.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}{" "}
                      {passwordMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-10 py-5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-3xl transition-all shadow-xl shadow-amber-500/10 uppercase tracking-widest text-xs flex items-center gap-3"
                  >
                    {passwordLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Mettre à jour la sécurité
                  </button>
                </form>
              </section>
            </div>
          )}

          {(activeTab === "notifications" || activeTab === "facturation") && (
            <div className="flex flex-col items-center justify-center p-20 bg-[#0B0D13] border border-gray-800/60 rounded-[3rem] space-y-6">
              <Zap className="w-16 h-16 text-cyan-500/20 animate-pulse" />
              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-widest">
                  Bientôt Disponible
                </h3>
                <p className="text-gray-500 font-medium">
                  Cette section est en cours de développement.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
