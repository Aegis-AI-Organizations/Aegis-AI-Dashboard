import React from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { css } from "styled-system/css";
import { table, badge } from "styled-system/recipes";

interface LedgerEntry {
  id: string;
  amount: number;
  reason: string;
  scan_id?: string;
  created_at: string;
}

interface Props {
  entries: LedgerEntry[];
}

export const BillingLedgerTable: React.FC<Props> = ({ entries }) => {
  return (
    <div className={css({ mt: "6", overflowX: "auto" })}>
      <table className={table()}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Motif</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className={css({ whiteSpace: "nowrap" })}>
                {format(parseISO(entry.created_at), "dd MMM yyyy HH:mm", {
                  locale: fr,
                })}
              </td>
              <td>
                <span
                  className={badge({
                    variant: entry.amount > 0 ? "success" : "danger",
                  })}
                >
                  {entry.amount > 0 ? "CRÉDIT" : "DÉBIT"}
                </span>
              </td>
              <td
                className={css({
                  fontWeight: "bold",
                  color: entry.amount > 0 ? "emerald.400" : "rose.400",
                })}
              >
                {entry.amount > 0 ? "+" : ""}
                {entry.amount} jetons
              </td>
              <td className={css({ color: "text.muted", fontSize: "sm" })}>
                {entry.reason}
                {entry.scan_id && (
                  <div
                    className={css({ fontSize: "xs", mt: "1", opacity: 0.6 })}
                  >
                    Scan ID: {entry.scan_id.substring(0, 8)}...
                  </div>
                )}
              </td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className={css({
                  textAlign: "center",
                  py: "12",
                  color: "text.muted",
                })}
              >
                Aucun historique de transaction disponible.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
