import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * ConfirmationModal with full Accessibility (ARIA, Focus management, Keyboard support)
 * Uses React Portal to avoid being trapped in sub-layouts.
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Focus management: Trap focus and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    // Focus the primary button when open
    confirmBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Simple focus trap: prevent tabbing outside the modal
      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        aria-describedby="modal-desc"
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
                bg: "red.500/10",
                border: "1px solid",
                borderColor: "red.500/20",
              })}
            >
              <AlertCircle
                className={css({ w: "6", h: "6", color: "red.400" })}
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
            id="modal-desc"
            className={css({
              color: "text.muted",
              fontSize: "sm",
              lineHeight: "relaxed",
              mb: "6",
            })}
          >
            {message}
          </p>

          <div className={flex({ align: "center", gap: "3" })}>
            <button
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
              ref={confirmBtnRef}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={css({
                flex: "1",
                px: "4",
                py: "2",
                bg: "red.600",
                _hover: { bg: "red.500" },
                color: "white",
                fontSize: "sm",
                fontWeight: "medium",
                borderRadius: "lg",
                transition: "colors",
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
              })}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
