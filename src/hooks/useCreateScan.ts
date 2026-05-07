import { useState } from "react";
import { api } from "../api/Axios";
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
      const response = await api.post<CreateScanResponse>("/scans", payload);
      return response.data;
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(
        errorData?.message ||
          "Erreur réseau. Impossible de contacter le serveur.",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createScan, isLoading, error };
};
