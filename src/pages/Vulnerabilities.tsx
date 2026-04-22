import React, { useState, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PentestAccordion } from "../components/PentestAccordion";
import { VulnerabilityDetailsDrawer } from "../components/VulnerabilityDetailsDrawer";
import { useScans } from "../hooks/useScans";
import type { Vulnerability } from "../types/vulnerability";

export const Vulnerabilities: React.FC = () => {
  const { scans, isLoading, error } = useScans();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const location = useLocation();
  const openScanId = location.state?.openScanId as string | undefined;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  React.useEffect(() => {
    if (openScanId && scans.length > 0) {
      const scanIndex = scans.findIndex((s) => s.id === openScanId);
      if (scanIndex !== -1) {
        setCurrentPage(Math.floor(scanIndex / itemsPerPage) + 1);
      }
    }
  }, [openScanId, scans.length]);

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const query = searchQuery.toLowerCase();
      return (
        s.target_image?.toLowerCase().includes(query) ||
        s.id?.toLowerCase().includes(query) ||
        (s.company_name && s.company_name.toLowerCase().includes(query))
      );
    });
  }, [scans, searchQuery]);

  const totalPages = Math.ceil(filteredScans.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentScans = filteredScans.slice(indexOfFirstItem, indexOfLastItem);

  // Sync search with URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        setSearchParams({ search: searchQuery }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const isDrawerOpen = selectedVuln !== null;

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6 flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            Historique des Scans
          </h1>
          <p className="text-gray-400 text-sm">
            Naviguez à travers l'historique complet de vos analyses et examinez
            les détails.
          </p>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:flex items-center gap-3 w-full md:w-96">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher une cible, un ID..."
              className="w-full bg-[#13151A] border border-gray-800 text-sm rounded-xl pl-10 pr-4 py-2.5 text-gray-200 focus:outline-none focus:border-cyan-500 transition-all placeholder-gray-600 focus:ring-4 focus:ring-cyan-500/5"
            />
          </div>
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher..."
              className="w-full bg-[#13151A] border border-gray-800 text-sm rounded-lg pl-9 pr-4 py-2 text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors placeholder-gray-600"
            />
          </div>
          <button className="p-2 bg-[#13151A] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 relative items-stretch">
        <div
          className={`transition-all duration-300 ease-in-out h-full overflow-y-auto pr-1 md:pr-2 custom-scrollbar flex flex-col ${
            isDrawerOpen ? "md:w-[60%] xl:w-[65%]" : "w-full"
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 h-full min-h-[400px] bg-[#111318] border border-gray-800/60 rounded-xl w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <p className="mt-4 text-gray-400 text-sm">
                Chargement de l'historique des pentests...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 h-full min-h-[400px] flex flex-col items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-center w-full">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : scans.length === 0 ? (
            <div className="flex flex-col h-full min-h-[400px] items-center justify-center p-12 bg-[#111318] border border-gray-800/60 rounded-xl text-center w-full">
              <ShieldAlert className="w-16 h-16 text-gray-500 mb-4" />
              <h3 className="text-white font-medium text-xl">
                Aucun pentest trouvé
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                Lancez un nouveau scan depuis le tableau de bord pour voir les
                résultats ici.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col pb-4">
                {currentScans.map((scan, index) => (
                  <PentestAccordion
                    key={scan.id}
                    scan={scan}
                    onSelectVulnerability={setSelectedVuln}
                    defaultOpen={
                      openScanId
                        ? scan.id === openScanId
                        : index === 0 && currentPage === 1
                    }
                    selectedVulnerabilityId={selectedVuln?.id || null}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-800 pt-4 pb-8 mt-auto flex-shrink-0">
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Affichage{" "}
                    <span className="font-medium text-gray-300">
                      {indexOfFirstItem + 1}
                    </span>{" "}
                    à{" "}
                    <span className="font-medium text-gray-300">
                      {Math.min(indexOfLastItem, scans.length)}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium text-gray-300">
                      {scans.length}
                    </span>{" "}
                    résultats
                  </p>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 flex items-center bg-[#13151A] border border-gray-800 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#1A1D24] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Précédent
                    </button>
                    <span className="text-sm text-gray-400 sm:hidden">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 flex items-center bg-[#13151A] border border-gray-800 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#1A1D24] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] md:relative md:inset-auto md:z-auto w-full md:w-[40%] xl:w-[35%] h-full animate-in slide-in-from-right-8 fade-in opacity-100 duration-300">
            <VulnerabilityDetailsDrawer
              vulnerability={selectedVuln}
              onClose={() => setSelectedVuln(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
