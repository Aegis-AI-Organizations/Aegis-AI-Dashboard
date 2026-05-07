import { useState } from "react";
import { api } from "../api/Axios";

export const useDownloadReport = () => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = async (scanId: string) => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await api.get(`/scans/${scanId}/report`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Aegis-Report-${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Erreur lors du téléchargement du rapport :", err);
      setError(
        "Impossible de lancer le téléchargement. Veuillez réessayer plus tard.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadReport, isDownloading, error };
};
