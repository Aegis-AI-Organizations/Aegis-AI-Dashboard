import React from "react";
import { Users as UsersIcon, ShieldCheck, Mail, Search } from "lucide-react";

export const Users: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Équipe
        </h1>
        <p className="text-gray-400">
          Gérez les accès à la plateforme, les rôles et les permissions des
          utilisateurs.
        </p>
      </div>

      <div className="bg-[#0B0D13]/60 border border-gray-800/60 rounded-2xl p-12 text-center backdrop-blur-sm shadow-xl flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
          <UsersIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Gestion de l'Équipe
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Cette fonctionnalité est actuellement en cours de développement.
          Bientôt, vous pourrez inviter des collaborateurs et définir des
          permissions granulaires.
        </p>
      </div>
    </div>
  );
};
