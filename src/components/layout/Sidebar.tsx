import React from "react";
import { NavLink } from "react-router-dom";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { useAuthStore } from "../../store/AuthStore";
import { navItemsFor } from "../../constants/navigation";

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const items = navItemsFor(user?.role);

  return (
    <aside
      className={css({
        display: { base: "none", md: "flex" },
        flexDir: "column",
        w: "60",
        flexShrink: 0,
        bg: "bg.main/95",
        backdropBlur: "md",
        position: "sticky",
        top: "0",
        h: "screen",
        overflowY: "auto",
        zIndex: "50",
      })}
      aria-label="Navigation principale"
    >
      <div
        className={flex({
          align: "center",
          gap: "3",
          px: "5",
          h: "20",
          flexShrink: 0,
        })}
      >
        <img
          src="/logo.svg"
          alt="Aegis AI Logo"
          className={css({
            w: "9",
            h: "9",
            objectFit: "contain",
            flexShrink: 0,
          })}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />
        <span
          className={css({
            color: "white",
            fontWeight: "700",
            fontSize: "md",
            letterSpacing: "wider",
            whiteSpace: "nowrap",
          })}
        >
          AEGIS AI
        </span>
      </div>

      <nav
        className={flex({
          flex: 1,
          py: "4",
          flexDir: "column",
          gap: "1",
          px: "3",
        })}
      >
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cx(
                css({
                  display: "flex",
                  alignItems: "center",
                  gap: "3",
                  borderRadius: "lg",
                  px: "3",
                  py: "2.5",
                  fontSize: "sm",
                  fontWeight: "medium",
                  transition: "colors",
                  transitionDuration: "150ms",
                  whiteSpace: "nowrap",
                }),
                isActive
                  ? css({ bg: "brand.primary/10", color: "brand.primary" })
                  : css({
                      color: "text.muted",
                      _hover: { color: "text.main", bg: "whiteAlpha.50" },
                    }),
              )
            }
          >
            <item.icon className={css({ w: "5", h: "5", flexShrink: 0 })} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
