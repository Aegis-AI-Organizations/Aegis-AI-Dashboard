import { useEffect, useState } from "react";
import { config } from "../config";

export interface ScanStatusUpdate {
  scan_id: string;
  status: string;
}

export const useScanStream = (scanId?: string) => {
  const [lastUpdate, setLastUpdate] = useState<ScanStatusUpdate | null>(null);

  useEffect(() => {
    const url = scanId
      ? `${config.apiGatewayUrl}/scans/${scanId}/stream`
      : `${config.apiGatewayUrl}/scans/stream`;

    console.log(`🔌 Connecting to status stream: ${url}`);
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data: ScanStatusUpdate = JSON.parse(event.data);
        setLastUpdate(data);
      } catch (err) {
        console.error("Failed to parse SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error (likely connection closed):", err);
      eventSource.close();
    };

    return () => {
      console.log("🔌 Closing status stream");
      eventSource.close();
    };
  }, [scanId]);

  return lastUpdate;
};
