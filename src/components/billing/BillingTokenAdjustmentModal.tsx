import React, { useState } from "react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";
import {
  card,
  button as buttonRecipe,
  input as inputRecipe,
  sectionTitle,
} from "styled-system/recipes";
import { X, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, reason: string) => Promise<void>;
  companyName: string;
}

export const BillingTokenAdjustmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  companyName,
}) => {
  const [amount, setAmount] = useState<string>("0");
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const numAmount = parseInt(amount, 10);
      if (isNaN(numAmount)) throw new Error("Montant invalide");
      if (reason.trim().length < 5)
        throw new Error("Veuillez fournir un motif plus détaillé");

      await onSubmit(numAmount, reason);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={css({
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: "4",
        bg: "black/60",
        backdropFilter: "blur(4px)",
      })}
    >
      <div
        className={css({
          w: "full",
          maxW: "md",
          animation: "fade-in 0.2s ease-out",
        })}
      >
        <div className={card({ p: "0", overflow: "hidden" })}>
          <div
            className={flex({
              justify: "space-between",
              align: "center",
              p: "6",
              borderBottom: "1px solid",
              borderColor: "whiteAlpha.100",
            })}
          >
            <h3 className={sectionTitle()}>Ajustement de Tokens</h3>
            <button
              onClick={onClose}
              className={css({
                color: "text.muted",
                _hover: { color: "white" },
              })}
            >
              <X className={css({ w: "5", h: "5" })} />
            </button>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className={css({ p: "6", "& > * + *": { mt: "4" } })}
          >
            <p className={css({ fontSize: "sm", color: "text.muted" })}>
              Vous allez modifier le solde de{" "}
              <span className={css({ color: "white", fontWeight: "bold" })}>
                {companyName}
              </span>
              .
            </p>

            <div>
              <label
                className={css({
                  display: "block",
                  fontSize: "xs",
                  fontWeight: "bold",
                  mb: "2",
                  color: "text.muted",
                  textTransform: "uppercase",
                })}
              >
                Montant (positif ou négatif)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputRecipe()}
                placeholder="Ex: 50 ou -20"
                required
              />
            </div>

            <div>
              <label
                className={css({
                  display: "block",
                  fontSize: "xs",
                  fontWeight: "bold",
                  mb: "2",
                  color: "text.muted",
                  textTransform: "uppercase",
                })}
              >
                Motif Obligatoire
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={css({
                  w: "full",
                  p: "3",
                  bg: "whiteAlpha.50",
                  border: "1px solid",
                  borderColor: "whiteAlpha.100",
                  borderRadius: "md",
                  color: "white",
                  fontSize: "sm",
                  minH: "100px",
                  _focus: { outline: "none", borderColor: "brand.primary" },
                })}
                placeholder="Ex: Ajustement manuel ou remboursement scan #123"
                required
              />
            </div>

            {error && (
              <div
                className={flex({
                  align: "center",
                  gap: "2",
                  p: "3",
                  bg: "rose.500/10",
                  border: "1px solid",
                  borderColor: "rose.500/20",
                  borderRadius: "md",
                  color: "rose.400",
                  fontSize: "xs",
                })}
              >
                <AlertCircle className={css({ w: "4", h: "4" })} />
                {error}
              </div>
            )}

            <div className={flex({ gap: "3", pt: "2" })}>
              <button
                type="button"
                onClick={onClose}
                className={buttonRecipe({ variant: "secondary" })}
                style={{ flex: 1 }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={buttonRecipe({ variant: "primary" })}
                style={{ flex: 1 }}
              >
                {isLoading ? "Application..." : "Confirmer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
