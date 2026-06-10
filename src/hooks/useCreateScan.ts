import { useState } from "react";
import { api } from "../api/Axios";
import type { CreateScanRequest, CreateScanResponse } from "../types/scan";

interface CreateTopologyScanOptions {
  targetNodeIds?: string[];
  targetLabel?: string;
}

export const useCreateScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createScan = async ({
    targetNodeIds = [],
    targetLabel,
  }: CreateTopologyScanOptions = {}): Promise<CreateScanResponse | null> => {
    setIsLoading(true);
    setError(null);

    const uniqueTargetIds = [...new Set(targetNodeIds.map((id) => id.trim()))]
      .filter(Boolean)
      .sort();
    const payload: CreateScanRequest = {
      scope: "topology",
      target_image: uniqueTargetIds.length
        ? `topology:${uniqueTargetIds.join(",")}`
        : "topology:all",
      target_node_ids: uniqueTargetIds,
      target_label:
        targetLabel ||
        (uniqueTargetIds.length
          ? `${uniqueTargetIds.length} cible(s) sélectionnée(s)`
          : "Topologie complète"),
    };

    try {
      const response = await api.post<CreateScanResponse>("/scans", payload);
      return response.data;
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: { message?: string } } })
        .response?.data;
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
