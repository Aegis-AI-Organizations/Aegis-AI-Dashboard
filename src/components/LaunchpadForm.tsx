import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Play, Loader2, AlertCircle } from "lucide-react";

export interface CreateScanRequest {
  target_image: string;
}

export interface CreateScanResponse {
  scan_id: string;
  temporal_workflow_id: string;
  status: string;
}

export const LaunchpadForm: React.FC = () => {
  const [targetImage, setTargetImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  //   const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetImage.trim()) {
      setError("L'image Docker est requise.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: CreateScanRequest = {
      target_image: targetImage.trim(),
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_GATEWAY_URL}/scans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 201) {
        const data: CreateScanResponse = await response.json();
        // navigate(`/monitoring/${data.scan_id}`);
        console.log(data);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(
          errorData?.message ||
            `Erreur: ${response.status} ${response.statusText}`,
        );
      }
    } catch (err) {
      setError("Erreur réseau. Impossible de contacter le serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111318] border border-gray-800/60 rounded-xl p-6 shadow-xl max-w-md w-full font-sans text-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Ready to scan?</h2>
        <p className="text-sm text-gray-400">
          Entrez une image Docker pour lancer un pentest automatisé.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="target_image"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Docker Image
          </label>
          <input
            id="target_image"
            type="text"
            value={targetImage}
            onChange={(e) => setTargetImage(e.target.value)}
            disabled={isLoading}
            placeholder="ex: nginx:latest"
            className="w-full bg-[#1A1D24] border border-gray-700/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="flex items-start bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="leading-tight">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-lg px-6 py-3 transition-all duration-200 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Play className="w-5 h-5 mr-2 fill-current" />
          )}
          {isLoading ? "Lancement..." : "Launch Pentest"}
        </button>
      </form>
    </div>
  );
};
