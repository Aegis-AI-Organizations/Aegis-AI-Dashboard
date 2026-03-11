import { useState } from "react";

export const useDownloadReport = () => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getApiUrl = () => {
    return (
      import.meta.env.VITE_API_GATEWAY_URL ||
      import.meta.env.API_GATEWAY_URL ||
      ""
    );
  };

  const downloadReport = async (scanId: string) => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiUrl()}/scans/${scanId}/report`, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement: ${response.status}`);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Aegis-Report-${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Erreur lors du téléchargement du rapport :", err);
      setError(
        "Impossible de télécharger le rapport. Veuillez réessayer plus tard.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadReport, isDownloading, error };
};
