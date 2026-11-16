import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, Search } from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { useAuthStore } from "../../store/AuthStore";
import { navItemsFor } from "../../constants/navigation";

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

type Props = { open: boolean; onClose: () => void };

/** ⌘K palette: jump to any page the current role can open. */
export const CommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = normalize(query);
    return navItemsFor(role).filter(
      (item) => !q || normalize(item.label).includes(q),
    );
  }, [query, role]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    inputRef.current?.focus();
    return () => returnFocus.current?.focus?.();
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0,
      );
    } else if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].path);
    }
  };

  return createPortal(
    <div
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 100,
        bg: "black/60",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: "[15vh]",
        px: "4",
      })}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Aller à une page"
        onKeyDown={onKeyDown}
        className={css({
          w: "full",
          maxW: "lg",
          bg: "bg.card",
          border: "1px solid",
          borderColor: "whiteAlpha.100",
          borderRadius: "xl",
          overflow: "hidden",
          boxShadow: "2xl",
        })}
      >
        <div
          className={flex({
            align: "center",
            gap: "3",
            px: "4",
            borderBottom: "1px solid",
            borderColor: "whiteAlpha.100",
          })}
        >
          <Search className={css({ w: "4", h: "4", color: "gray.500" })} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Aller à une page…"
            aria-label="Rechercher une page"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            aria-activedescendant={
              results[active] ? `command-${results[active].path}` : undefined
            }
            className={css({
              flex: 1,
              bg: "transparent",
              py: "3.5",
              fontSize: "sm",
              color: "text.main",
              outline: "none",
              _placeholder: { color: "gray.600" },
            })}
          />
          <kbd
            className={css({
              fontSize: "[10px]",
              color: "gray.500",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              borderRadius: "sm",
              px: "1.5",
            })}
          >
            Échap
          </kbd>
        </div>
        <ul
          id="command-palette-results"
          role="listbox"
          className={css({ p: "2", maxH: "80", overflowY: "auto" })}
        >
          {results.length === 0 && (
            <li
              className={css({
                px: "3",
                py: "6",
                textAlign: "center",
                fontSize: "sm",
                color: "gray.500",
              })}
            >
              Aucune page ne correspond à « {query} ».
            </li>
          )}
          {results.map((item, index) => (
            <li
              key={item.path}
              id={`command-${item.path}`}
              role="option"
              aria-selected={index === active}
              onMouseMove={() => setActive(index)}
              onClick={() => go(item.path)}
              className={cx(
                flex({
                  align: "center",
                  gap: "3",
                  px: "3",
                  py: "2.5",
                  borderRadius: "lg",
                  fontSize: "sm",
                  cursor: "pointer",
                }),
                index === active
                  ? css({ bg: "whiteAlpha.100", color: "text.main" })
                  : css({ color: "text.muted" }),
              )}
            >
              <item.icon className={css({ w: "4", h: "4" })} />
              <span className={css({ flex: 1 })}>{item.label}</span>
              {index === active && (
                <CornerDownLeft
                  className={css({ w: "3.5", h: "3.5", color: "gray.500" })}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
};
