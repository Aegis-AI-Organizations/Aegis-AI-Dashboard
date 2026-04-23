import React, { useState, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  Search,
  Filter,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";
import { pageTitle } from "styled-system/recipes";
import type { Vulnerability } from "../types/vulnerability";
import type { ScanStatusResponse } from "../types/scan";
import { useScans } from "../hooks/useScans";
import { PentestAccordion } from "../components/PentestAccordion";
import { VulnerabilityDetailsDrawer } from "../components/VulnerabilityDetailsDrawer";

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
    return scans.filter((s: ScanStatusResponse) => {
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
    <div className={css({ "& > * + *": { mt: "sectionGap" } })}>
      <div
        className={flex({
          direction: { base: "column", md: "row" },
          justify: "space-between",
          align: { base: "start", md: "end" },
          gap: "4",
        })}
      >
        <div>
          <h1 className={pageTitle()}>Historique des Scans</h1>
          <p className={css({ color: "text.muted", fontSize: "sm" })}>
            Naviguez à travers l'historique complet de vos analyses et examinez
            les détails.
          </p>
        </div>

        {/* Desktop Search Bar */}
        <div
          className={css({
            display: { base: "none", md: "flex" },
            alignItems: "center",
            gap: "3",
            w: "96",
          })}
        >
          <div className={css({ position: "relative", flex: "1" })}>
            <div
              className={css({
                position: "absolute",
                insetY: "0",
                left: "3",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              })}
            >
              <Search className={css({ w: "4", h: "4", color: "gray.500" })} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher une cible, un ID..."
              className={css({
                w: "full",
                bg: "bg.card",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                fontSize: "sm",
                borderRadius: "xl",
                pl: "10",
                pr: "4",
                py: "2.5",
                color: "text.main",
                _focus: { outline: "none", borderColor: "brand.primary" },
                transition: "all",
                _placeholder: { color: "gray.600" },
              })}
            />
          </div>
        </div>
      </div>

      <div
        className={css({
          display: { base: "flex", md: "none" },
          flexDir: "column",
          gap: "4",
          mb: "4",
          flexShrink: "0",
        })}
      >
        <div className={flex({ align: "center", gap: "2" })}>
          <div className={css({ position: "relative", flex: "1" })}>
            <div
              className={css({
                position: "absolute",
                insetY: "0",
                left: "0",
                pl: "3",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              })}
            >
              <Search className={css({ w: "4", h: "4", color: "gray.500" })} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher..."
              className={css({
                w: "full",
                bg: "bg.card",
                border: "1px solid",
                borderColor: "whiteAlpha.100",
                fontSize: "sm",
                borderRadius: "lg",
                pl: "9",
                pr: "4",
                py: "2",
                color: "text.main",
                _focus: { outline: "none", borderColor: "brand.primary" },
                _placeholder: { color: "gray.600" },
              })}
            />
          </div>
          <button
            className={css({
              p: "2",
              bg: "bg.card",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              borderRadius: "lg",
              color: "text.muted",
              _hover: { color: "white" },
            })}
          >
            <Filter className={css({ w: "4", h: "4" })} />
          </button>
        </div>
      </div>

      <div
        className={flex({
          flex: "1",
          direction: { base: "column", md: "row" },
          gap: "6",
          minH: "0",
          position: "relative",
          align: "stretch",
        })}
      >
        <div
          className={css({
            transition: "all",
            transitionDuration: "300ms",
            h: "full",
            overflowY: "auto",
            pr: { base: "1", md: "2" },
            display: "flex",
            flexDir: "column",
            w: isDrawerOpen ? { md: "60%", xl: "65%" } : "full",
          })}
        >
          {isLoading ? (
            <div
              className={flex({
                direction: "column",
                align: "center",
                justify: "center",
                p: "12",
                h: "full",
                minH: "400px",
                bg: "bg.card",
                border: "1px solid",
                borderColor: "whiteAlpha.50",
                borderRadius: "xl",
                w: "full",
              })}
            >
              <div
                className={css({
                  animation: "spin 1s linear infinite",
                  borderRadius: "full",
                  h: "8",
                  w: "8",
                  borderBottom: "2px solid",
                  borderColor: "brand.primary",
                })}
              ></div>
              <p
                className={css({
                  mt: "4",
                  color: "text.muted",
                  fontSize: "sm",
                })}
              >
                Chargement de l'historique des pentests...
              </p>
            </div>
          ) : error ? (
            <div
              className={flex({
                p: "6",
                h: "full",
                minH: "400px",
                direction: "column",
                align: "center",
                justify: "center",
                bg: "red.500/10",
                border: "1px solid",
                borderColor: "red.500/20",
                borderRadius: "xl",
                textAlign: "center",
                w: "full",
              })}
            >
              <p className={css({ color: "red.400", fontWeight: "medium" })}>
                {error}
              </p>
            </div>
          ) : scans.length === 0 ? (
            <div
              className={flex({
                direction: "column",
                h: "full",
                minH: "400px",
                align: "center",
                justify: "center",
                p: "12",
                bg: "bg.card",
                border: "1px solid",
                borderColor: "whiteAlpha.50",
                borderRadius: "xl",
                textAlign: "center",
                w: "full",
              })}
            >
              <ShieldAlert
                className={css({
                  w: "16",
                  h: "16",
                  color: "gray.500",
                  mb: "4",
                })}
              />
              <h3
                className={css({
                  color: "white",
                  fontWeight: "medium",
                  fontSize: "xl",
                })}
              >
                Aucun pentest trouvé
              </h3>
              <p
                className={css({
                  color: "text.muted",
                  fontSize: "sm",
                  mt: "2",
                })}
              >
                Lancez un nouveau scan depuis le tableau de bord pour voir les
                résultats ici.
              </p>
            </div>
          ) : (
            <>
              <div
                className={flex({
                  direction: "column",
                  pb: "8",
                  gap: "3",
                  flex: "1",
                })}
              >
                {currentScans.map((scan: ScanStatusResponse, index: number) => (
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
                <div
                  className={flex({
                    align: "center",
                    justify: "space-between",
                    borderTop: "1px solid",
                    borderColor: "whiteAlpha.100",
                    pt: "4",
                    pb: "8",
                    mt: "auto",
                    flexShrink: "0",
                  })}
                >
                  <p
                    className={css({
                      fontSize: "sm",
                      color: "text.muted",
                      display: { base: "none", sm: "block" },
                    })}
                  >
                    Affichage{" "}
                    <span
                      className={css({ fontWeight: "medium", color: "white" })}
                    >
                      {indexOfFirstItem + 1}
                    </span>{" "}
                    à{" "}
                    <span
                      className={css({ fontWeight: "medium", color: "white" })}
                    >
                      {Math.min(indexOfLastItem, scans.length)}
                    </span>{" "}
                    sur{" "}
                    <span
                      className={css({ fontWeight: "medium", color: "white" })}
                    >
                      {scans.length}
                    </span>{" "}
                    résultats
                  </p>
                  <div
                    className={flex({
                      align: "center",
                      gap: "2",
                      w: { base: "full", sm: "auto" },
                      justify: { base: "space-between", sm: "flex-end" },
                    })}
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={css({
                        px: "3",
                        py: "2",
                        display: "flex",
                        alignItems: "center",
                        bg: "bg.card",
                        border: "1px solid",
                        borderColor: "whiteAlpha.100",
                        borderRadius: "lg",
                        fontSize: "sm",
                        fontWeight: "medium",
                        color: "text.muted",
                        _hover: { bg: "whiteAlpha.50", color: "white" },
                        _disabled: { opacity: 0.5, cursor: "not-allowed" },
                        transition: "colors",
                      })}
                    >
                      <ChevronLeft
                        className={css({ w: "4", h: "4", mr: "1" })}
                      />
                      Précédent
                    </button>
                    <span
                      className={css({
                        fontSize: "sm",
                        color: "text.muted",
                        display: { sm: "none" },
                      })}
                    >
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={css({
                        px: "3",
                        py: "2",
                        display: "flex",
                        alignItems: "center",
                        bg: "bg.card",
                        border: "1px solid",
                        borderColor: "whiteAlpha.100",
                        borderRadius: "lg",
                        fontSize: "sm",
                        fontWeight: "medium",
                        color: "text.muted",
                        _hover: { bg: "whiteAlpha.50", color: "white" },
                        _disabled: { opacity: 0.5, cursor: "not-allowed" },
                        transition: "colors",
                      })}
                    >
                      Suivant
                      <ChevronRight
                        className={css({ w: "4", h: "4", ml: "1" })}
                      />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {isDrawerOpen && (
          <div
            className={css({
              position: { base: "fixed", md: "relative" },
              inset: { base: "0", md: "auto" },
              zIndex: { base: "100", md: "auto" },
              w: { base: "full", md: "40%", xl: "35%" },
              h: "full",
              animation: "slideInFromRight 0.3s ease-out, fadeIn 0.3s ease-out",
            })}
          >
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
