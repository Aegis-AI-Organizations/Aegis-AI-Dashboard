import React, { useState } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { useCreateScan } from "../hooks/useCreateScan";
import { ScanProgressTracker } from "./ScanProgressTracker";

interface LaunchpadFormProps {
  onScanUpdate?: () => void;
}

export const LaunchpadForm: React.FC<LaunchpadFormProps> = ({
  onScanUpdate,
}) => {
  const [targetImage, setTargetImage] = useState("");
  const [activeScanId, setActiveScanId] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<string>("PENDING");

  const { createScan, isLoading, error } = useCreateScan();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = await createScan(targetImage);

    if (data) {
      setActiveScanId(data.scan_id);
      setInitialStatus(data.status || "PENDING");
      if (onScanUpdate) {
        onScanUpdate();
      }
    }
  };

  const handleReset = () => {
    setActiveScanId(null);
    setTargetImage("");
    setInitialStatus("PENDING");
  };

  if (activeScanId) {
    return (
      <ScanProgressTracker
        scanId={activeScanId}
        targetImage={targetImage}
        initialStatus={initialStatus}
        onReset={handleReset}
        onScanUpdate={onScanUpdate}
      />
    );
  }

  return (
    <div className="w-full font-sans text-gray-200">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="target_image"
            className="block text-sm font-medium text-gray-300 mb-1.5"
          >
            Image Docker
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
          {isLoading ? "Lancement..." : "Lancer le Scan"}
        </button>
      </form>
    </div>
  );
};
