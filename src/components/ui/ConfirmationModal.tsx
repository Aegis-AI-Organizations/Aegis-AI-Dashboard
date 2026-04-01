import React, { useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        className="bg-[#0B0D13] border border-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3
                id="modal-title"
                className="text-lg font-semibold text-white tracking-tight"
              >
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="ml-auto p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Fermer la modale"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p
            id="modal-desc"
            className="text-gray-400 text-sm leading-relaxed mb-6"
          >
            {message}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-red-900/20"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
