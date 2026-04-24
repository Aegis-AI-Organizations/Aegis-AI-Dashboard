import React, { useState } from "react";
import { CreditCard, Receipt, Plus, RefreshCw, Search } from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import {
  pageTitle,
  sectionTitle,
  card,
  button as buttonRecipe,
} from "styled-system/recipes";
import { useAuthStore } from "../store/AuthStore";
import { useBilling } from "../hooks/useBilling";
import { BillingUsageChart } from "../components/billing/BillingUsageChart";
import { BillingLedgerTable } from "../components/billing/BillingLedgerTable";
import { BillingTokenAdjustmentModal } from "../components/billing/BillingTokenAdjustmentModal";
import { LoadingPage } from "../components/ui/LoadingPage";

export const Billing: React.FC = () => {
  const { user } = useAuthStore();
  const { balance, ledger, stats, isLoading, error, refresh, adjustTokens } =
    useBilling();
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const isAdmin = ["superadmin", "admin", "billing_aegis"].includes(
    user?.role || "",
  );

  if (isLoading) return <LoadingPage />;

  return (
    <div className={css({ maxWidth: "7xl", mx: "auto", px: "4", py: "8" })}>
      <div
        className={flex({
          mb: "12",
          direction: { base: "column", md: "row" },
          justify: "space-between",
          align: { base: "start", md: "end" },
          gap: "6",
        })}
      >
        <div className={css({ "& > * + *": { mt: "2" } })}>
          <h1 className={pageTitle()}>Facturation & Licences</h1>
          <p
            className={css({
              color: "text.muted",
              fontSize: "lg",
              fontWeight: "medium",
              maxW: "xl",
              lineHeight: "relaxed",
            })}
          >
            {isAdmin
              ? "Interface de gestion financière globale et remédiation client."
              : "Suivez votre consommation de tokens et gérez vos plans."}
          </p>
        </div>
        <button
          onClick={() => refresh()}
          className={buttonRecipe({ variant: "secondary" })}
        >
          <RefreshCw className={css({ w: "4", h: "4", mr: "2" })} />
          Actualiser
        </button>
      </div>

      <div className={grid({ columns: { base: 1, lg: 3 }, gap: "6" })}>
        {/* Main Stats Card */}
        <div
          className={cx(card(), css({ gridColumn: { lg: "span 2" }, p: "8" }))}
        >
          <div
            className={flex({
              justify: "space-between",
              align: "start",
              mb: "8",
            })}
          >
            <div className={css({ "& > * + *": { mt: "1" } })}>
              <h2 className={sectionTitle()}>Consommation de Tokens</h2>
              <p className={css({ color: "text.muted", fontSize: "sm" })}>
                Utilisation cumulée sur les 30 derniers jours.
              </p>
            </div>
            <div className={flex({ direction: "column", align: "end" })}>
              <span
                className={css({
                  fontSize: "3xl",
                  fontWeight: "black",
                  color: "brand.primary",
                })}
              >
                {balance?.toLocaleString()}
              </span>
              <span
                className={css({
                  fontSize: "xs",
                  color: "text.muted",
                  textTransform: "uppercase",
                  letterSpacing: "widest",
                })}
              >
                Jetons disponibles
              </span>
            </div>
          </div>

          <BillingUsageChart data={stats} />

          <div className={flex({ mt: "10", gap: "4" })}>
            {!isAdmin && (
              <button className={buttonRecipe({ variant: "primary" })}>
                Acheter des Tokens
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setIsAdjustModalOpen(true)}
                className={buttonRecipe({ variant: "primary" })}
              >
                <Plus className={css({ w: "4", h: "4", mr: "2" })} />
                Ajuster le Solde
              </button>
            )}
            <button className={buttonRecipe({ variant: "secondary" })}>
              Voir les Factures
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className={flex({ direction: "column", gap: "6" })}>
          {/* Plan Info */}
          <div className={cx(card(), css({ p: "6" }))}>
            <h3
              className={css({
                fontSize: "xs",
                fontWeight: "bold",
                color: "text.muted",
                textTransform: "uppercase",
                mb: "4",
                letterSpacing: "widest",
              })}
            >
              Plan de Licence
            </h3>
            <div
              className={flex({
                align: "center",
                justify: "space-between",
                mb: "4",
              })}
            >
              <span
                className={css({
                  fontSize: "lg",
                  fontWeight: "bold",
                  color: "white",
                })}
              >
                Premium Pro
              </span>
              <span
                className={css({
                  px: "2",
                  py: "0.5",
                  bg: "emerald.500/10",
                  color: "emerald.400",
                  borderRadius: "md",
                  fontSize: "xs",
                  fontWeight: "bold",
                })}
              >
                ACTIF
              </span>
            </div>
            <p
              className={css({ fontSize: "sm", color: "text.muted", mb: "6" })}
            >
              Renouvellement automatique le 24 Mai 2026.
            </p>
            <button
              className={cx(
                buttonRecipe({ variant: "secondary" }),
                css({ w: "full" }),
              )}
            >
              Changer de Plan
            </button>
          </div>

          {/* Payment Method */}
          <div className={cx(card(), css({ p: "6" }))}>
            <div className={flex({ align: "center", gap: "3", mb: "4" })}>
              <CreditCard
                className={css({ w: "4", h: "4", color: "brand.primary" })}
              />
              <h3
                className={css({
                  fontSize: "xs",
                  fontWeight: "bold",
                  color: "text.muted",
                  textTransform: "uppercase",
                  letterSpacing: "widest",
                })}
              >
                Moyen de Paiement
              </h3>
            </div>
            <div
              className={flex({
                p: "4",
                bg: "whiteAlpha.50",
                borderRadius: "lg",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                align: "center",
                gap: "3",
              })}
            >
              <div
                className={flex({
                  w: "10",
                  h: "6",
                  bg: "white",
                  borderRadius: "sm",
                  align: "center",
                  justify: "center",
                  color: "blue.800",
                  fontWeight: "bold",
                  fontSize: "10px",
                })}
              >
                VISA
              </div>
              <div className={css({ flex: 1 })}>
                <p
                  className={css({
                    fontSize: "sm",
                    fontWeight: "bold",
                    color: "white",
                  })}
                >
                  •••• 4242
                </p>
                <p className={css({ fontSize: "xs", color: "text.muted" })}>
                  Exp: 04/28
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Section */}
      <div className={cx(card(), css({ mt: "8", p: "8" }))}>
        <div
          className={flex({
            justify: "space-between",
            align: "center",
            mb: "6",
          })}
        >
          <div className={flex({ align: "center", gap: "3" })}>
            <Receipt
              className={css({ w: "5", h: "5", color: "brand.primary" })}
            />
            <h2 className={sectionTitle()}>
              Historique du Registre (Token Ledger)
            </h2>
          </div>
          {isAdmin && (
            <div
              className={flex({
                align: "center",
                bg: "whiteAlpha.50",
                px: "3",
                py: "1.5",
                borderRadius: "md",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
              })}
            >
              <Search
                className={css({
                  w: "4",
                  h: "4",
                  color: "text.muted",
                  mr: "2",
                })}
              />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                className={css({
                  bg: "transparent",
                  border: "none",
                  outline: "none",
                  color: "white",
                  fontSize: "sm",
                  w: "200px",
                })}
              />
            </div>
          )}
        </div>

        {error ? (
          <div
            className={css({
              py: "12",
              textAlign: "center",
              color: "rose.400",
            })}
          >
            {error}
          </div>
        ) : (
          <BillingLedgerTable entries={ledger} />
        )}
      </div>

      {/* Modals */}
      <BillingTokenAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onSubmit={async (amount, reason) => {
          if (user?.company_id) {
            await adjustTokens(user.company_id, amount, reason);
          }
        }}
        companyName={user?.company_id ? "Client Actuel" : "N/A"}
      />
    </div>
  );
};
