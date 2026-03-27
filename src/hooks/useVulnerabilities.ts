import { useState, useEffect } from "react";
import { config } from "../config";
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
        const response = await fetch(
          `${config.apiGatewayUrl}/scans/${scanId}/vulnerabilities`,
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data: Vulnerability[] = await response.json();
        setVulnerabilities(data);
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
