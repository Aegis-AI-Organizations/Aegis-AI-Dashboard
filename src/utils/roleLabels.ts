import type { UserRole } from "../types/auth";

export interface RoleConfig {
  label: string;
  description: string;
  colorClass: string;
  pole: "internal" | "client";
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  superadmin: {
    label: "Super Administrateur",
    description:
      "Accès absolu. Gestion totale de l'infrastructure et des comptes.",
    colorClass:
      "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    pole: "internal",
  },
  admin: {
    label: "Administrateur Aegis",
    description: "Gestion quotidienne des clients et assistance compte.",
    colorClass:
      "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    pole: "internal",
  },
  billing_aegis: {
    label: "Gestionnaire Facturation (Aegis)",
    description: "Gestion des finances, factures et licences clients.",
    colorClass:
      "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    pole: "internal",
  },
  technicien: {
    label: "Technicien Support N3",
    description: "Support technique approfondi et débogage via les logs.",
    colorClass:
      "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    pole: "internal",
  },
  support: {
    label: "Support Client N1/N2",
    description: "Assistance utilisateur et suivi de l'état des scans.",
    colorClass:
      "from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30",
    pole: "internal",
  },
  commercial: {
    label: "Commercial / Business Dev",
    description: "Accès aux leads et création d'entreprises prospects.",
    colorClass:
      "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30",
    pole: "internal",
  },
  owner: {
    label: "Propriétaire (Tenant)",
    description: "Contrôle total sur l'entité client et gestion d'équipe.",
    colorClass:
      "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    pole: "client",
  },
  billing_client: {
    label: "Gestion Facturation (Client)",
    description: "Accès restreint aux factures et paiements de l'entreprise.",
    colorClass:
      "from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30",
    pole: "client",
  },
  operateur: {
    label: "Opérateur Pentest",
    description: "Configuration, lancement des tests et accès aux rapports.",
    colorClass:
      "from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30",
    pole: "client",
  },
  viewer: {
    label: "Lecteur (Consultation)",
    description: "Lecture seule sur l'historique des scans et rapports.",
    colorClass:
      "from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30",
    pole: "client",
  },
};

export const getRoleLabel = (role: UserRole | string): string => {
  return ROLE_CONFIGS[role as UserRole]?.label || role;
};

export const getRoleConfig = (
  role: UserRole | string,
): RoleConfig | undefined => {
  return ROLE_CONFIGS[role as UserRole];
};
