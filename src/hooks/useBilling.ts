import { useState, useEffect, useCallback } from "react";
import { api } from "../api/Axios";

export interface Balance {
  company_id: string;
  balance: number;
}

export interface LedgerEntry {
  id: string;
  amount: number;
  reason: string;
  scan_id?: string;
  created_at: string;
}

export interface UsageDay {
  date: string;
  total_consumed: number;
}

export const useBilling = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<UsageDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [balanceRes, ledgerRes, statsRes] = await Promise.all([
        api.get<Balance>("/billing/balance"),
        api.get<{ entries: LedgerEntry[] }>("/billing/ledger"),
        api.get<{ days: UsageDay[] }>("/billing/stats"),
      ]);

      setBalance(balanceRes.data.balance);
      setLedger(ledgerRes.data.entries || []);
      setStats(statsRes.data.days || []);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Erreur lors du chargement des données de facturation",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const adjustTokens = async (
    companyId: string,
    amount: number,
    reason: string,
  ) => {
    await api.post(`/admin/companies/${companyId}/tokens/adjust`, {
      amount,
      reason,
    });
    // Refresh data after adjustment
    fetchBillingData();
  };

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  return {
    balance,
    ledger,
    stats,
    isLoading,
    error,
    refresh: fetchBillingData,
    adjustTokens,
  };
};
