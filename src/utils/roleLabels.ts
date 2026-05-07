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
      "Accès absolu. Gestion des comptes internes, accès total à l'infrastructure, aux logs et aux droits.",
    colorClass:
      "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
    pole: "internal",
  },
  admin: {
    label: "Administrateur Aegis",
    description:
      "Gestion quotidienne des clients (création d'entreprises, assistance compte). Pas d'accès aux secrets d'infra.",
    colorClass:
      "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    pole: "internal",
  },
  billing_aegis: {
    label: "Billing Aegis (Back-Office)",
    description:
      "Gestion des finances. Accès aux factures clients, modification des licences et relances.",
    colorClass:
      "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    pole: "internal",
  },
  technicien: {
    label: "Technicien (Back-Office)",
    description:
      "Support technique N3. Accès aux logs de scan pour le débogage.",
    colorClass:
      "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    pole: "internal",
  },
  support: {
    label: "Support (Back-Office)",
    description: "Assistance N1/N2. Voit les métadonnées des scans.",
    colorClass:
      "from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30",
    pole: "internal",
  },
  owner: {
    label: "Propriétaire (Panel)",
    description: "Contrôle total sur l'entité client. Gère l'équipe.",
    colorClass:
      "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    pole: "client",
  },
  billing_client: {
    label: "Facturation (Panel)",
    description: "Accès restreint à la facturation. Gère les paiements.",
    colorClass:
      "from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30",
    pole: "client",
  },
  operateur: {
    label: "Opérateur (Panel)",
    description: "Technicien DevSecOps. Configure et lance les pentests.",
    colorClass:
      "from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30",
    pole: "client",
  },
  viewer: {
    label: "Viewer (Panel)",
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
