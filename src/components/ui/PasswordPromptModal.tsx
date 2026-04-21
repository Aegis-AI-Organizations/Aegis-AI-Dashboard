import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, X } from "lucide-react";

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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-[#0B0D13] border border-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <Lock className="w-6 h-6 text-cyan-400" />
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

          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {message}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              ref={inputRef}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe actuel"
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors border border-gray-700"
              >
                {cancelText}
              </button>
              <button
                type="submit"
                disabled={!password}
                className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
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
