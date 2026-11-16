import type { ComponentType } from "react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Network,
  Radar,
  ScrollText,
  Server,
  Settings,
  Users,
} from "lucide-react";
import type { UserRole } from "../types/auth";

export type NavItem = {
  icon: ComponentType<{ className?: string }>;
  /** Same name in the sidebar, the mobile bar, the command palette and the page title. */
  label: string;
  path: string;
  roles: UserRole[];
};

const ALL_ROLES: UserRole[] = [
  "superadmin",
  "admin",
  "billing_aegis",
  "technicien",
  "support",
  "owner",
  "operateur",
  "viewer",
];
const OPERATORS: UserRole[] = [
  "superadmin",
  "admin",
  "technicien",
  "support",
  "owner",
  "operateur",
];

/** Single source of truth for the app navigation. */
export const NAV_ITEMS: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Tableau de bord",
    path: "/",
    roles: ALL_ROLES,
  },
  { icon: Radar, label: "Scans", path: "/vulnerabilities", roles: OPERATORS },
  { icon: Network, label: "Topologie", path: "/topology", roles: OPERATORS },
  {
    icon: Users,
    label: "Équipes",
    path: "/users",
    roles: ["superadmin", "admin", "owner"],
  },
  {
    icon: Server,
    label: "Agents",
    path: "/agents",
    roles: ["superadmin", "admin", "owner"],
  },
  {
    icon: Building2,
    label: "Entreprise",
    path: "/company-settings",
    roles: ["owner"],
  },
  {
    icon: CreditCard,
    label: "Facturation",
    path: "/billing",
    roles: ["superadmin", "admin", "billing_aegis", "owner"],
  },
  {
    icon: ScrollText,
    label: "Journal d'audit",
    path: "/audit",
    roles: ["superadmin", "owner"],
  },
  { icon: Settings, label: "Paramètres", path: "/settings", roles: ALL_ROLES },
];

/** Navigation entries the given role may open (all of them while the user is loading). */
export const navItemsFor = (role?: UserRole | null) =>
  role ? NAV_ITEMS.filter((item) => item.roles.includes(role)) : NAV_ITEMS;
