import { useEffect, useState } from "react";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";

export interface ScanStatusUpdate {
  scan_id: string;
  status: string;
}

export const useScanStream = (scanId?: string) => {
  const [lastUpdate, setLastUpdate] = useState<ScanStatusUpdate | null>(null);
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    // Pass token as query param since native EventSource doesn't support headers
    const sseUrl = new URL(
      scanId
        ? `${api.defaults.baseURL}/scans/${scanId}/stream`
        : `${api.defaults.baseURL}/scans/stream`,
    );

    if (token) {
      sseUrl.searchParams.append("token", token);
    }

    // Guard against environments (e.g., jsdom in tests) where EventSource is not available.
    if (typeof EventSource === "undefined") {
      console.warn(
        "EventSource is not available in this environment; scan status stream disabled.",
      );
      return;
    }

    console.log(`🔌 Connecting to status stream: ${sseUrl.toString()}`);
    const eventSource = new EventSource(sseUrl.toString());

    eventSource.onmessage = (event) => {
      try {
        const data: ScanStatusUpdate = JSON.parse(event.data);
        setLastUpdate(data);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error (letting browser auto-reconnect):", err);
    };

    return () => {
      console.log("🔌 Closing status stream");
      eventSource.close();
    };
  }, [scanId, token]);

  return lastUpdate;
};
