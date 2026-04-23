import React from "react";
import { CreditCard, Receipt, TrendingUp, ShieldCheck } from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex, grid } from "styled-system/patterns";
import {
  card,
  sectionTitle,
  button as buttonRecipe,
} from "styled-system/recipes";

export const Billing: React.FC = () => {
  return (
    <div
      className={css({
        maxWidth: "6xl",
        mx: "auto",
        px: "4",
        py: "8",
      })}
    >
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
          <h1
            className={css({
              fontSize: "5xl",
              fontWeight: "900",
              color: "white",
              letterSpacing: "tighter",
            })}
          >
            Facturation
          </h1>
          <p
            className={css({
              color: "text.muted",
              fontSize: "lg",
              fontWeight: "medium",
              maxW: "xl",
              lineHeight: "relaxed",
            })}
          >
            Gérez votre abonnement, vos factures et vos méthodes de paiement.
          </p>
        </div>
      </div>

      <div className={grid({ columns: { base: 1, md: 3 }, gap: "6" })}>
        {/* Status Card */}
        <div
          className={cx(card(), css({ gridColumn: { md: "span 2" }, p: "8" }))}
        >
          <div
            className={flex({
              justify: "space-between",
              align: "start",
              mb: "8",
            })}
          >
            <div className={css({ "& > * + *": { mt: "1" } })}>
              <h2 className={sectionTitle()}>Plan Actuel</h2>
              <p className={css({ color: "text.muted", fontSize: "sm" })}>
                Votre abonnement se renouvelle le 12 Mai 2026.
              </p>
            </div>
            <span
              className={css({
                px: "3",
                py: "1",
                borderRadius: "full",
                bg: "brand.primary/10",
                color: "brand.primary",
                border: "1px solid",
                borderColor: "brand.primary/20",
                fontSize: "xs",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "wider",
              })}
            >
              Premium Enterprise
            </span>
          </div>

          <div className={grid({ columns: { base: 1, sm: 2 }, gap: "8" })}>
            <div
              className={flex({
                p: "6",
                bg: "whiteAlpha.50",
                borderRadius: "xl",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                align: "center",
                gap: "4",
              })}
            >
              <div
                className={flex({
                  w: "12",
                  h: "12",
                  borderRadius: "lg",
                  bg: "brand.primary/10",
                  align: "center",
                  justify: "center",
                  color: "brand.primary",
                })}
              >
                <TrendingUp className={css({ w: "6", h: "6" })} />
              </div>
              <div>
                <p
                  className={css({
                    fontSize: "xs",
                    color: "text.muted",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    letterSpacing: "tight",
                  })}
                >
                  Usage Mensuel
                </p>
                <div className={flex({ align: "baseline", gap: "2" })}>
                  <span
                    className={css({
                      fontSize: "2xl",
                      fontWeight: "bold",
                      color: "white",
                    })}
                  >
                    1,248
                  </span>
                  <span
                    className={css({ fontSize: "sm", color: "text.muted" })}
                  >
                    / 5,000 scans
                  </span>
                </div>
              </div>
            </div>

            <div
              className={flex({
                p: "6",
                bg: "whiteAlpha.50",
                borderRadius: "xl",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                align: "center",
                gap: "4",
              })}
            >
              <div
                className={flex({
                  w: "12",
                  h: "12",
                  borderRadius: "lg",
                  bg: "orange.500/10",
                  align: "center",
                  justify: "center",
                  color: "orange.400",
                })}
              >
                <Receipt className={css({ w: "6", h: "6" })} />
              </div>
              <div>
                <p
                  className={css({
                    fontSize: "xs",
                    color: "text.muted",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    letterSpacing: "tight",
                  })}
                >
                  Dernière Facture
                </p>
                <div className={flex({ align: "baseline", gap: "2" })}>
                  <span
                    className={css({
                      fontSize: "2xl",
                      fontWeight: "bold",
                      color: "white",
                    })}
                  >
                    499.00€
                  </span>
                  <span
                    className={css({ fontSize: "sm", color: "emerald.400" })}
                  >
                    Payé
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={flex({ mt: "10", gap: "4" })}>
            <button className={buttonRecipe({ variant: "primary" })}>
              Changer de Plan
            </button>
            <button className={buttonRecipe({ variant: "secondary" })}>
              Historique des Paiements
            </button>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className={cx(card(), flex({ direction: "column", p: "8" }))}>
          <div className={flex({ align: "center", gap: "3", mb: "6" })}>
            <CreditCard
              className={css({ w: "5", h: "5", color: "brand.primary" })}
            />
            <h2 className={sectionTitle()}>Méthode de Paiement</h2>
          </div>

          <div
            className={flex({
              flex: "1",
              direction: "column",
              justify: "center",
              align: "center",
              textAlign: "center",
              p: "6",
              border: "2px dashed",
              borderColor: "whiteAlpha.100",
              borderRadius: "xl",
              bg: "whiteAlpha.50",
              mb: "6",
            })}
          >
            <div
              className={flex({
                w: "16",
                h: "10",
                bg: "brand.primary/10",
                borderRadius: "md",
                border: "1px solid",
                borderColor: "brand.primary/20",
                align: "center",
                justify: "center",
                mb: "4",
              })}
            >
              <span
                className={css({
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "xs",
                  textTransform: "uppercase",
                })}
              >
                Visa
              </span>
            </div>
            <p
              className={css({
                fontSize: "sm",
                color: "white",
                fontWeight: "medium",
                mb: "1",
              })}
            >
              •••• •••• •••• 4242
            </p>
            <p className={css({ fontSize: "xs", color: "text.muted" })}>
              Expire le 04/28
            </p>
          </div>

          <button
            className={cx(
              buttonRecipe({ variant: "secondary" }),
              css({ w: "full" }),
            )}
          >
            Modifier la Carte
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div
        className={flex({
          align: "center",
          gap: "4",
          p: "4",
          bg: "emerald.500/5",
          border: "1px solid",
          borderColor: "emerald.500/20",
          borderRadius: "xl",
        })}
      >
        <ShieldCheck
          className={css({ w: "5", h: "5", color: "emerald.500" })}
        />
        <p
          className={css({
            fontSize: "xs",
            color: "emerald.500/80",
            fontWeight: "medium",
          })}
        >
          Vos informations de paiement sont sécurisées par chiffrement de bout
          en bout conforme aux normes PCI-DSS.
        </p>
      </div>
    </div>
  );
};
