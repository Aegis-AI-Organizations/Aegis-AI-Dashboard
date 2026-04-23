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
import { css, cx } from "../../styled-system/css";
import { flex, grid } from "../../styled-system/patterns";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      let userProfile = data.user;
      if (!userProfile) {
        const meResponse = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        userProfile = meResponse.data;
      }

      setAuth(data.access_token, userProfile);
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
    <div
      className={flex({
        minH: "100vh",
        align: "center",
        justify: "center",
        bg: "#050810",
        px: "4",
      })}
    >
      <div
        className={css({
          maxW: "md",
          w: "full",
          animation: "fadeIn 0.5s ease-in-out",
        })}
      >
        <div className={css({ textAlign: "center", mb: "8" })}>
          <div
            className={flex({
              display: "inline-flex",
              align: "center",
              justify: "center",
              w: "16",
              h: "16",
              borderRadius: "2xl",
              bg: "cyan.500/10",
              border: "1px solid",
              borderColor: "cyan.500/20",
              mb: "4",
              boxShadow: "0 0 15px rgba(34,211,238,0.1)",
            })}
          >
            <Shield className={css({ w: "8", h: "8", color: "cyan.400" })} />
          </div>
          <h1
            className={css({
              fontSize: "3xl",
              fontWeight: "bold",
              color: "white",
              mb: "2",
              letterSpacing: "tight",
            })}
          >
            AEGIS AI
          </h1>
          <p
            className={css({
              color: "gray.500",
              fontSize: "sm",
              fontWeight: "medium",
            })}
          >
            Plateforme de Cybersécurité Offensive
          </p>
        </div>

        <div
          className={css({
            bg: "#0B0D13",
            border: "1px solid",
            borderColor: "gray.800",
            borderRadius: "2xl",
            p: "8",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            position: "relative",
            overflow: "hidden",
          })}
        >
          <div
            className={css({
              position: "absolute",
              top: "0",
              left: "0",
              w: "1",
              h: "full",
              bg: "cyan.500/40",
            })}
          />

          <h2
            className={css({
              fontSize: "xl",
              fontWeight: "semibold",
              color: "white",
              mb: "6",
            })}
          >
            Connexion
          </h2>

          {error && (
            <div
              className={flex({
                mb: "6",
                p: "3",
                borderRadius: "lg",
                bg: "red.500/10",
                border: "1px solid",
                borderColor: "red.500/20",
                align: "center",
                gap: "3",
              })}
            >
              <AlertCircle
                className={css({
                  w: "4",
                  h: "4",
                  color: "red.400",
                  flexShrink: 0,
                })}
              />
              <p
                className={css({
                  fontSize: "sm",
                  color: "red.200",
                  fontWeight: "medium",
                })}
              >
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={css({ "& > * + *": { mt: "4" } })}
          >
            <div className={css({ "& > * + *": { mt: "1.5" } })}>
              <label
                className={css({
                  fontSize: "xs",
                  fontWeight: "semibold",
                  color: "gray.400",
                  textTransform: "uppercase",
                  letterSpacing: "wider",
                  ml: "1",
                })}
                htmlFor="email"
              >
                Email
              </label>
              <div className={css({ position: "relative", group: true })}>
                <div
                  className={flex({
                    position: "absolute",
                    insetY: "0",
                    left: "0",
                    pl: "3",
                    align: "center",
                    pointerEvents: "none",
                  })}
                >
                  <Mail
                    className={css({
                      w: "4",
                      h: "4",
                      color: "gray.600",
                      _groupFocusWithin: { color: "cyan.400" },
                      transition: "colors",
                    })}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={css({
                    w: "full",
                    bg: "#13151A",
                    border: "1px solid",
                    borderColor: "gray.800",
                    color: "white",
                    fontSize: "sm",
                    borderRadius: "xl",
                    pl: "10",
                    pr: "4",
                    py: "3",
                    _focus: {
                      outline: "none",
                      borderColor: "cyan.500",
                      ring: "1px",
                      ringColor: "cyan.500",
                    },
                    transition: "all",
                    _placeholder: { color: "gray.600" },
                  })}
                  placeholder="admin@aegis.ai"
                />
              </div>
            </div>

            <div className={css({ "& > * + *": { mt: "1.5" } })}>
              <label
                className={css({
                  fontSize: "xs",
                  fontWeight: "semibold",
                  color: "gray.400",
                  textTransform: "uppercase",
                  letterSpacing: "wider",
                  ml: "1",
                })}
                htmlFor="password"
              >
                Mot de passe
              </label>
              <div className={css({ position: "relative", group: true })}>
                <div
                  className={flex({
                    position: "absolute",
                    insetY: "0",
                    left: "0",
                    pl: "3",
                    align: "center",
                    pointerEvents: "none",
                  })}
                >
                  <Lock
                    className={css({
                      w: "4",
                      h: "4",
                      color: "gray.600",
                      _groupFocusWithin: { color: "cyan.400" },
                      transition: "colors",
                    })}
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={css({
                    w: "full",
                    bg: "#13151A",
                    border: "1px solid",
                    borderColor: "gray.800",
                    color: "white",
                    fontSize: "sm",
                    borderRadius: "xl",
                    pl: "10",
                    pr: "12",
                    py: "3",
                    _focus: {
                      outline: "none",
                      borderColor: "cyan.500",
                      ring: "1px",
                      ringColor: "cyan.500",
                    },
                    transition: "all",
                    _placeholder: { color: "gray.600" },
                  })}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={flex({
                    position: "absolute",
                    insetY: "0",
                    right: "0",
                    pr: "3",
                    align: "center",
                    color: "gray.500",
                    _hover: { color: "cyan.400" },
                    transition: "colors",
                  })}
                >
                  {showPassword ? (
                    <EyeOff className={css({ w: "4", h: "4" })} />
                  ) : (
                    <Eye className={css({ w: "4", h: "4" })} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={flex({
                w: "full",
                bg: "cyan.600",
                _hover: { bg: "cyan.500" },
                _disabled: { opacity: "0.5", cursor: "not-allowed" },
                color: "white",
                fontWeight: "bold",
                py: "3",
                px: "4",
                borderRadius: "xl",
                transition: "all",
                boxShadow: "0 10px 15px -3px rgba(8, 145, 178, 0.2)",
                align: "center",
                justify: "center",
                gap: "2",
                mt: "4",
              })}
            >
              {isLoading ? (
                <>
                  <Loader2
                    className={css({
                      w: "4",
                      h: "4",
                      animation: "spin 1s linear infinite",
                    })}
                  />
                  Connexion en cours...
                </>
              ) : (
                "Se Connecter"
              )}
            </button>
          </form>

          <div
            className={flex({
              mt: "8",
              pt: "6",
              borderTop: "1px solid",
              borderColor: "gray.800/50",
              direction: "column",
              gap: "4",
            })}
          >
            <div
              className={flex({
                align: "start",
                gap: "3",
                p: "3",
                borderRadius: "xl",
                bg: "blue.500/5",
                border: "1px solid",
                borderColor: "blue.500/10",
              })}
            >
              <Info
                className={css({
                  w: "4",
                  h: "4",
                  color: "blue.400",
                  mt: "0.5",
                  flexShrink: 0,
                })}
              />
              <div>
                <p
                  className={css({
                    fontSize: "xs",
                    color: "blue.200/70",
                    lineHeight: "relaxed",
                    fontWeight: "medium",
                  })}
                >
                  Difficulté d'accès ? Contactez votre administrateur système
                  via la console de management.
                </p>
                <a
                  href="mailto:help@aegis-ai.com"
                  className={css({
                    fontSize: "[10px]",
                    color: "cyan.400",
                    _hover: { textDecoration: "underline" },
                    fontWeight: "bold",
                    mt: "1",
                    display: "inline-block",
                  })}
                >
                  SUPPORT: HELP@AEGIS-AI.COM
                </a>
              </div>
            </div>
          </div>
        </div>

        <p
          className={css({
            mt: "8",
            textAlign: "center",
            fontSize: "xs",
            color: "gray.600",
            fontWeight: "medium",
          })}
        >
          &copy; 2026 Aegis AI. Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
