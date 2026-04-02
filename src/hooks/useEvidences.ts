import { useState, useEffect } from "react";
import { api } from "../api/Axios";
import type { Evidence } from "../types/vulnerability";

export const useEvidences = (vulnerabilityId: string | null) => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vulnerabilityId) {
      setEvidences([]);
      return;
    }

    const fetchEvidences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<Evidence[]>(
          `/vulnerabilities/${vulnerabilityId}/evidences`,
        );

        setEvidences(response.data);
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
