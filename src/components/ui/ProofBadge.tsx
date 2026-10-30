import React from "react";
import { BadgeCheck, Eye, HelpCircle } from "lucide-react";
import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";
import type {
  ProofLevel,
  VulnerabilitySource,
} from "../../types/vulnerability";

interface ProofBadgeProps {
  proofLevel?: ProofLevel | "";
  source?: VulnerabilitySource | "";
  className?: string;
}

// Proof contract v1.0.0 levels (Aegis-AI-Proto/docs/fr/proof-contract.md §4).
const PROOF_CONFIG = {
  exploited: {
    label: "Exploitée",
    hint: "Le flag de seeding a été extrait de la cible.",
    Icon: BadgeCheck,
    styles: css({
      color: "emerald.400",
      bg: "emerald.500/10",
      borderColor: "emerald.500/20",
    }),
  },
  detected: {
    label: "Détectée",
    hint: "Un outil a observé la vulnérabilité, sans extraction prouvée.",
    Icon: Eye,
    styles: css({
      color: "blue.400",
      bg: "blue.500/10",
      borderColor: "blue.500/20",
    }),
  },
  unverified: {
    label: "Non vérifiée",
    hint: "Hypothèse de l'agent IA, sans trace d'outil vérifiable.",
    Icon: HelpCircle,
    styles: css({
      color: "gray.400",
      bg: "gray.500/10",
      borderColor: "gray.500/20",
    }),
  },
} as const;

const SOURCE_LABELS: Record<VulnerabilitySource, string> = {
  "worker-pentest": "Worker Pentest",
  "agent-crew": "Agent IA",
};

export const ProofBadge: React.FC<ProofBadgeProps> = ({
  proofLevel,
  source,
  className = "",
}) => {
  // Findings saved before the proof contract carry no proof level.
  if (!proofLevel || !(proofLevel in PROOF_CONFIG)) {
    return null;
  }

  const { label, hint, Icon, styles } = PROOF_CONFIG[proofLevel];
  const title = source ? `${hint} Source : ${SOURCE_LABELS[source]}.` : hint;

  return (
    <span
      title={title}
      className={cx(
        flex({
          display: "inline-flex",
          align: "center",
          gap: "1",
          px: "2",
          py: "0.5",
          borderRadius: "full",
          fontSize: "10px",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          border: "1px solid",
          whiteSpace: "nowrap",
        }),
        styles,
        className,
      )}
    >
      <Icon className={css({ w: "3", h: "3" })} />
      {label}
    </span>
  );
};
