import { useState } from "react";
import { config } from "../config";

export const useDownloadReport = () => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReport = (scanId: string) => {
    setIsDownloading(true);
    setError(null);

    try {
      const url = `${config.apiGatewayUrl}/scans/${scanId}/report`;
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Aegis-Report-${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
