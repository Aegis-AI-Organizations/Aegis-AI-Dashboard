import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Users,
  Settings,
  Shield,
  LogOut,
  Gavel,
} from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { ProfileCircle } from "../ui/ProfileCircle";
import { RoleBadge } from "../ui/RoleBadge";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Tableau de Bord",
    path: "/",
    roles: [
      "superadmin",
      "admin",
      "billing_aegis",
      "technicien",
      "support",
      "commercial",
      "owner",
      "billing_client",
      "operateur",
      "viewer",
    ],
  },
  {
    icon: History,
    label: "Historique des Scans",
    path: "/vulnerabilities",
    roles: [
      "superadmin",
      "admin",
      "technicien",
      "support",
      "owner",
      "operateur",
      "viewer",
    ],
  },
  {
    icon: Users,
    label: "Équipe",
    path: "/users",
    roles: ["superadmin", "admin", "owner"],
  },
  {
    icon: Gavel,
    label: "Administration",
    path: "/administration",
    roles: ["superadmin", "admin"],
  },
  {
    icon: Shield,
    label: "Facturation",
    path: "/billing",
    roles: ["superadmin", "admin", "billing_aegis", "owner", "billing_client"],
  },
  {
    icon: Settings,
    label: "Paramètres",
    path: "/settings",
    roles: [
      "superadmin",
      "admin",
      "billing_aegis",
      "technicien",
      "support",
      "commercial",
      "owner",
      "billing_client",
      "operateur",
      "viewer",
    ],
  },
];

import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <aside
      className={cx(
        css({
          display: { base: "none", md: "flex" },
          flexDir: "column",
          bg: "bg.main/95",
          backdropBlur: "md",
          borderRight: "1px solid",
          borderColor: "whiteAlpha.100",
          position: "sticky",
          top: "0",
          h: "screen",
          overflowY: "auto",
          transition: "all",
          transitionDuration: "300ms",
          zIndex: "50",
        }),
        isExpanded ? css({ w: "64" }) : css({ w: "20" }),
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={flex({
          align: "center",
          gap: "3",
          px: "6",
          h: "16",
          borderBottom: "1px solid",
          borderColor: "whiteAlpha.100",
          flexShrink: 0,
          cursor: "pointer",
          overflow: "hidden",
        })}
      >
        <img
          src="/logo.svg"
          alt="Aegis AI Logo"
          className={css({
            w: "8",
            h: "8",
            objectFit: "contain",
            flexShrink: 0,
          })}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />
        <span
          className={cx(
            css({
              color: "text.bright",
              fontWeight: "bold",
              fontSize: "lg",
              letterSpacing: "wider",
              whiteSpace: "nowrap",
              transition: "all",
              transitionDuration: "300ms",
            }),
            isExpanded
              ? css({ opacity: 1, flex: 1 })
              : css({ opacity: 0, w: "0" }),
          )}
        >
          Aegis AI
        </span>
      </div>

      <nav
        className={flex({
          flex: 1,
          py: "6",
          flexDir: "column",
          gap: "1.5",
          px: "3",
        })}
      >
        {navItems
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cx(
                  css({
                    display: "flex",
                    alignItems: "center",
                    gap: "0",
                    borderRadius: "lg",
                    p: "3",
                    fontSize: "sm",
                    fontWeight: "medium",
                    transition: "all",
                    transitionDuration: "200ms",
                    overflow: "hidden",
                  }),
                  isActive
                    ? css({
                        bg: "brand.primary/10",
                        color: "brand.primary",
                        boxShadow: "inset 2px 0 0 0 {colors.brand.primary}",
                      })
                    : css({
                        color: "text.muted",
                        _hover: { color: "text.main", bg: "whiteAlpha.50" },
                      }),
                )
              }
              title={!isExpanded ? item.label : undefined}
            >
              <div
                className={flex({
                  w: "8",
                  justify: "center",
                  align: "center",
                  flexShrink: 0,
                })}
              >
                <item.icon
                  className={css({
                    w: "5",
                    h: "5",
                    transition: "transform",
                    transitionDuration: "200ms",
                  })}
                />
              </div>
              <span
                className={cx(
                  css({
                    whiteSpace: "nowrap",
                    transition: "all",
                    transitionDuration: "300ms",
                    pl: "2",
                  }),
                  isExpanded
                    ? css({ opacity: 1, w: "auto" })
                    : css({ opacity: 0, w: "0", display: "none" }),
                )}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
      </nav>

      {/* User Profile Mini preview */}
      <div
        className={cx(
          flex({
            p: "4",
            borderTop: "1px solid",
            borderColor: "whiteAlpha.100",
            align: "center",
            gap: "3",
            transition: "opacity",
            overflow: "hidden",
          }),
          isExpanded
            ? css({ opacity: 1 })
            : css({ opacity: 0, h: "0", display: "none" }),
        )}
      >
        <ProfileCircle size="sm" />
        <div className={flex({ flexDir: "column", whiteSpace: "nowrap" })}>
          <span
            className={css({
              fontSize: "sm",
              fontWeight: "bold",
              color: "text.bright",
              letterSpacing: "tight",
            })}
          >
            {user?.name || user?.email?.split("@")[0] || "Administrateur"}
          </span>
          <RoleBadge role={user?.role || "viewer"} showIcon={false} />
        </div>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className={css({
            ml: "auto",
            p: "2",
            color: "gray.500",
            _hover: { color: "red.400", bg: "red.500/10" },
            borderRadius: "lg",
            transition: "all",
          })}
          title="Déconnexion"
        >
          <LogOut className={css({ w: "5", h: "5" })} />
        </button>
      </div>

      {!isExpanded && (
        <div
          className={flex({
            mt: "auto",
            p: "4",
            justify: "center",
            borderTop: "1px solid",
            borderColor: "whiteAlpha.100",
          })}
        >
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={css({
              p: "2",
              color: "gray.500",
              _hover: { color: "red.400", bg: "red.500/10" },
              borderRadius: "lg",
              transition: "all",
            })}
            title="Déconnexion"
          >
            <LogOut className={css({ w: "5", h: "5" })} />
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ? Votre session sera terminée."
        confirmText="Se déconnecter"
        cancelText="Annuler"
      />
    </aside>
  );
};
