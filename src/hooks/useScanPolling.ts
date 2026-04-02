import { useState, useEffect } from "react";
import { api } from "../api/Axios";
import type { ScanStatusResponse } from "../types/scan";

export const useScanPolling = (
  activeScanId: string | null,
  initialStatus: string = "PENDING",
) => {
  const [scanStatus, setScanStatus] = useState<string>(initialStatus);

  useEffect(() => {
    if (activeScanId) {
      setScanStatus(initialStatus); // Reset status when a new scan starts
    }
  }, [activeScanId, initialStatus]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (
      activeScanId &&
      !["COMPLETED", "FAILED", "CANCELED"].includes(scanStatus)
    ) {
      interval = setInterval(async () => {
        try {
          const res = await api.get<ScanStatusResponse>(
            `/scans/${activeScanId}`,
          );
          const data = res.data;
          if (data.status) {
            setScanStatus(data.status);
          }
        } catch (err) {
          console.error("Erreur lors de la récupération du statut:", err);
        }
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeScanId, scanStatus]);

  return { scanStatus, setScanStatus };
};
