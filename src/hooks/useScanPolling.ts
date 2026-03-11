import { useState, useEffect } from "react";
import { config } from "../config";
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
          const res = await fetch(
            `${config.apiGatewayUrl}/scans/${activeScanId}`,
          );
          if (res.ok) {
            const data: ScanStatusResponse = await res.json();
            if (data.status) {
              setScanStatus(data.status);
            }
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
