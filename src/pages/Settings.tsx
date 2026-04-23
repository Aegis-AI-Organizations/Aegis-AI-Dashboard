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
  Trash2,
  Copy,
} from "lucide-react";
import { useAuthStore } from "../store/AuthStore";
import { api } from "../api/Axios";
import { getPasswordError } from "../utils/validation";
import { ProfileCircle } from "../components/ui/ProfileCircle";
import { PasswordPromptModal } from "../components/ui/PasswordPromptModal";
import { RoleBadge } from "../components/ui/RoleBadge";
import { css, cx } from "styled-system/css";
import { flex, grid, circle } from "styled-system/patterns";
import { card } from "styled-system/recipes";

type SettingsTab = "profil" | "securite" | "notifications" | "facturation";

export const Settings: React.FC = () => {
  const { user, setAuth, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profil");

  // Local Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPhotoOptionsOpen, setIsPhotoOptionsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"name" | "email" | null>(
    null,
  );

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
    setIsPhotoOptionsOpen(false);
  };

  const handleDeletePhoto = async () => {
    try {
      await api.delete("/users/me/profile/avatar");
      setAvatarUrl("");
      if (accessToken && user) {
        setAuth(accessToken, { ...user, avatar_url: "" });
      }
      setIsPhotoOptionsOpen(false);
    } catch (err) {
      console.error("Avatar deletion failed", err);
    }
  };

  const handleUpdateNameInit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameMessage({ type: "error", text: "Le nom ne peut pas être vide" });
      return;
    }
    setPendingAction("name");
    setIsPasswordModalOpen(true);
  };

  const handleUpdateEmailInit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || email === user?.email) {
      setEmailMessage({
        type: "error",
        text: "Veuillez entrer une adresse différente",
      });
      return;
    }
    setPendingAction("email");
    setIsPasswordModalOpen(true);
  };

  const loadUpdateName = async (password: string) => {
    setNameLoading(true);
    setNameMessage(null);
    try {
      await api.post("/auth/login", {
        email: user?.email,
        password: password,
      });

      await api.put("/users/me/profile", {
        name,
        avatar_url: avatarUrl,
      });

      try {
        const { data: freshUser } = await api.get("/auth/me");
        if (accessToken) setAuth(accessToken, freshUser);
      } catch {
        if (accessToken && user)
          setAuth(accessToken, { ...user, name, avatar_url: avatarUrl });
      }

      setNameMessage({ type: "success", text: "Profil mis à jour" });
      setName("");
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

  const loadUpdateEmail = async (password: string) => {
    setEmailLoading(true);
    setEmailMessage(null);
    try {
      await api.post("/auth/login", {
        email: user?.email,
        password: password,
      });

      await api.put("/users/me/email", { email });

      try {
        const { data: freshUser } = await api.get("/auth/me");
        if (accessToken) setAuth(accessToken, freshUser);
      } catch {
        if (accessToken && user) setAuth(accessToken, { ...user, email });
      }

      setEmailMessage({ type: "success", text: "Email mis à jour" });
      setEmail("");
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

  const handleModalSubmit = (password: string) => {
    setIsPasswordModalOpen(false);
    if (pendingAction === "name") {
      loadUpdateName(password);
    } else if (pendingAction === "email") {
      loadUpdateEmail(password);
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
    <div
      className={css({
        maxWidth: "6xl",
        mx: "auto",
        px: "4",
        py: "8",
      })}
    >
      {/* Premium Header */}
      <div
        className={flex({
          mb: "12",
          direction: { base: "column", md: "row" },
          justify: "space-between",
          align: { base: "start", md: "end" },
          gap: "6",
        })}
      >
        <div className={css({ "& > * + *": { mt: "2" } })}>
          <h1
            className={css({
              fontSize: "5xl",
              fontWeight: "900",
              color: "white",
              letterSpacing: "tighter",
            })}
          >
            Paramètres
          </h1>
          <p
            className={css({
              color: "text.muted",
              fontSize: "lg",
              fontWeight: "medium",
              maxW: "xl",
              lineHeight: "relaxed",
            })}
          >
            Gérez votre identité numérique, sécurisez votre accès et configurez
            vos préférences Aegis AI.
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

      <div
        className={flex({ direction: { base: "column", lg: "row" }, gap: "8" })}
      >
        {/* Modern Sidebar Tabs */}
        <aside className={css({ lg: { w: "72" }, flexShrink: "0" })}>
          <nav
            className={flex({
              direction: { base: "row", lg: "column" },
              gap: "2",
              p: "1.5",
              bg: "whiteAlpha.50",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              borderRadius: { lg: "3xl", base: "2xl" },
              overflowX: "auto",
            })}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  css({
                    display: "flex",
                    alignItems: "center",
                    gap: "4",
                    px: "6",
                    py: "4",
                    borderRadius: "full",
                    transition: "all",
                    transitionDuration: "300ms",
                    minW: "max-content",
                  }),
                  activeTab === tab.id
                    ? css({
                        bg: "brand.primary",
                        color: "white",
                        boxShadow: "0 4px 12px {colors.brand.primary/20}",
                      })
                    : css({
                        color: "text.muted",
                        _hover: { color: "text.main", bg: "whiteAlpha.100" },
                      }),
                )}
              >
                <tab.icon
                  className={cx(
                    css({ w: "5", h: "5" }),
                    activeTab === tab.id
                      ? css({ transform: "scale(1.1)" })
                      : "",
                  )}
                />
                <span
                  className={css({
                    fontSize: "sm",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "widest",
                  })}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className={css({ flex: "1", minH: "600px" })}>
          {activeTab === "profil" && (
            <div className={css({ "& > * + *": { mt: "6" } })}>
              {/* Profile Card */}
              <div
                className={cx(
                  card(),
                  css({
                    p: "10",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "3xl",
                    boxShadow: "2xl",
                  }),
                )}
              >
                <div
                  className={css({
                    position: "absolute",
                    top: "0",
                    right: "0",
                    w: "64",
                    h: "64",
                    bg: "brand.primary/5",
                    filter: "blur(100px)",
                    pointerEvents: "none",
                  })}
                />

                <div
                  className={flex({
                    direction: { base: "column", md: "row" },
                    align: "center",
                    gap: "12",
                    position: "relative",
                    zIndex: "10",
                  })}
                >
                  {/* Interactive Avatar */}
                  <div
                    className={cx(
                      "group",
                      css({ position: "relative", cursor: "pointer" }),
                    )}
                    onClick={() => setIsPhotoOptionsOpen(true)}
                  >
                    <ProfileCircle
                      size="xl"
                      className={css({
                        ring: "8px",
                        ringColor: "whiteAlpha.50",
                        _hover: { ringColor: "brand.primary/20" },
                        transition: "all",
                        transitionDuration: "500ms",
                      })}
                    />
                    <div
                      className={cx(
                        "avatar-overlay",
                        flex({
                          position: "absolute",
                          inset: "0",
                          zIndex: "20",
                          align: "center",
                          justify: "center",
                          bg: "black/60",
                          opacity: "0",
                          borderRadius: "2xl",
                          transition: "all",
                          transitionDuration: "300ms",
                          backdropFilter: "blur(4px)",
                          _groupHover: { opacity: 1 },
                        }),
                      )}
                    >
                      <Camera
                        className={css({ w: "10", h: "10", color: "white" })}
                      />
                    </div>
                  </div>

                  <div
                    className={css({
                      flex: "1",
                      textAlign: { base: "center", md: "left" },
                      "& > * + *": { mt: "4" },
                    })}
                  >
                    <div className={css({ "& > * + *": { mt: "1" } })}>
                      <h2
                        className={css({
                          fontSize: "4xl",
                          fontWeight: "900",
                          color: "white",
                          letterSpacing: "tight",
                        })}
                      >
                        {user?.name || "Aegis User"}
                      </h2>
                      <div className={flex({ direction: "column", gap: "1" })}>
                        <p
                          className={css({
                            color: "text.muted",
                            fontWeight: "bold",
                            letterSpacing: "wide",
                            textTransform: "uppercase",
                            fontSize: "sm",
                          })}
                        >
                          {user?.email}
                        </p>
                        <div className={flex({ align: "center", gap: "2" })}>
                          <code
                            className={css({
                              fontSize: "10px",
                              fontFamily: "mono",
                              color: "gray.600",
                              bg: "whiteAlpha.50",
                              px: "2",
                              py: "0.5",
                              borderRadius: "md",
                              border: "1px solid",
                              borderColor: "whiteAlpha.100",
                            })}
                          >
                            ID: {user?.id}
                          </code>
                          <button
                            onClick={() => {
                              if (user?.id)
                                navigator.clipboard.writeText(user.id);
                            }}
                            className={css({
                              p: "1",
                              color: "gray.700",
                              _hover: { color: "brand.primary" },
                              transition: "colors",
                            })}
                            title="Copier l'ID"
                          >
                            <Copy className={css({ w: "3", h: "3" })} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      className={flex({
                        justify: { base: "center", md: "start" },
                        flexWrap: "wrap",
                        gap: "4",
                      })}
                    >
                      <RoleBadge role={user?.role || "viewer"} />
                      <button
                        onClick={() => setIsPhotoOptionsOpen(true)}
                        className={flex({
                          fontSize: "10px",
                          fontWeight: "900",
                          color: "brand.primary",
                          _hover: { color: "cyan.400" },
                          textTransform: "uppercase",
                          letterSpacing: "widest",
                          transition: "colors",
                          align: "center",
                          gap: "2",
                        })}
                      >
                        <div
                          className={circle({
                            size: "1.5",
                            bg: "brand.primary",
                          })}
                        />{" "}
                        Modifier la photo
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={grid({
                    mt: "16",
                    columns: { base: 1, md: 2 },
                    gap: "12",
                  })}
                >
                  {/* Name Update Form */}
                  <form
                    onSubmit={handleUpdateNameInit}
                    className={css({
                      bg: "whiteAlpha.50",
                      p: "8",
                      borderRadius: "3xl",
                      border: "1px solid",
                      borderColor: "whiteAlpha.100",
                      "& > * + *": { mt: "6" },
                    })}
                  >
                    <div className={css({ "& > * + *": { mt: "6" } })}>
                      <div className={css({ "& > * + *": { mt: "3" } })}>
                        <label
                          htmlFor="name"
                          className={flex({
                            fontSize: "xs",
                            fontWeight: "900",
                            color: "gray.500",
                            textTransform: "uppercase",
                            letterSpacing: "widest",
                            px: "2",
                            align: "center",
                            gap: "2",
                          })}
                        >
                          <User
                            className={css({
                              w: "3.5",
                              h: "3.5",
                              color: "brand.primary",
                            })}
                          />{" "}
                          Nouveau nom
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Votre nouveau nom complet"
                          className={css({
                            w: "full",
                            bg: "whiteAlpha.50",
                            border: "1px solid",
                            borderColor: "whiteAlpha.100",
                            color: "white",
                            borderRadius: "2xl",
                            px: "6",
                            py: "4",
                            _focus: {
                              outline: "none",
                              borderColor: "brand.primary",
                              ring: "4px",
                              ringColor: "brand.primary/10",
                            },
                            transition: "all",
                            fontWeight: "bold",
                          })}
                        />
                      </div>
                    </div>

                    {nameMessage && (
                      <div
                        className={flex({
                          p: "4",
                          borderRadius: "xl",
                          align: "center",
                          gap: "3",
                          fontSize: "sm",
                          fontWeight: "bold",
                          bg:
                            nameMessage.type === "success"
                              ? "emerald.500/10"
                              : "red.500/10",
                          color:
                            nameMessage.type === "success"
                              ? "emerald.400"
                              : "red.400",
                          border: "1px solid",
                          borderColor:
                            nameMessage.type === "success"
                              ? "emerald.500/20"
                              : "red.500/20",
                        })}
                      >
                        {nameMessage.type === "success" ? (
                          <CheckCircle2
                            className={css({ w: "4", h: "4", flexShrink: "0" })}
                          />
                        ) : (
                          <AlertCircle
                            className={css({ w: "4", h: "4", flexShrink: "0" })}
                          />
                        )}{" "}
                        {nameMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={nameLoading}
                      className={css({
                        w: "full",
                        py: "5",
                        bg: "brand.primary/10",
                        _hover: { bg: "brand.primary", color: "white" },
                        border: "1px solid",
                        borderColor: "brand.primary/30",
                        color: "brand.primary",
                        fontWeight: "900",
                        borderRadius: "2xl",
                        transition: "all",
                        textTransform: "uppercase",
                        letterSpacing: "widest",
                        fontSize: "xs",
                        mt: "2",
                      })}
                    >
                      <div
                        className={flex({
                          align: "center",
                          justify: "center",
                          gap: "3",
                        })}
                      >
                        {nameLoading ? (
                          <Loader2
                            className={css({
                              w: "4",
                              h: "4",
                              animation: "spin 1s linear infinite",
                            })}
                          />
                        ) : (
                          <Zap className={css({ w: "4", h: "4" })} />
                        )}
                        Enregistrer le nom
                      </div>
                    </button>
                  </form>

                  {/* Email Update Form */}
                  <form
                    onSubmit={handleUpdateEmailInit}
                    className={css({
                      bg: "whiteAlpha.50",
                      p: "8",
                      borderRadius: "3xl",
                      border: "1px solid",
                      borderColor: "whiteAlpha.100",
                      "& > * + *": { mt: "6" },
                    })}
                  >
                    <div className={css({ "& > * + *": { mt: "6" } })}>
                      <div className={css({ "& > * + *": { mt: "3" } })}>
                        <label
                          htmlFor="email"
                          className={flex({
                            fontSize: "xs",
                            fontWeight: "900",
                            color: "gray.500",
                            textTransform: "uppercase",
                            letterSpacing: "widest",
                            px: "2",
                            align: "center",
                            gap: "2",
                          })}
                        >
                          <Mail
                            className={css({
                              w: "3.5",
                              h: "3.5",
                              color: "brand.primary",
                            })}
                          />{" "}
                          Nouvelle adresse email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nouvelle.adresse@aegis.com"
                          className={css({
                            w: "full",
                            bg: "whiteAlpha.50",
                            border: "1px solid",
                            borderColor: "whiteAlpha.100",
                            color: "white",
                            borderRadius: "2xl",
                            px: "6",
                            py: "4",
                            _focus: {
                              outline: "none",
                              borderColor: "brand.primary",
                              ring: "4px",
                              ringColor: "brand.primary/10",
                            },
                            transition: "all",
                            fontWeight: "bold",
                          })}
                        />
                      </div>
                    </div>

                    {emailMessage && (
                      <div
                        className={flex({
                          p: "4",
                          borderRadius: "xl",
                          align: "center",
                          gap: "3",
                          fontSize: "sm",
                          fontWeight: "bold",
                          bg:
                            emailMessage.type === "success"
                              ? "emerald.500/10"
                              : "red.500/10",
                          color:
                            emailMessage.type === "success"
                              ? "emerald.400"
                              : "red.400",
                          border: "1px solid",
                          borderColor:
                            emailMessage.type === "success"
                              ? "emerald.500/20"
                              : "red.500/20",
                        })}
                      >
                        {emailMessage.type === "success" ? (
                          <CheckCircle2
                            className={css({ w: "4", h: "4", flexShrink: "0" })}
                          />
                        ) : (
                          <AlertCircle
                            className={css({ w: "4", h: "4", flexShrink: "0" })}
                          />
                        )}{" "}
                        {emailMessage.text}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={emailLoading}
                      className={css({
                        w: "full",
                        py: "5",
                        bg: "brand.primary/10",
                        _hover: { bg: "brand.primary", color: "white" },
                        border: "1px solid",
                        borderColor: "brand.primary/30",
                        color: "brand.primary",
                        fontWeight: "900",
                        borderRadius: "2xl",
                        transition: "all",
                        textTransform: "uppercase",
                        letterSpacing: "widest",
                        fontSize: "xs",
                        mt: "2",
                      })}
                    >
                      <div
                        className={flex({
                          align: "center",
                          justify: "center",
                          gap: "3",
                        })}
                      >
                        {emailLoading ? (
                          <Loader2
                            className={css({
                              w: "4",
                              h: "4",
                              animation: "spin 1s linear infinite",
                            })}
                          />
                        ) : (
                          <Zap className={css({ w: "4", h: "4" })} />
                        )}
                        Mettre à jour l'identifiant
                      </div>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "securite" && (
            <div className={css({ "& > * + *": { mt: "6" } })}>
              <section
                className={cx(
                  card(),
                  css({
                    p: "10",
                    borderRadius: "3xl",
                    position: "relative",
                    overflow: "hidden",
                  }),
                )}
              >
                <div
                  className={css({
                    position: "absolute",
                    top: "0",
                    right: "0",
                    w: "64",
                    h: "64",
                    bg: "amber.500/5",
                    filter: "blur(100px)",
                    pointerEvents: "none",
                  })}
                />

                <div
                  className={flex({
                    align: "center",
                    gap: "6",
                    mb: "12",
                    borderBottom: "1px solid",
                    borderColor: "whiteAlpha.100",
                    pb: "8",
                  })}
                >
                  <div
                    className={css({
                      p: "4",
                      bg: "rgba(245, 158, 11, 0.1)",
                      borderRadius: "3xl",
                      color: "amber.500",
                      ring: "1px",
                      ringColor: "rgba(245, 158, 11, 0.2)",
                    })}
                  >
                    <Lock className={css({ w: "8", h: "8" })} />
                  </div>
                  <div className={css({ "& > * + *": { mt: "1" } })}>
                    <h2
                      className={css({
                        fontSize: "3xl",
                        fontWeight: "900",
                        color: "white",
                        letterSpacing: "tight",
                        textTransform: "uppercase",
                      })}
                    >
                      Sécurité du Compte
                    </h2>
                    <p
                      className={css({
                        color: "text.muted",
                        fontWeight: "medium",
                      })}
                    >
                      Renforcez votre protection avec un mot de passe complexe.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleUpdatePassword}
                  className={css({ "& > * + *": { mt: "12" } })}
                >
                  <div className={grid({ columns: 1, gap: "10", maxW: "2xl" })}>
                    <div className={css({ "& > * + *": { mt: "3" } })}>
                      <label
                        htmlFor="oldPassword"
                        className={css({
                          fontSize: "xs",
                          fontWeight: "900",
                          color: "gray.500",
                          textTransform: "uppercase",
                          letterSpacing: "widest",
                          px: "2",
                        })}
                      >
                        Mot de passe actuel
                      </label>
                      <input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={css({
                          w: "full",
                          bg: "whiteAlpha.50",
                          border: "1px solid",
                          borderColor: "whiteAlpha.100",
                          color: "white",
                          borderRadius: "2xl",
                          px: "6",
                          py: "4",
                          _focus: {
                            outline: "none",
                            borderColor: "amber.500",
                            ring: "4px",
                            ringColor: "rgba(245, 158, 11, 0.1)",
                          },
                          transition: "all",
                          fontWeight: "bold",
                          _placeholder: { color: "gray.800" },
                        })}
                      />
                    </div>

                    <div
                      className={grid({
                        columns: { base: 1, md: 2 },
                        gap: "8",
                      })}
                    >
                      <div className={css({ "& > * + *": { mt: "3" } })}>
                        <label
                          htmlFor="newPassword"
                          className={css({
                            fontSize: "xs",
                            fontWeight: "900",
                            color: "gray.500",
                            textTransform: "uppercase",
                            letterSpacing: "widest",
                            px: "2",
                          })}
                        >
                          Nouveau mot de passe
                        </label>
                        <input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="8+ caractères"
                          className={css({
                            w: "full",
                            bg: "whiteAlpha.50",
                            border: "1px solid",
                            borderColor: "whiteAlpha.100",
                            color: "white",
                            borderRadius: "2xl",
                            px: "6",
                            py: "4",
                            _focus: {
                              outline: "none",
                              borderColor: "amber.500",
                              ring: "4px",
                              ringColor: "rgba(245, 158, 11, 0.1)",
                            },
                            transition: "all",
                            fontWeight: "bold",
                            _placeholder: { color: "gray.800" },
                          })}
                        />
                      </div>
                      <div className={css({ "& > * + *": { mt: "3" } })}>
                        <label
                          htmlFor="confirmPassword"
                          className={css({
                            fontSize: "xs",
                            fontWeight: "900",
                            color: "gray.500",
                            textTransform: "uppercase",
                            letterSpacing: "widest",
                            px: "2",
                          })}
                        >
                          Confirmation
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Répétez le mot de passe"
                          className={css({
                            w: "full",
                            bg: "whiteAlpha.50",
                            border: "1px solid",
                            borderColor: "whiteAlpha.100",
                            color: "white",
                            borderRadius: "2xl",
                            px: "6",
                            py: "4",
                            _focus: {
                              outline: "none",
                              borderColor: "amber.500",
                              ring: "4px",
                              ringColor: "rgba(245, 158, 11, 0.1)",
                            },
                            transition: "all",
                            fontWeight: "bold",
                            _placeholder: { color: "gray.800" },
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sleek Password Complexity Bar */}
                  <div
                    className={css({
                      bg: "whiteAlpha.50",
                      border: "1px solid",
                      borderColor: "whiteAlpha.100",
                      borderRadius: "3xl",
                      p: "8",
                      maxW: "2xl",
                      "& > * + *": { mt: "6" },
                    })}
                  >
                    <h4
                      className={flex({
                        fontSize: "10px",
                        fontWeight: "900",
                        color: "gray.500",
                        textTransform: "uppercase",
                        letterSpacing: "widest",
                        align: "center",
                        gap: "3",
                      })}
                    >
                      <Shield className={css({ w: "3.5", h: "3.5" })} />{" "}
                      Exigences de sécurité
                    </h4>
                    <div
                      className={grid({
                        columns: { base: 2, md: 4 },
                        gap: "6",
                      })}
                    >
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
                          className={cx(
                            "group",
                            flex({
                              direction: "column",
                              align: "center",
                              gap: "3",
                              cursor: "default",
                            }),
                          )}
                        >
                          <div
                            className={cx(
                              "req-dot",
                              css({
                                w: "1.5",
                                h: "1.5",
                                borderRadius: "full",
                                transition: "all",
                                transitionDuration: "500ms",
                              }),
                              req.valid
                                ? css({
                                    bg: "emerald.400",
                                    transform: "scale(1.5)",
                                    boxShadow:
                                      "0 0 10px rgba(52, 211, 153, 0.8)",
                                  })
                                : css({ bg: "whiteAlpha.100" }),
                            )}
                          />
                          <span
                            className={cx(
                              css({
                                fontSize: "10px",
                                fontWeight: "900",
                                textTransform: "uppercase",
                                letterSpacing: "tight",
                              }),
                              req.valid
                                ? css({ color: "emerald.400" })
                                : css({ color: "gray.600" }),
                            )}
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {passwordMessage && (
                    <div
                      className={flex({
                        p: "4",
                        borderRadius: "xl",
                        align: "center",
                        gap: "3",
                        fontSize: "sm",
                        fontWeight: "bold",
                        maxW: "2xl",
                        bg:
                          passwordMessage.type === "success"
                            ? "emerald.500/10"
                            : "red.500/10",
                        color:
                          passwordMessage.type === "success"
                            ? "emerald.400"
                            : "red.400",
                        border: "1px solid",
                        borderColor:
                          passwordMessage.type === "success"
                            ? "emerald.500/20"
                            : "red.500/20",
                      })}
                    >
                      {passwordMessage.type === "success" ? (
                        <CheckCircle2 className={css({ w: "4", h: "4" })} />
                      ) : (
                        <AlertCircle className={css({ w: "4", h: "4" })} />
                      )}{" "}
                      {passwordMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className={flex({
                      px: "10",
                      py: "5",
                      bg: "amber.500",
                      _hover: { bg: "amber.400" },
                      color: "black",
                      fontWeight: "900",
                      borderRadius: "3xl",
                      transition: "all",
                      boxShadow: "0 10px 30px rgba(245, 158, 11, 0.1)",
                      textTransform: "uppercase",
                      letterSpacing: "widest",
                      fontSize: "xs",
                      align: "center",
                      gap: "3",
                    })}
                  >
                    {passwordLoading && (
                      <Loader2
                        className={css({
                          w: "4",
                          h: "4",
                          animation: "spin 1s linear infinite",
                        })}
                      />
                    )}
                    Mettre à jour la sécurité
                  </button>
                </form>
              </section>
            </div>
          )}

          {(activeTab === "notifications" || activeTab === "facturation") && (
            <div
              className={flex({
                direction: "column",
                align: "center",
                justify: "center",
                p: "20",
                bg: "bg.card",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                borderRadius: "3xl",
                gap: "6",
              })}
            >
              <Zap
                className={css({
                  w: "16",
                  h: "16",
                  color: "brand.primary/20",
                  animation: "pulse 2s infinite",
                })}
              />
              <div
                className={css({
                  textAlign: "center",
                  "& > * + *": { mt: "2" },
                })}
              >
                <h3
                  className={css({
                    fontSize: "2xl",
                    fontWeight: "900",
                    color: "white",
                    textTransform: "uppercase",
                    letterSpacing: "widest",
                  })}
                >
                  Bientôt Disponible
                </h3>
                <p
                  className={css({ color: "text.muted", fontWeight: "medium" })}
                >
                  Cette section est en cours de développement.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Profile Photo Options Modal */}
      {isPhotoOptionsOpen && (
        <div
          className={css({
            position: "fixed",
            inset: "0",
            zIndex: "100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { base: "6", sm: "0" },
          })}
        >
          <div
            className={css({
              position: "absolute",
              inset: "0",
              bg: "rgba(11, 13, 19, 0.8)",
              backdropFilter: "blur(12px)",
            })}
            onClick={() => setIsPhotoOptionsOpen(false)}
          />
          <div
            className={css({
              position: "relative",
              w: "full",
              maxW: "sm",
              bg: "bg.card",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              borderRadius: "3xl",
              overflow: "hidden",
              boxShadow: "2xl",
            })}
          >
            <div className={css({ p: "8", "& > * + *": { mt: "6" } })}>
              <div
                className={css({
                  textAlign: "center",
                  "& > * + *": { mt: "2" },
                })}
              >
                <h3
                  className={css({
                    fontSize: "xl",
                    fontWeight: "900",
                    color: "white",
                  })}
                >
                  Photo de profil
                </h3>
                <p
                  className={css({
                    fontSize: "sm",
                    color: "text.muted",
                    fontWeight: "bold",
                  })}
                >
                  Que souhaitez-vous faire ?
                </p>
              </div>

              <div className={css({ "& > * + *": { mt: "3" } })}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={flex({
                    w: "full",
                    py: "4",
                    bg: "brand.primary",
                    color: "white",
                    fontWeight: "900",
                    borderRadius: "2xl",
                    align: "center",
                    justify: "center",
                    gap: "3",
                    _hover: { bg: "cyan.400" },
                    transition: "all",
                    boxShadow: "0 4px 12px {colors.brand.primary/20}",
                  })}
                >
                  <Camera className={css({ w: "5", h: "5" })} />
                  Téléverser une photo
                </button>

                {avatarUrl && (
                  <button
                    onClick={handleDeletePhoto}
                    className={flex({
                      w: "full",
                      py: "4",
                      bg: "rgba(239, 68, 68, 0.1)",
                      color: "red.500",
                      border: "1px solid",
                      borderColor: "rgba(239, 68, 68, 0.2)",
                      fontWeight: "900",
                      borderRadius: "2xl",
                      align: "center",
                      justify: "center",
                      gap: "3",
                      _hover: { bg: "red.500", color: "white" },
                      transition: "all",
                    })}
                  >
                    <Trash2 className={css({ w: "5", h: "5" })} />
                    Supprimer la photo
                  </button>
                )}

                <button
                  onClick={() => setIsPhotoOptionsOpen(false)}
                  className={css({
                    w: "full",
                    py: "4",
                    color: "text.muted",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    letterSpacing: "widest",
                    fontSize: "10px",
                    _hover: { color: "white" },
                    transition: "colors",
                  })}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className={css({ display: "none" })}
      />

      <PasswordPromptModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingAction(null);
        }}
        onSubmit={handleModalSubmit}
        title="Vérification requise"
        message="Veuillez entrer votre mot de passe actuel pour autoriser cette modification sensible."
      />
    </div>
  );
};
