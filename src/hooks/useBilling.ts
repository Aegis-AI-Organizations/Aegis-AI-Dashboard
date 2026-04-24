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

export const useBilling = (targetCompanyId?: string) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [stats, setStats] = useState<UsageDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const baseUrl = targetCompanyId
        ? `/admin/companies/${targetCompanyId}/billing`
        : "/billing";

      const [balanceRes, ledgerRes, statsRes] = await Promise.all([
        api.get<Balance>(`${baseUrl}/balance`),
        api.get<{ entries: LedgerEntry[] }>(`${baseUrl}/ledger`),
        api.get<{ days: UsageDay[] }>(`${baseUrl}/stats`),
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
  }, [targetCompanyId]);

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
