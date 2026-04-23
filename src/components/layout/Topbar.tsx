import { Search, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { ProfileCircle } from "../ui/ProfileCircle";

import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

export const Topbar: React.FC = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header
      className={css({
        h: "16",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "6",
        bg: "rgba(11, 13, 19, 0.7)",
        backdropBlur: "xl",
        borderBottom: "1px solid",
        borderColor: "whiteAlpha.100",
        zIndex: "40",
      })}
    >
      <div className={flex({ align: "center" })}>
        <h1
          className={css({
            color: "white",
            fontWeight: "medium",
            fontSize: "1rem",
            display: { base: "none", sm: "flex" },
            alignItems: "center",
            gap: "3",
          })}
        >
          Dashboard
          <span
            className={css({
              px: "2.5",
              py: "1",
              borderRadius: "md",
              bg: "brand.primary/10",
              color: "brand.primary",
              border: "1px solid",
              borderColor: "brand.primary/20",
              fontSize: "xs",
              fontWeight: "semibold",
              letterSpacing: "wide",
            })}
          >
            AEGIS
          </span>
        </h1>
        {/* Mobile Logo display when sidebar is hidden */}
        <div
          className={css({
            display: { base: "flex", sm: "none" },
            alignItems: "center",
            gap: "2",
          })}
        >
          <div
            className={flex({
              w: "6",
              h: "6",
              borderRadius: "sm",
              bg: "blue.950/50",
              flexDir: "column",
              align: "center",
              justify: "center",
              border: "1px solid",
              borderColor: "blue.500/20",
            })}
          >
            <div
              className={css({
                w: "2",
                h: "2",
                bg: "brand.primary",
                borderRadius: "xs",
              })}
            ></div>
          </div>
          <span className={css({ color: "white", fontWeight: "semibold" })}>
            Aegis AI
          </span>
        </div>
      </div>

      <div className={flex({ align: "center", gap: { base: "4", sm: "6" } })}>
        <div
          className={css({
            position: "relative",
            display: { base: "none", sm: "block" },
          })}
        >
          <div
            className={css({
              position: "absolute",
              insetY: "0",
              left: "0",
              pl: "3",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            })}
          >
            <Search
              className={css({
                w: "4",
                h: "4",
                color: "gray.500",
                _focusWithin: { color: "brand.primary" },
                transition: "colors",
              })}
            />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className={css({
              w: { lg: "64", base: "48" },
              bg: "whiteAlpha.50",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              fontSize: "sm",
              borderRadius: "lg",
              pl: "10",
              pr: "10",
              py: "1.5",
              color: "text.main",
              _focus: {
                outline: "none",
                borderColor: "brand.primary",
                boxShadow: "0 0 0 1px {colors.brand.primary}",
              },
              transition: "all",
              _placeholder: { color: "gray.600" },
            })}
          />
          <div
            className={css({
              position: "absolute",
              insetY: "0",
              right: "0",
              pr: "2",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            })}
          >
            <span
              className={css({
                fontSize: "xs",
                color: "gray.600",
                fontWeight: "medium",
                bg: "whiteAlpha.100",
                px: "1.5",
                py: "0.5",
                borderRadius: "xs",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
              })}
            >
              K
            </span>
          </div>
        </div>

        <div className={flex({ align: "center", gap: "4" })}>
          <button
            className={css({
              position: "relative",
              p: "2",
              color: "text.muted",
              _hover: { color: "white" },
              transition: "colors",
            })}
          >
            <Bell className={css({ w: "5", h: "5" })} />
            <span
              className={css({
                position: "absolute",
                top: "1.5",
                right: "1.5",
                w: "2",
                h: "2",
                bg: "red.500",
                border: "2px solid",
                borderColor: "bg.card",
                borderRadius: "full",
              })}
            ></span>
          </button>

          <div
            className={flex({ align: "center", gap: "2", cursor: "pointer" })}
          >
            <ProfileCircle size="sm" showStatus />
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={css({
                p: "2",
                color: "text.muted",
                _hover: { color: "red.400", bg: "red.500/10" },
                borderRadius: "lg",
                transition: "all",
              })}
              title="Déconnexion"
            >
              <LogOut className={css({ w: "4", h: "4" })} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ? Votre session sera terminée."
        confirmText="Se déconnecter"
        cancelText="Annuler"
      />
    </header>
  );
};
