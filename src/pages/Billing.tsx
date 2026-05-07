import React, { useState } from "react";
import {
  CreditCard,
  Receipt,
  Plus,
  RefreshCw,
  Search,
  Building2,
  ChevronRight,
} from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import {
  pageTitle,
  pageSubtitle,
  sectionTitle,
  card,
  button as buttonRecipe,
} from "styled-system/recipes";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/AuthStore";
import { useBilling } from "../hooks/useBilling";
import { useCompanies } from "../hooks/useCompanies";
import type { Company } from "../hooks/useCompanies";
import { BillingUsageChart } from "../components/billing/BillingUsageChart";
import { BillingLedgerTable } from "../components/billing/BillingLedgerTable";
import { BillingTokenAdjustmentModal } from "../components/billing/BillingTokenAdjustmentModal";
import { LoadingPage } from "../components/ui/LoadingPage";

export const Billing: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCompanyId = searchParams.get("company_id");

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companySearch, setCompanySearch] = useState("");

  const {
    balance,
    ledger,
    stats,
    isLoading: isBillingLoading,
    error: billingError,
    refresh,
    adjustTokens,
  } = useBilling(selectedCompany?.id || initialCompanyId || undefined);

  const {
    companies,
    isLoading: isCompaniesLoading,
    error: companiesError,
  } = useCompanies(companySearch);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const isInternal = ["superadmin", "admin", "billing_aegis"].includes(
    user?.role || "",
  );

  // If we have an initialCompanyId but it's loaded, and we want to change company
  const handleClearSelection = () => {
    setSelectedCompany(null);
    setSearchParams({});
  };

  // If internal and no company selected/provided in URL, show selection view
  const showSelectionView = isInternal && !selectedCompany && !initialCompanyId;

  if (!user) return <LoadingPage />;
  if (isBillingLoading && !showSelectionView) return <LoadingPage />;

  return (
    <div className={css({ "& > * + *": { mt: "sectionGap" } })}>
      <div
        className={flex({
          direction: { base: "column", md: "row" },
          justify: "space-between",
          align: { base: "start", md: "end" },
          gap: "6",
        })}
      >
        <div className={css({ "& > * + *": { mt: "2" } })}>
          <h1 className={pageTitle()}>
            {selectedCompany
              ? `Billing: ${selectedCompany.name}`
              : "Facturation & Licences"}
          </h1>
          <p className={pageSubtitle()}>
            {isInternal
              ? "Interface de gestion financière globale et remédiation client."
              : "Suivez votre consommation de tokens et gérez vos plans."}
          </p>
        </div>
        <div className={flex({ gap: "3" })}>
          {(selectedCompany || initialCompanyId) && (
            <button
              onClick={handleClearSelection}
              className={buttonRecipe({ variant: "secondary" })}
            >
              Changer d'entreprise
            </button>
          )}
          <button
            onClick={() => refresh()}
            className={buttonRecipe({ variant: "secondary" })}
          >
            <RefreshCw className={css({ w: "4", h: "4", mr: "2" })} />
            Actualiser
          </button>
        </div>
      </div>

      {showSelectionView ? (
        <div className={css({ "& > * + *": { mt: "8" } })}>
          {/* Company Search and Selection for Back-office */}
          <div className={css({ position: "relative" })}>
            <div
              className={css({
                position: "absolute",
                insetY: "0",
                left: "4",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              })}
            >
              <Search className={css({ w: "5", h: "5", color: "gray.500" })} />
            </div>
            <input
              type="text"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              placeholder="Rechercher un client pour gérer sa facturation..."
              className={css({
                w: "full",
                bg: "bg.card",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                color: "white",
                borderRadius: "2xl",
                pl: "12",
                pr: "4",
                py: "4",
                fontSize: "lg",
                _focus: { outline: "none", borderColor: "brand.primary" },
                _placeholder: { color: "gray.600" },
              })}
            />
          </div>

          <div
            className={grid({ columns: { base: 1, md: 2, lg: 3 }, gap: "6" })}
          >
            {isCompaniesLoading ? (
              <div
                className={css({
                  gridColumn: "span 1 / -1",
                  py: "20",
                  textAlign: "center",
                })}
              >
                <RefreshCw
                  className={css({
                    w: "8",
                    h: "8",
                    mx: "auto",
                    animation: "spin 1s linear infinite",
                    color: "brand.primary",
                  })}
                />
              </div>
            ) : companiesError ? (
              <div
                className={css({
                  gridColumn: "span 1 / -1",
                  py: "10",
                  textAlign: "center",
                  color: "rose.400",
                })}
              >
                {companiesError}
              </div>
            ) : companies.length === 0 ? (
              <div
                className={css({
                  gridColumn: "span 1 / -1",
                  py: "20",
                  textAlign: "center",
                  color: "text.muted",
                })}
              >
                Aucune entreprise trouvée.
              </div>
            ) : (
              companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompany(company)}
                  className={cx(
                    card(),
                    css({
                      p: "6",
                      cursor: "pointer",
                      transition: "all",
                      _hover: {
                        borderColor: "brand.primary",
                        bg: "whiteAlpha.50",
                      },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }),
                  )}
                >
                  <div className={flex({ align: "center", gap: "4" })}>
                    <div
                      className={css({
                        w: "12",
                        h: "12",
                        bg: "whiteAlpha.100",
                        borderRadius: "xl",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "brand.primary",
                      })}
                    >
                      <Building2 className={css({ w: "6", h: "6" })} />
                    </div>
                    <div>
                      <h3
                        className={css({ fontWeight: "bold", color: "white" })}
                      >
                        {company.name}
                      </h3>
                      <p
                        className={css({ fontSize: "xs", color: "text.muted" })}
                      >
                        {company.owner_email}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={css({ w: "5", h: "5", color: "gray.600" })}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={grid({ columns: { base: 1, lg: 3 }, gap: "6" })}>
            {/* Main Stats Card */}
            <div
              className={cx(
                card(),
                css({ gridColumn: { lg: "span 2" }, p: "8" }),
              )}
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
                {(!isInternal || selectedCompany) && (
                  <button
                    onClick={() =>
                      isInternal ? setIsAdjustModalOpen(true) : null
                    }
                    className={buttonRecipe({ variant: "primary" })}
                  >
                    {isInternal ? (
                      <>
                        <Plus className={css({ w: "4", h: "4", mr: "2" })} />
                        Ajuster le Solde
                      </>
                    ) : (
                      "Acheter des Tokens"
                    )}
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
                  className={css({
                    fontSize: "sm",
                    color: "text.muted",
                    mb: "6",
                  })}
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
            </div>

            {billingError ? (
              <div
                className={css({
                  py: "12",
                  textAlign: "center",
                  color: "rose.400",
                })}
              >
                {billingError}
              </div>
            ) : (
              <BillingLedgerTable entries={ledger} />
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {selectedCompany && (
        <BillingTokenAdjustmentModal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          onSubmit={async (amount, reason) => {
            await adjustTokens(selectedCompany.id, amount, reason);
          }}
          companyName={selectedCompany.name}
        />
      )}
    </div>
  );
};
