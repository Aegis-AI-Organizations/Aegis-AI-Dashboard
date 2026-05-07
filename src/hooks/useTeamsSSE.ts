import { useEffect } from "react";
import { api } from "../api/Axios";
import { useAuthStore } from "../store/AuthStore";

export const useTeamsSSE = (onUpdate: () => void) => {
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (typeof EventSource === "undefined") {
      return;
    }

    const baseUrl = api.defaults.baseURL || "";
    const fullBase = baseUrl.startsWith("http")
      ? baseUrl
      : window.location.origin + baseUrl;

    const sseUrl = new URL(`${fullBase}/admin/teams/stream`);
    if (token) {
      sseUrl.searchParams.append("token", token);
    }

    console.log(`🔌 Listening to team updates stream: ${sseUrl.toString()}`);
    const eventSource = new EventSource(sseUrl.toString());

    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        console.log("Team update received:", update);

        if (update.event_type !== "HEARTBEAT") {
          onUpdate();
        }
      } catch (err) {
        console.error("Failed to parse SSE data in useTeamsSSE:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error in useTeamsSSE (reconnecting):", err);
    };

    return () => {
      console.log("🔌 Closing team updates stream");
      eventSource.close();
    };
  }, [onUpdate, token]);
};
