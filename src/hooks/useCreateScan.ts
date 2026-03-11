import { useState } from "react";
import { config } from "../config";
import type { CreateScanRequest, CreateScanResponse } from "../types/scan";

export const useCreateScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createScan = async (
    targetImage: string,
  ): Promise<CreateScanResponse | null> => {
    if (!targetImage.trim()) {
      setError("L'image Docker est requise.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    const payload: CreateScanRequest = {
      target_image: targetImage.trim(),
    };

    try {
      const response = await fetch(`${config.apiGatewayUrl}/scans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 201 || response.status === 200) {
        const data: CreateScanResponse = await response.json();
        return data;
      } else {
        const errorData = await response.json().catch(() => null);
        setError(
          errorData?.message ||
            `Erreur: ${response.status} ${response.statusText}`,
        );
        return null;
      }
    } catch (err) {
      setError("Erreur réseau. Impossible de contacter le serveur.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createScan, isLoading, error };
};
