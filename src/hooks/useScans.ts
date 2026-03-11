import { useState, useEffect, useCallback } from "react";
import type { ScanStatusResponse } from "../types/scan";

export const useScans = () => {
  const [scans, setScans] = useState<ScanStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getApiUrl = () => {
    return (
      import.meta.env.VITE_API_GATEWAY_URL ||
      import.meta.env.API_GATEWAY_URL ||
      ""
    );
  };

  const fetchScans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiUrl()}/scans`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data: ScanStatusResponse[] = await response.json();

      data.sort((a, b) => {
        const timeA = a.started_at ? new Date(a.started_at).getTime() : 0;
        const timeB = b.started_at ? new Date(b.started_at).getTime() : 0;
        return timeB - timeA;
      });

      setScans(data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des scans :", err);
      setError("Impossible de charger l'historique des pentests.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  return { scans, isLoading, error, refetch: fetchScans };
};
