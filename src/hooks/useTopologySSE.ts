import { useEffect, useState } from "react";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";

export interface TopologyVulnerabilityEvent {
  scanId?: string;
  status?: string;
  nodeId?: string;
  containerId?: string;
  targetId?: string;
  targetEndpoint?: string;
  severity?: string;
  vulnerabilityId?: string;
  isVulnerabilityEvent: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: Record<string, any>;
}

const vulnerabilityEventTypes = new Set([
  "VULNERABILITY_FOUND",
  "vulnerability_found",
  "vulnerability.created",
  "vulnerability_detected",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findEventTarget = (payload: Record<string, any>) => {
  const vulnerability =
    payload.vulnerability || payload.finding || payload.data || {};

  return {
    nodeId:
      payload.node_id ||
      payload.nodeId ||
      vulnerability.node_id ||
      vulnerability.nodeId,
    containerId:
      payload.container_id ||
      payload.containerId ||
      vulnerability.container_id ||
      vulnerability.containerId,
    targetId:
      payload.target_id ||
      payload.targetId ||
      vulnerability.target_id ||
      vulnerability.targetId,
    targetEndpoint:
      payload.target_endpoint ||
      payload.targetEndpoint ||
      vulnerability.target_endpoint ||
      vulnerability.targetEndpoint,
    severity: payload.severity || vulnerability.severity,
    vulnerabilityId:
      payload.vulnerability_id || payload.vulnerabilityId || vulnerability.id,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isVulnerabilityEvent = (payload: Record<string, any>) => {
  const eventType =
    payload.event_type || payload.eventType || payload.type || payload.status;
  if (eventType && vulnerabilityEventTypes.has(String(eventType))) {
    return true;
  }

  return Boolean(
    payload.vulnerability ||
      payload.vulnerability_id ||
      payload.vulnerabilityId,
  );
};

export const useTopologySSE = () => {
  const [lastEvent, setLastEvent] = useState<TopologyVulnerabilityEvent | null>(
    null,
  );
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (typeof EventSource === "undefined") {
      return;
    }

    const baseUrl = api.defaults.baseURL || "";
    const fullBase = baseUrl.startsWith("http")
      ? baseUrl
      : window.location.origin + baseUrl;
    const sseUrl = new URL(`${fullBase}/scans/stream`);

    if (token) {
      sseUrl.searchParams.append("token", token);
    }

    const eventSource = new EventSource(sseUrl.toString());

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLastEvent({
          scanId: payload.scan_id || payload.scanId,
          status: payload.status,
          ...findEventTarget(payload),
          isVulnerabilityEvent: isVulnerabilityEvent(payload),
          raw: payload,
        });
      } catch (err) {
        console.error("Failed to parse topology SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error in topology stream (reconnecting):", err);
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  return lastEvent;
};
