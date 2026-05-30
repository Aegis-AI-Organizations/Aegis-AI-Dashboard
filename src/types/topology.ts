export type TopologyNodeKind = "host" | "container";

export interface TopologyPort {
  protocol?: string;
  container_port?: number;
  containerPort?: number;
  host_port?: number;
  hostPort?: number;
  port?: number;
}

export interface TopologyProcess {
  pid?: number;
  name?: string;
  command_line?: string;
  commandLine?: string;
  user?: string;
}

export interface TopologyContainer {
  id: string;
  name?: string;
  image?: string;
  processes?: TopologyProcess[];
  ports?: TopologyPort[];
  host_id?: string;
  hostId?: string;
}

export interface TopologyHost {
  id: string;
  hostname?: string;
  ip_addresses?: string[];
  ipAddresses?: string[];
  containers?: TopologyContainer[];
  processes?: TopologyProcess[];
}

export interface TopologyApiNode {
  id: string;
  type?: TopologyNodeKind | string;
  kind?: TopologyNodeKind | string;
  label?: string;
  name?: string;
  hostname?: string;
  image?: string;
  ip_addresses?: string[];
  ipAddresses?: string[];
  ports?: TopologyPort[];
  processes?: TopologyProcess[];
  host_id?: string;
  hostId?: string;
}

export interface TopologyApiEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
  port?: number;
}

export interface TopologyResponse {
  hosts?: TopologyHost[];
  nodes?: TopologyApiNode[];
  edges?: TopologyApiEdge[];
}

export interface TopologyGraphNode {
  id: string;
  kind: TopologyNodeKind;
  label: string;
  subtitle?: string;
  hostId?: string;
  ports: TopologyPort[];
  processes: TopologyProcess[];
  ipAddresses: string[];
  vulnerable: boolean;
  highlighted: boolean;
  vulnerabilityCount: number;
}

export interface TopologyGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
