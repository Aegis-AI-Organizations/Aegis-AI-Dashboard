import { useState, useEffect } from "react";
import type { Evidence } from "../types/vulnerability";

export const useEvidences = (vulnerabilityId: string | null) => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getApiUrl = () => {
    return (
      import.meta.env.VITE_API_GATEWAY_URL ||
      import.meta.env.API_GATEWAY_URL ||
      ""
    );
  };

  useEffect(() => {
    if (!vulnerabilityId) {
      setEvidences([]);
      return;
    }

    const fetchEvidences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${getApiUrl()}/vulnerabilities/${vulnerabilityId}/evidences`,
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data: Evidence[] = await response.json();
        setEvidences(data);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des évidences :", err);
        setError("Impossible de charger les détails techniques.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvidences();
  }, [vulnerabilityId]);

  return { evidences, isLoading, error };
};
