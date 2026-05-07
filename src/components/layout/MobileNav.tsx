import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Users,
  Settings,
  Terminal,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Shield, label: "Scans", path: "/vulnerabilities" },
  { icon: Users, label: "Équipes", path: "/users" },
  { icon: Terminal, label: "Audit", path: "/audit" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

export const MobileNav: React.FC = () => {
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
        {navItems.map((item) => (
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
