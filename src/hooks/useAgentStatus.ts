import { useCallback, useEffect, useState } from "react";
import { api } from "../api/Axios";
import type { AgentStatusSummary } from "../types/agent";

const EMPTY_AGENT_STATUS: AgentStatusSummary = {
  total_agents: 0,
  active_agents: 0,
  inactive_agents: 0,
  last_seen: null,
};

export const useAgentStatus = () => {
  const [summary, setSummary] =
    useState<AgentStatusSummary>(EMPTY_AGENT_STATUS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgentStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get<AgentStatusSummary>("/agents/status");
      setSummary({
        total_agents: data.total_agents ?? 0,
        active_agents: data.active_agents ?? 0,
        inactive_agents: data.inactive_agents ?? 0,
        last_seen: data.last_seen ?? null,
      });
    } catch (err) {
      console.error("Erreur lors de la récupération du statut agents :", err);
      setError("Impossible de charger l'état des agents.");
      setSummary(EMPTY_AGENT_STATUS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgentStatus();
  }, [fetchAgentStatus]);

  return { summary, isLoading, error, refetch: fetchAgentStatus };
};
