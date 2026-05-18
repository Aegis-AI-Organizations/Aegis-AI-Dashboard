export interface AgentStatusSummary {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  last_seen?: string | null;
}
