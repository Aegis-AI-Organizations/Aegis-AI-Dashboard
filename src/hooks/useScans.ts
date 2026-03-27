import { useState, useEffect, useCallback } from "react";
import { config } from "../config";
import type { ScanStatusResponse } from "../types/scan";

export const useScans = () => {
  const [scans, setScans] = useState<ScanStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiGatewayUrl}/scans`);
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

  // Global SSE listener to update the scans list in real-time
  useEffect(() => {
    if (typeof EventSource === "undefined") {
      return;
    }

    const url = `${config.apiGatewayUrl}/scans/stream`;
    console.log(`🔌 Listening to global scan status stream: ${url}`);
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        const { scan_id, status } = update;

        setScans((prevScans) => {
          const index = prevScans.findIndex((s) => s.id === scan_id);
          if (index === -1) {
            // New scan started? Maybe refetch to be sure of all fields or just wait for natural refetch
            // For now, let's trigger a refetch if it's a new scan ID we don't know
            fetchScans();
            return prevScans;
          }

          // If status is the same, ignore
          if (prevScans[index].status === status) {
            return prevScans;
          }

          const updatedScans = [...prevScans];
          updatedScans[index] = { ...updatedScans[index], status };
          return updatedScans;
        });
      } catch (err) {
        console.error("Failed to parse SSE data in useScans hook:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error in useScans hook (reconnecting):", err);
    };

    return () => {
      console.log("🔌 Closing global scan status stream");
      eventSource.close();
    };
  }, [fetchScans]);

  return { scans, isLoading, error, refetch: fetchScans };
};
