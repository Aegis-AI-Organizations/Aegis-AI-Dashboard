import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Users,
  Settings,
  Terminal,
  Server,
  Building2,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { useAuthStore } from "../../store/AuthStore";
import type { UserRole } from "../../types/auth";

const allRoles: UserRole[] = [
  "superadmin",
  "admin",
  "billing_aegis",
  "technicien",
  "support",
  "owner",
  "operateur",
  "viewer",
];

type MobileNavItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles: UserRole[];
};

const navItems: MobileNavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: allRoles },
  {
    icon: Shield,
    label: "Scans",
    path: "/vulnerabilities",
    roles: [
      "superadmin",
      "admin",
      "technicien",
      "support",
      "owner",
      "operateur",
    ],
  },
  {
    icon: Users,
    label: "Équipes",
    path: "/users",
    roles: ["superadmin", "admin", "owner"],
  },
  {
    icon: Server,
    label: "Agents",
    path: "/agents",
    roles: ["superadmin", "admin", "owner"],
  },
  {
    icon: Building2,
    label: "Entreprise",
    path: "/company-settings",
    roles: ["owner"],
  },
  {
    icon: Terminal,
    label: "Audit",
    path: "/audit",
    roles: ["superadmin", "owner"],
  },
  { icon: Settings, label: "Paramètres", path: "/settings", roles: allRoles },
];

export const MobileNav: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const visibleItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <nav
      className={css({
        display: { base: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bg: "bg.card",
        pb: "env(safe-area-inset-bottom)",
        zIndex: 50,
      })}
    >
      <div
        className={flex({
          align: "center",
          justify: "space-around",
          h: "16",
          px: "2",
        })}
      >
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cx(
                flex({
                  direction: "column",
                  align: "center",
                  justify: "center",
                  w: "full",
                  h: "full",
                  gap: "1",
                  transition: "colors",
                }),
                isActive
                  ? css({ color: "cyan.400" })
                  : css({ color: "gray.500", _hover: { color: "gray.300" } }),
              )
            }
          >
            <item.icon className={css({ w: "5", h: "5" })} />
            <span className={css({ fontSize: "[10px]", fontWeight: "medium" })}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
