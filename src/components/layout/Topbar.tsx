import { Search, Bell, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/AuthStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { getInitials } from "../../utils/user";

export const Topbar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#0B0D13] border-b border-gray-800/60">
      <div className="flex items-center">
        <h1 className="text-white font-medium text-base hidden sm:flex items-center gap-3">
          Dashboard
          <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold tracking-wide">
            AEGIS
          </span>
        </h1>
        {/* Mobile Logo display when sidebar is hidden */}
        <div className="sm:hidden flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-950/50 flex flex-col items-center justify-center border border-blue-500/20">
            <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
          </div>
          <span className="text-white font-semibold">Aegis AI</span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-48 lg:w-64 bg-[#13151A] border border-gray-800 text-sm rounded-lg pl-10 pr-10 py-1.5 text-gray-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-600"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <span className="text-xs text-gray-600 font-medium bg-[#1A1D24] px-1.5 py-0.5 rounded border border-gray-800">
              K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-[#0B0D13] rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold shadow-inner">
              {getInitials(user?.name, user?.email)}
            </div>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ? Votre session sera terminée."
        confirmText="Se déconnecter"
        cancelText="Annuler"
      />
    </header>
  );
};
