import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  History,
  Users,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { ProfileCircle } from "../ui/ProfileCircle";
import { RoleBadge } from "../ui/RoleBadge";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Tableau de Bord",
    path: "/",
    roles: [
      "superadmin",
      "admin",
      "billing_aegis",
      "technicien",
      "support",
      "commercial",
      "owner",
      "billing_client",
      "operateur",
      "viewer",
    ],
  },
  {
    icon: History,
    label: "Historique des Scans",
    path: "/vulnerabilities",
    roles: [
      "superadmin",
      "admin",
      "technicien",
      "support",
      "owner",
      "operateur",
      "viewer",
    ],
  },
  {
    icon: Users,
    label: "Équipe",
    path: "/users",
    roles: ["superadmin", "admin", "owner"],
  },
  {
    icon: Shield,
    label: "Facturation",
    path: "/billing",
    roles: ["superadmin", "admin", "billing_aegis", "owner", "billing_client"],
  },
  {
    icon: Shield,
    label: "Administration",
    path: "/administration",
    roles: ["superadmin", "admin", "commercial"],
  },
  {
    icon: Settings,
    label: "Paramètres",
    path: "/settings",
    roles: [
      "superadmin",
      "admin",
      "billing_aegis",
      "technicien",
      "support",
      "commercial",
      "owner",
      "billing_client",
      "operateur",
      "viewer",
    ],
  },
];

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-[#050810]/95 backdrop-blur-md border-r border-gray-800/60 sticky top-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? "w-64" : "w-20"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-800/60 flex-shrink-0 cursor-pointer overflow-hidden">
        <img
          src="/logo.svg"
          alt="Aegis AI Logo"
          className="w-8 h-8 object-contain shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/logo.png";
          }}
        />
        <span
          className={`text-white font-bold text-lg tracking-wider whitespace-nowrap transition-all duration-300 ${
            isExpanded ? "opacity-100 flex-1" : "opacity-0 w-0"
          }`}
        >
          Aegis AI
        </span>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1.5 px-3">
        {navItems
          .filter((item) => !user || item.roles.includes(user.role))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-0 rounded-lg p-3 text-sm font-medium transition-all duration-200 overflow-hidden ${
                  isActive
                    ? "bg-cyan-950/30 text-cyan-400 shadow-[inset_2px_0_0_0_rgba(34,211,238,1)]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                }`
              }
              title={!isExpanded ? item.label : undefined}
            >
              <div className="w-8 flex justify-center items-center shrink-0">
                <item.icon className="w-5 h-5 transition-transform duration-200" />
              </div>
              <span
                className={`whitespace-nowrap transition-all duration-300 ease-in-out pl-2 ${
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
      </nav>

      {/* User Profile Mini preview */}
      <div
        className={`p-4 border-t border-gray-800/60 flex items-center gap-3 transition-opacity overflow-hidden ${
          isExpanded ? "opacity-100" : "opacity-0 h-0 hidden"
        }`}
      >
        <ProfileCircle size="sm" />
        <div className="flex flex-col whitespace-nowrap">
          <span className="text-sm font-bold text-white tracking-tight">
            {user?.name || user?.email?.split("@")[0] || "Administrateur"}
          </span>
          <RoleBadge role={user?.role || "viewer"} showIcon={false} />
        </div>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="ml-auto p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {!isExpanded && (
        <div className="mt-auto p-4 flex justify-center border-t border-gray-800/60">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ? Votre session sera terminée."
        confirmText="Se déconnecter"
        cancelText="Annuler"
      />
    </aside>
  );
};
