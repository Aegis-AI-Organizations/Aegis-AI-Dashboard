import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Users,
  Settings,
  Shield,
  Terminal,
} from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";

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
    label: "Équipes",
    path: "/users",
    roles: ["superadmin", "admin", "owner"],
  },
  {
    icon: Shield,
    label: "Facturation",
    path: "/billing",
    roles: ["superadmin", "admin", "billing_aegis", "owner", "billing_client"],
  },
  {
    icon: Terminal,
    label: "Logs d'Audit",
    path: "/audit",
    roles: ["superadmin", "owner"],
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
  const user = useAuthStore((s) => s.user);
  return (
    <aside
      className={cx(
        css({
          display: { base: "none", md: "flex" },
          flexDir: "column",
          bg: "bg.main/95",
          backdropBlur: "md",
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
              color: "white",
              fontWeight: "900",
              fontSize: "xl",
              fontFamily: "orbitron",
              letterSpacing: "widest",
              whiteSpace: "nowrap",
              transition: "all",
              transitionDuration: "300ms",
              textShadow: "0 0 10px rgba(0,242,255,0.3)",
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
                        position: "relative",
                        _before: {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "2",
                          bottom: "2",
                          width: "2px",
                          bg: "brand.primary",
                          borderRadius: "full",
                        },
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
    </aside>
  );
};
