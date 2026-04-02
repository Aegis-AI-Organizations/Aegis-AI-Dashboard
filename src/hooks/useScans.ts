import { useState, useEffect, useCallback } from "react";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";
import type { ScanStatusResponse } from "../types/scan";

export const useScans = () => {
  const [scans, setScans] = useState<ScanStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.accessToken);

  const fetchScans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<ScanStatusResponse[]>("/scans");
      const data = response.data;

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

    // Pass token as query param since native EventSource doesn't support headers
    const sseUrl = new URL(`${api.defaults.baseURL}/scans/stream`);
    if (token) {
      sseUrl.searchParams.append("token", token);
    }

    console.log(
      `🔌 Listening to global scan status stream: ${sseUrl.toString()}`,
    );
    const eventSource = new EventSource(sseUrl.toString());

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        const { scan_id, status } = update;

        setScans((prevScans) => {
          const index = prevScans.findIndex((s) => s.id === scan_id);
          if (index === -1) {
            fetchScans();
            return prevScans;
          }

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
  }, [fetchScans, token]);

  return { scans, isLoading, error, refetch: fetchScans };
};
