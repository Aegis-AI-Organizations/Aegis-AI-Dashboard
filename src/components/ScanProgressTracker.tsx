import React from "react";
import { Loader2, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { useScanPolling } from "../hooks/useScanPolling";
import { useScanStream } from "../hooks/useScanStream";
import { STATUS_DETAILS } from "../constants/scan";

interface ScanProgressTrackerProps {
  scanId: string;
  targetImage: string;
  initialStatus?: string;
  onReset: () => void;
  onScanUpdate?: () => void;
}

export const ScanProgressTracker: React.FC<ScanProgressTrackerProps> = ({
  scanId,
  targetImage,
  initialStatus = "PENDING",
  onReset,
  onScanUpdate,
}) => {
  const { scanStatus: pollingStatus } = useScanPolling(scanId, initialStatus);
  const streamUpdate = useScanStream(scanId);

  const [activeStatus, setActiveStatus] = React.useState(initialStatus);

  React.useEffect(() => {
    if (streamUpdate && streamUpdate.scan_id === scanId) {
      setActiveStatus(streamUpdate.status);
    }
  }, [streamUpdate, scanId]);

  React.useEffect(() => {
    if (pollingStatus && !streamUpdate) {
      setActiveStatus(pollingStatus);
    }
  }, [pollingStatus, streamUpdate]);

  const scanStatus = activeStatus;
  const currentStatusDetail =
    STATUS_DETAILS[scanStatus] || STATUS_DETAILS.PENDING;
  const isFinished = ["COMPLETED", "FAILED", "CANCELED"].includes(scanStatus);

  React.useEffect(() => {
    if (onScanUpdate) {
      onScanUpdate();
    }
  }, [scanStatus, onScanUpdate]);

  return (
    <div className="bg-[#111318] border border-gray-800/60 rounded-xl p-6 shadow-xl max-w-md w-full font-sans text-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Scan en cours</h2>
        <p className="text-sm text-gray-400">
          Cible :{" "}
          <span className="text-cyan-400 font-medium">{targetImage}</span>
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        <div className="relative flex items-center justify-center w-32 h-32">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              className="text-gray-800/80 transition-colors"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <circle
              className={`${currentStatusDetail.color} transition-all duration-1000 ease-out`}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={
                276.46 - (276.46 * currentStatusDetail.progress) / 100
              }
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex items-center justify-center inset-0">
            {isFinished ? (
              scanStatus === "COMPLETED" ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500" />
              )
            ) : (
              <Loader2
                className={`w-12 h-12 animate-spin ${currentStatusDetail.color}`}
              />
            )}
          </div>
        </div>

        <div className="text-center space-y-3 w-full border border-gray-800/60 bg-[#1A1D24] rounded-lg p-4 relative">
          <div className="flex items-center justify-center space-x-2">
            <span
              className={`font-semibold text-[15px] ${currentStatusDetail.color} uppercase tracking-wide`}
            >
              {currentStatusDetail.label}
            </span>
            <div className="relative group flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-gray-500 cursor-help hover:text-gray-300 transition-colors" />
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-56 p-3 bg-[#242832] border border-gray-700/50 rounded-lg shadow-2xl text-xs text-gray-300 text-left z-10 pointer-events-none">
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#242832] border-b border-r border-gray-700/50 transform rotate-45"></div>
                {currentStatusDetail.description}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 font-medium">
            {currentStatusDetail.progress}% terminé
          </p>
        </div>
      </div>

      {isFinished && (
        <button
          onClick={onReset}
          className="mt-6 w-full flex items-center justify-center bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg px-6 py-3 transition-colors duration-200 border border-gray-700/50"
        >
          Nouveau Scan
        </button>
      )}
    </div>
  );
};
