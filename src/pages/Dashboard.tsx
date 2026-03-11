import React from "react";
import { LaunchpadForm } from "../components/LaunchpadForm";
import { useScans } from "../hooks/useScans";
import { ShieldAlert, ChevronRight, Clock, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Dashboard: React.FC = () => {
  const { scans, isLoading, error, refetch } = useScans();
  const navigate = useNavigate();

  // Take the top 3 most recent scans
  const recentScans = scans.slice(0, 3);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "FAILED":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "PENDING":
      case "RUNNING":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date inconnue";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const handleScanClick = (scanId: string) => {
    // Navigate to vulnerabilities, passing the specific scan ID to open
    navigate("/vulnerabilities", { state: { openScanId: scanId } });
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Tableau de Bord Sécurité
        </h1>
        <p className="text-gray-400">
          Aperçu complet de votre posture de sécurité et des opérations de
          pentest.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Launchpad Form on the left/top */}
        <div className="flex-1 w-full max-w-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest text-gray-300">
              Nouvelle Analyse
            </h2>
          </div>

          <div className="bg-[#111318] border border-gray-800/60 rounded-xl p-6 shadow-xl w-full">
            <p className="text-sm text-gray-400 mb-6 font-sans">
              Entrez l'image Docker cible pour démarrer l'analyse de
              vulnérabilités.
            </p>
            <LaunchpadForm onScanUpdate={refetch} />
          </div>
        </div>

        {/* Recent Scans Widget on the right/bottom */}
        <div className="flex-1 w-full xl:max-w-2xl max-w-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-widest text-gray-300">
              Derniers Pentests
            </h2>
            <button
              onClick={() => navigate("/vulnerabilities")}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center cursor-pointer hover:underline"
            >
              Voir tout l'historique
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-[#111318] border border-gray-800/60 rounded-xl overflow-hidden shadow-xl">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mb-3"></div>
                <p className="text-sm text-gray-500">Chargement...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-sm text-red-400/80">
                Impossible de charger les derniers scans.
              </div>
            ) : recentScans.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <ShieldAlert className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-sm text-gray-400">
                  Aucun scan récent trouvé.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Lancez une analyse depuis le formulaire.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {recentScans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => handleScanClick(scan.id)}
                    className="w-full text-left p-4 hover:bg-[#1A1D24] transition-colors group flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 bg-gray-800/50 p-2 rounded-lg border border-gray-700/50 mt-0.5">
                      <Box className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${getStatusStyle(
                            scan.status,
                          )}`}
                        >
                          {scan.status === "RUNNING"
                            ? "EN COURS"
                            : scan.status === "COMPLETED"
                              ? "TERMINÉ"
                              : scan.status === "FAILED"
                                ? "ÉCHEC"
                                : scan.status}
                        </span>
                        <div className="flex items-center text-[10px] text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(scan.started_at)}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white truncate group-hover:text-cyan-100 transition-colors mb-0.5">
                        {scan.target_image}
                      </p>
                      <p className="font-mono text-[10px] text-gray-500 truncate">
                        ID: {scan.id.split("-")[0]}...
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 self-center transition-colors transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
