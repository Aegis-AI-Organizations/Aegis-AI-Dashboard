import React, { useState } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { useCreateScan } from "../hooks/useCreateScan";
import { ScanProgressTracker } from "./ScanProgressTracker";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

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
    <div
      className={css({ width: "full", fontFamily: "sans", color: "text.main" })}
    >
      <form onSubmit={handleSubmit} className={css({ spaceY: "5" })}>
        <div>
          <label
            htmlFor="target_image"
            className={css({
              display: "block",
              fontSize: "sm",
              fontWeight: "medium",
              color: "text.muted",
              mb: "1.5",
            })}
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
            className={css({
              width: "full",
              bg: "whiteAlpha.50",
              border: "1px solid",
              borderColor: "whiteAlpha.100",
              borderRadius: "lg",
              px: "4",
              py: "2.5",
              color: "white",
              _placeholder: { color: "gray.500" },
              _focus: {
                outline: "none",
                ring: "2px",
                ringColor: "brand.primary/50",
                borderColor: "brand.primary",
              },
              transition: "all",
              _disabled: { opacity: 0.5, cursor: "not-allowed" },
            })}
          />
        </div>

        {error && (
          <div
            className={flex({
              align: "start",
              bg: "red.500/10",
              border: "1px solid",
              borderColor: "red.500/20",
              borderRadius: "lg",
              p: "3",
              color: "red.500",
              fontSize: "sm",
            })}
          >
            <AlertCircle
              className={css({
                w: "5",
                h: "5",
                mr: "2",
                flexShrink: 0,
                mt: "0.5",
              })}
            />
            <p className={css({ lineHeight: "tight" })}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={css({
            width: "full",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "brand.primary",
            _hover: {
              bg: "brand.accent",
              shadow: "0 0 20px rgba(34,211,238,0.3)",
            },
            color: "slate.950",
            fontWeight: "semibold",
            borderRadius: "lg",
            px: "6",
            py: "3",
            transition: "all",
            transitionDuration: "200ms",
            boxShadow: "0 0 15px rgba(34,211,238,0.15)",
            _disabled: { opacity: 0.75, cursor: "not-allowed" },
          })}
        >
          {isLoading ? (
            <Loader2
              data-testid="loading-spinner"
              className={css({ w: "5", h: "5", animation: "spin", mr: "2" })}
            />
          ) : (
            <Play
              className={css({ w: "5", h: "5", mr: "2", fill: "current" })}
            />
          )}
          {isLoading ? "Lancement..." : "Lancer le Scan"}
        </button>
      </form>
    </div>
  );
};
