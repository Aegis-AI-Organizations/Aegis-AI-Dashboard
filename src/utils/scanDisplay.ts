import type { ScanStatusResponse } from "../types/scan";

const topologyPrefix = "topology:";

export const formatScanTargetName = (
  scan: Pick<ScanStatusResponse, "target_image" | "target_label">,
) => {
  const label = scan.target_label?.trim();
  if (label) return label;

  const targetImage = scan.target_image?.trim();
  if (!targetImage) return "Cible inconnue";

  if (!targetImage.toLowerCase().startsWith(topologyPrefix)) {
    return targetImage;
  }

  const topologyTarget = targetImage.slice(topologyPrefix.length).trim();
  if (!topologyTarget || topologyTarget.toLowerCase() === "all") {
    return "Topologie complète";
  }

  const selectionMatch = topologyTarget.match(/^selection:(\d+)$/i);
  const targetCount = selectionMatch
    ? Number(selectionMatch[1])
    : topologyTarget.split(",").filter((item) => item.trim()).length;

  if (targetCount <= 0) return "Topologie complète";
  if (targetCount === 1) return "Topologie - 1 cible";
  return `Topologie - ${targetCount} cibles`;
};
