import { useState, useEffect } from "react";
import { api } from "../api/Axios";
import type { Vulnerability } from "../types/vulnerability";

export const useVulnerabilities = (scanId: string | undefined) => {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId) {
      setVulnerabilities([]);
      return;
    }

    const fetchVulnerabilities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get<Vulnerability[]>(
          `/scans/${scanId}/vulnerabilities`,
        );

        setVulnerabilities(response.data);
      } catch (err: any) {
        console.error(
          "Erreur lors de la récupération des vulnérabilités :",
          err,
        );
        setError("Impossible de charger les vulnérabilités depuis le serveur.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVulnerabilities();
  }, [scanId]);

  return { vulnerabilities, isLoading, error };
};
