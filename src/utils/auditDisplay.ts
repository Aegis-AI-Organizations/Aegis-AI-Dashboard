/** Timestamp as sent by the API: an ISO string, or a protobuf Timestamp serialized as JSON. */
export type AuditTimestamp =
  | string
  | { seconds?: number | string; nanos?: number }
  | null
  | undefined;

/** Converts an audit timestamp to a Date, or null when it cannot be read. */
export const toAuditDate = (timestamp: AuditTimestamp): Date | null => {
  if (timestamp === null || timestamp === undefined) return null;
  if (typeof timestamp === "string") {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const seconds = Number(timestamp.seconds);
  if (!Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000 + Math.floor((timestamp.nanos ?? 0) / 1e6));
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export const formatAuditDate = (timestamp: AuditTimestamp) => {
  const date = toAuditDate(timestamp);
  return date
    ? { date: dateFormatter.format(date), time: timeFormatter.format(date) }
    : { date: "Date inconnue", time: "" };
};

const ACTION_LABELS: Record<string, string> = {
  CREATE_COMPANY: "Entreprise créée",
  ONBOARD_COMPANY: "Entreprise ajoutée",
  UPDATE_CURRENT_COMPANY: "Entreprise modifiée",
  CREATE_USER: "Membre ajouté",
  UPDATE_USER_ROLE: "Rôle modifié",
  DEACTIVATE_USER: "Membre désactivé",
  REACTIVATE_USER: "Membre réactivé",
  DELETE_USER: "Membre supprimé",
  START_SCAN: "Scan lancé",
  STOP_SCAN: "Scan arrêté",
};

/** Human-readable French label for an audit action code. */
export const auditActionLabel = (action: string) => {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  const words = action.toLowerCase().replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Strips the gRPC peer prefix and port: "ipv4:192.168.1.10:54558" -> "192.168.1.10". */
export const formatAuditIp = (address: string) => {
  if (!address) return "—";
  const withoutPrefix = address.replace(/^ipv[46]:/i, "");
  const bracketed = withoutPrefix.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketed) return bracketed[1];
  const v4 = withoutPrefix.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/);
  return v4 ? v4[1] : withoutPrefix;
};
