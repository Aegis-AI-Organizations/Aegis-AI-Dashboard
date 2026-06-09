import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";
import { getPasswordError } from "../utils/validation";
import { css } from "../styled-system/css";
import { flex } from "../styled-system/patterns";

export const SetupPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentToken, setAgentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const passwordError = useMemo(() => getPasswordError(password), [password]);
  const canSubmit = Boolean(
    invitationToken &&
      password &&
      confirmPassword &&
      !passwordError &&
      password === confirmPassword,
  );

  const copyAgentToken = async () => {
    if (!agentToken) return;
    await navigator.clipboard.writeText(agentToken);
    setCopied(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!invitationToken) {
      setError("Lien d'activation invalide ou incomplet.");
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/setup-password", {
        token: invitationToken,
        password,
      });
      const meResponse = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      setAuth(data.access_token, meResponse.data);
      if (data.agent_token) {
        setAgentToken(data.agent_token);
        return;
      }

      navigate("/", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Le lien d'activation est invalide ou a expire.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || "Mot de passe invalide.");
      } else {
        setError("Impossible d'activer le compte pour le moment.");
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
        py: "10",
      })}
    >
      <div className={css({ maxW: "xl", w: "full" })}>
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
            })}
          >
            <ShieldCheck
              className={css({ w: "8", h: "8", color: "cyan.400" })}
            />
          </div>
          <h1
            className={css({
              fontSize: "3xl",
              fontWeight: "bold",
              color: "white",
              mb: "2",
            })}
          >
            Activation Aegis
          </h1>
          <p className={css({ color: "gray.500", fontSize: "sm" })}>
            Definissez votre mot de passe pour finaliser la premiere connexion.
          </p>
        </div>

        <div
          className={css({
            bg: "#0B0D13",
            border: "1px solid",
            borderColor: "gray.800",
            borderRadius: "2xl",
            p: "8",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
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
              bg: agentToken ? "emerald.500/60" : "cyan.500/40",
            })}
          />

          {agentToken ? (
            <div className={css({ "& > * + *": { mt: "6" } })}>
              <div className={flex({ align: "center", gap: "3" })}>
                <CheckCircle2
                  className={css({ w: "6", h: "6", color: "emerald.400" })}
                />
                <h2
                  className={css({
                    fontSize: "xl",
                    fontWeight: "semibold",
                    color: "white",
                  })}
                >
                  Compte active
                </h2>
              </div>

              <div
                className={css({
                  border: "1px solid",
                  borderColor: "cyan.500/30",
                  bg: "black/40",
                  borderRadius: "xl",
                  p: "5",
                })}
              >
                <p
                  className={css({
                    fontSize: "xs",
                    fontWeight: "bold",
                    color: "amber.300",
                    mb: "3",
                  })}
                >
                  Ce token agent ne sera affiche qu'une seule fois.
                </p>
                <code
                  className={css({
                    display: "block",
                    color: "white",
                    fontFamily: "mono",
                    fontSize: "sm",
                    wordBreak: "break-all",
                    mb: "4",
                  })}
                >
                  {agentToken}
                </code>
                <button
                  type="button"
                  onClick={copyAgentToken}
                  className={flex({
                    w: "full",
                    align: "center",
                    justify: "center",
                    gap: "2",
                    bg: "cyan.600",
                    color: "white",
                    fontWeight: "bold",
                    py: "3",
                    borderRadius: "xl",
                    _hover: { bg: "cyan.500" },
                  })}
                >
                  <Copy className={css({ w: "4", h: "4" })} />
                  {copied ? "Token copie" : "Copier le token"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/", { replace: true })}
                className={css({
                  w: "full",
                  bg: "gray.800",
                  color: "white",
                  fontWeight: "bold",
                  py: "3",
                  borderRadius: "xl",
                  _hover: { bg: "gray.700" },
                })}
              >
                Acceder au dashboard
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className={css({ "& > * + *": { mt: "5" } })}
            >
              {error && (
                <div
                  className={flex({
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
                    className={css({ w: "4", h: "4", color: "red.400" })}
                  />
                  <p className={css({ fontSize: "sm", color: "red.200" })}>
                    {error}
                  </p>
                </div>
              )}

              {!invitationToken && (
                <div
                  className={flex({
                    p: "3",
                    borderRadius: "lg",
                    bg: "amber.500/10",
                    border: "1px solid",
                    borderColor: "amber.500/20",
                    align: "center",
                    gap: "3",
                  })}
                >
                  <KeyRound
                    className={css({ w: "4", h: "4", color: "amber.300" })}
                  />
                  <p className={css({ fontSize: "sm", color: "amber.100" })}>
                    Token d'invitation manquant dans l'URL.
                  </p>
                </div>
              )}

              <PasswordField
                id="password"
                label="Nouveau mot de passe"
                value={password}
                show={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                onChange={setPassword}
              />

              <PasswordField
                id="confirm-password"
                label="Confirmer le mot de passe"
                value={confirmPassword}
                show={showPassword}
                onToggleShow={() => setShowPassword((v) => !v)}
                onChange={setConfirmPassword}
              />

              {password && passwordError && (
                <p className={css({ fontSize: "xs", color: "amber.300" })}>
                  {passwordError}
                </p>
              )}

              {confirmPassword && password !== confirmPassword && (
                <p className={css({ fontSize: "xs", color: "amber.300" })}>
                  Les mots de passe ne correspondent pas.
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className={flex({
                  w: "full",
                  align: "center",
                  justify: "center",
                  gap: "2",
                  bg: "cyan.600",
                  color: "white",
                  fontWeight: "bold",
                  py: "3",
                  borderRadius: "xl",
                  opacity: !canSubmit || isLoading ? 0.5 : 1,
                  cursor: !canSubmit || isLoading ? "not-allowed" : "pointer",
                  _hover: {
                    bg: !canSubmit || isLoading ? "cyan.600" : "cyan.500",
                  },
                })}
              >
                {isLoading && <Loader2 className={css({ w: "4", h: "4" })} />}
                Activer mon compte
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  show: boolean;
  onToggleShow: () => void;
  onChange: (value: string) => void;
};

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  show,
  onToggleShow,
  onChange,
}) => (
  <div className={css({ "& > * + *": { mt: "1.5" } })}>
    <label
      htmlFor={id}
      className={css({
        fontSize: "xs",
        fontWeight: "semibold",
        color: "gray.400",
        textTransform: "uppercase",
      })}
    >
      {label}
    </label>
    <div className={css({ position: "relative" })}>
      <Lock
        className={css({
          position: "absolute",
          left: "3",
          top: "50%",
          transform: "translateY(-50%)",
          w: "4",
          h: "4",
          color: "gray.600",
        })}
      />
      <input
        id={id}
        type={show ? "text" : "password"}
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
          outline: "none",
          _focus: { borderColor: "cyan.500" },
        })}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className={css({
          position: "absolute",
          right: "3",
          top: "50%",
          transform: "translateY(-50%)",
          color: "gray.500",
          _hover: { color: "cyan.400" },
        })}
        aria-label={
          show ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
      >
        {show ? (
          <EyeOff className={css({ w: "4", h: "4" })} />
        ) : (
          <Eye className={css({ w: "4", h: "4" })} />
        )}
      </button>
    </div>
  </div>
);
