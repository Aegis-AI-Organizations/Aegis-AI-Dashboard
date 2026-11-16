import { Search, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { ProfileCircle } from "../ui/ProfileCircle";
import { CommandPalette } from "./CommandPalette";

import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

export const Topbar: React.FC = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const shortcutLabel =
    typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)
      ? "⌘K"
      : "Ctrl K";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
        bg: "bg.main/95",
        backdropBlur: "md",
        borderBottom: "1px solid",
        borderColor: "whiteAlpha.100",
        zIndex: "40",
      })}
    >
      <div className={flex({ align: "center" })}>
        {/* Mobile Logo display when sidebar is hidden */}
        <div
          className={css({
            display: { base: "flex", sm: "none" },
            alignItems: "center",
            gap: "2",
          })}
        >
          <img
            src="/logo.svg"
            alt="Aegis AI Logo"
            className={css({
              w: "8",
              h: "8",
              objectFit: "contain",
              filter: "drop-shadow(0 0 8px rgba(0, 242, 255, 0.3))",
            })}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
          <span className={css({ color: "white", fontWeight: "semibold" })}>
            Aegis AI
          </span>
        </div>
      </div>

      <div className={flex({ align: "center", gap: { base: "4", sm: "6" } })}>
        <button
          type="button"
          onClick={() => setIsPaletteOpen(true)}
          aria-keyshortcuts="Meta+K Control+K"
          className={css({
            display: { base: "none", sm: "flex" },
            alignItems: "center",
            gap: "3",
            w: { lg: "64", base: "48" },
            bg: "whiteAlpha.50",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            fontSize: "sm",
            borderRadius: "lg",
            px: "3",
            py: "1.5",
            color: "gray.500",
            cursor: "pointer",
            transition: "colors",
            _hover: { borderColor: "whiteAlpha.200", color: "text.muted" },
          })}
        >
          <Search className={css({ w: "4", h: "4" })} />
          <span className={css({ flex: 1, textAlign: "left" })}>
            Aller à une page…
          </span>
          <kbd
            className={css({
              fontSize: "xs",
              color: "gray.500",
              bg: "whiteAlpha.100",
              px: "1.5",
              py: "0.5",
              borderRadius: "xs",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
            })}
          >
            {shortcutLabel}
          </kbd>
        </button>

        <div className={flex({ align: "center", gap: "4" })}>
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

      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
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
