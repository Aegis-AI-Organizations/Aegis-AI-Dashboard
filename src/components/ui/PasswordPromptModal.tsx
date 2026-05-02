import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, X } from "lucide-react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  title: string;
  message: string;
  submitText?: string;
  cancelText?: string;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  submitText = "Valider",
  cancelText = "Annuler",
}) => {
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      // Petit timeout pour laisser le temps au DOM de se peindre avant le focus
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      onSubmit(password);
    }
  };

  const modalContent = (
    <div
      className={css({
        position: "fixed",
        inset: "0",
        zIndex: "9999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "4",
        bg: "black/60",
        backdropBlur: "sm",
        animation: "fadeIn 0.2s ease-out",
      })}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={css({
          bg: "bg.card",
          border: "1px solid",
          borderColor: "whiteAlpha.100",
          borderRadius: "xl",
          boxShadow: "2xl",
          maxW: "md",
          w: "full",
          overflow: "hidden",
          animation: "zoomIn 0.2s ease-out",
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={css({ p: "6" })}>
          <div className={flex({ align: "center", gap: "4", mb: "4" })}>
            <div
              className={css({
                p: "3",
                borderRadius: "full",
                bg: "brand.primary/10",
                border: "1px solid",
                borderColor: "brand.primary/20",
              })}
            >
              <Lock
                className={css({ w: "6", h: "6", color: "brand.primary" })}
              />
            </div>
            <div>
              <h3
                id="modal-title"
                className={css({
                  fontSize: "lg",
                  fontWeight: "semibold",
                  color: "white",
                  letterSpacing: "tight",
                })}
              >
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={css({
                ml: "auto",
                p: "1.5",
                color: "gray.500",
                _hover: { color: "white", bg: "whiteAlpha.100" },
                borderRadius: "lg",
                transition: "colors",
              })}
              aria-label="Fermer la modale"
            >
              <X className={css({ w: "5", h: "5" })} />
            </button>
          </div>

          <p
            className={css({
              color: "text.muted",
              fontSize: "sm",
              lineHeight: "relaxed",
              mb: "6",
            })}
          >
            {message}
          </p>

          <form onSubmit={handleSubmit} className={css({ spaceY: "6" })}>
            <input
              ref={inputRef}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe actuel"
              className={css({
                w: "full",
                bg: "whiteAlpha.50",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                color: "white",
                borderRadius: "xl",
                px: "4",
                py: "3",
                _focus: {
                  outline: "none",
                  borderColor: "brand.primary",
                  ring: "2px",
                  ringColor: "brand.primary/20",
                },
                transition: "all",
              })}
            />

            <div className={flex({ align: "center", gap: "3" })}>
              <button
                type="button"
                onClick={onClose}
                className={css({
                  flex: "1",
                  px: "4",
                  py: "2",
                  bg: "whiteAlpha.100",
                  _hover: { bg: "whiteAlpha.200" },
                  color: "white",
                  fontSize: "sm",
                  fontWeight: "medium",
                  borderRadius: "lg",
                  transition: "colors",
                  border: "1px solid",
                  borderColor: "whiteAlpha.100",
                })}
              >
                {cancelText}
              </button>
              <button
                type="submit"
                disabled={!password}
                className={css({
                  flex: "1",
                  px: "4",
                  py: "2",
                  bg: "brand.primary",
                  _hover: { bg: "cyan.500" },
                  _disabled: { opacity: "50", cursor: "not-allowed" },
                  color: "white",
                  fontSize: "sm",
                  fontWeight: "medium",
                  borderRadius: "lg",
                  transition: "colors",
                  boxShadow: "0 4px 12px rgba(0, 242, 255, 0.2)",
                })}
              >
                {submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
