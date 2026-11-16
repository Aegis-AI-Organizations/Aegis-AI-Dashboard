import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MoreHorizontal, X } from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { useAuthStore } from "../../store/AuthStore";
import { navItemsFor } from "../../constants/navigation";

/** Entries shown directly in the bottom bar; the rest go in the "Plus" sheet. */
const BAR_SIZE = 4;

const itemClass = (isActive: boolean) =>
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
  );

export const MobileNav: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  if (!user) return null;
  const items = navItemsFor(user.role);
  const needsMore = items.length > BAR_SIZE + 1;
  const barItems = needsMore ? items.slice(0, BAR_SIZE) : items;
  const moreItems = needsMore ? items.slice(BAR_SIZE) : [];
  const moreIsActive = moreItems.some((item) =>
    item.path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.path),
  );

  return (
    <>
      {open && (
        <div
          className={css({
            display: { base: "block", md: "none" },
            position: "fixed",
            inset: 0,
            bg: "black/60",
            zIndex: 49,
          })}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      {open && (
        <div
          id="mobile-more-menu"
          role="dialog"
          aria-label="Autres pages"
          className={css({
            display: { base: "block", md: "none" },
            position: "fixed",
            left: "3",
            right: "3",
            bottom: "calc(4.5rem + env(safe-area-inset-bottom))",
            bg: "bg.card",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            borderRadius: "2xl",
            p: "2",
            zIndex: 51,
          })}
        >
          {moreItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cx(
                  flex({
                    align: "center",
                    gap: "3",
                    px: "4",
                    py: "3",
                    borderRadius: "xl",
                    fontSize: "sm",
                  }),
                  isActive
                    ? css({ color: "cyan.400", bg: "cyan.400/10" })
                    : css({ color: "gray.300" }),
                )
              }
            >
              <item.icon className={css({ w: "5", h: "5" })} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
      <nav
        aria-label="Navigation principale"
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
          {barItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => itemClass(isActive)}
            >
              <item.icon className={css({ w: "5", h: "5" })} />
              <span
                className={css({ fontSize: "[10px]", fontWeight: "medium" })}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
          {needsMore && (
            <button
              type="button"
              className={itemClass(open || moreIsActive)}
              aria-expanded={open}
              aria-controls="mobile-more-menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? (
                <X className={css({ w: "5", h: "5" })} />
              ) : (
                <MoreHorizontal className={css({ w: "5", h: "5" })} />
              )}
              <span
                className={css({ fontSize: "[10px]", fontWeight: "medium" })}
              >
                Plus
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};
