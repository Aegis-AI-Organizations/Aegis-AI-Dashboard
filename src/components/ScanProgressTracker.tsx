import React from "react";
import { Loader2, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";
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

  // Map legacy color names to design tokens
  const getStatusColor = (color: string) => {
    if (color.includes("cyan")) return "{colors.brand.primary}";
    if (color.includes("green")) return "{colors.emerald.400}";
    if (color.includes("red")) return "{colors.red.400}";
    if (color.includes("yellow")) return "{colors.yellow.400}";
    return "{colors.gray.400}";
  };

  const statusColor = getStatusColor(currentStatusDetail.color);

  React.useEffect(() => {
    if (onScanUpdate) {
      onScanUpdate();
    }
  }, [scanStatus, onScanUpdate]);

  return (
    <div
      className={css({
        bg: "bg.card",
        border: "1px solid",
        borderColor: "whiteAlpha.100",
        borderRadius: "xl",
        p: "6",
        boxShadow: "xl",
        maxW: "md",
        w: "full",
        fontFamily: "sans",
        color: "text.main",
      })}
    >
      <div className={css({ textAlign: "center", mb: "6" })}>
        <h2
          className={css({
            fontSize: "xl",
            fontWeight: "bold",
            color: "white",
            mb: "2",
          })}
        >
          Scan en cours
        </h2>
        <p className={css({ fontSize: "sm", color: "text.muted" })}>
          Cible :{" "}
          <span
            className={css({ color: "brand.primary", fontWeight: "medium" })}
          >
            {targetImage}
          </span>
        </p>
      </div>

      <div
        className={flex({
          direction: "column",
          align: "center",
          justify: "center",
          gap: "6",
          py: "4",
        })}
      >
        <div
          className={css({
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            w: "32",
            h: "32",
          })}
        >
          <svg
            className={css({
              w: "full",
              h: "full",
              transform: "rotate(-90deg)",
            })}
            viewBox="0 0 100 100"
          >
            <circle
              className={css({ color: "whiteAlpha.100", transition: "colors" })}
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
            <circle
              className={css({
                transition: "all",
                transitionDuration: "1000ms",
                transitionTimingFunction: "ease-out",
              })}
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={
                276.46 - (276.46 * currentStatusDetail.progress) / 100
              }
              strokeLinecap="round"
              stroke={statusColor}
              fill="transparent"
              r="44"
              cx="50"
              cy="50"
            />
          </svg>
          <div
            className={css({
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              inset: "0",
            })}
          >
            {isFinished ? (
              scanStatus === "COMPLETED" ? (
                <CheckCircle
                  className={css({ w: "12", h: "12", color: "emerald.400" })}
                />
              ) : (
                <XCircle
                  className={css({ w: "12", h: "12", color: "red.400" })}
                />
              )
            ) : (
              <Loader2
                className={css({
                  w: "12",
                  h: "12",
                  animation: "spin 1s linear infinite",
                  color: statusColor,
                })}
              />
            )}
          </div>
        </div>

        <div
          className={css({
            textAlign: "center",
            spaceY: "3",
            w: "full",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            bg: "whiteAlpha.50",
            borderRadius: "lg",
            p: "4",
            position: "relative",
          })}
        >
          <div
            className={flex({ align: "center", justify: "center", gap: "2" })}
          >
            <span
              className={css({
                fontWeight: "semibold",
                fontSize: "15px",
                color: statusColor,
                textTransform: "uppercase",
                letterSpacing: "wide",
              })}
            >
              {currentStatusDetail.label}
            </span>
            <div
              className={css({
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <HelpCircle
                className={css({
                  w: "4",
                  h: "4",
                  color: "gray.500",
                  cursor: "help",
                  _hover: { color: "gray.300" },
                  transition: "colors",
                })}
              />
            </div>
          </div>

          <p
            className={css({
              fontSize: "xs",
              color: "gray.500",
              fontWeight: "medium",
            })}
          >
            {currentStatusDetail.progress}% terminé
          </p>
        </div>
      </div>

      {isFinished && (
        <button
          onClick={onReset}
          className={css({
            mt: "6",
            w: "full",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "whiteAlpha.100",
            _hover: { bg: "whiteAlpha.200" },
            color: "white",
            fontSize: "sm",
            fontWeight: "semibold",
            borderRadius: "lg",
            px: "6",
            py: "3",
            transition: "all",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
          })}
        >
          Nouveau Scan
        </button>
      )}
    </div>
  );
};
