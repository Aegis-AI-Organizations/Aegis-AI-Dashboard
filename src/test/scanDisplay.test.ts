import { describe, expect, it } from "vitest";
import { formatScanTargetName } from "../utils/scanDisplay";

describe("formatScanTargetName", () => {
  it("uses an explicit target label first", () => {
    expect(
      formatScanTargetName({
        target_image: "topology:container-a,container-b",
        target_label: "API, dashboard",
      }),
    ).toBe("API, dashboard");
  });

  it("formats topology scans without exposing raw target ids", () => {
    expect(formatScanTargetName({ target_image: "topology:all" })).toBe(
      "Topologie complète",
    );
    expect(
      formatScanTargetName({
        target_image: "topology:selection:7",
      }),
    ).toBe("Topologie - 7 cibles");
    expect(
      formatScanTargetName({
        target_image: "topology:container-a,container-b",
      }),
    ).toBe("Topologie - 2 cibles");
  });

  it("keeps non-topology targets readable", () => {
    expect(formatScanTargetName({ target_image: "nginx:latest" })).toBe(
      "nginx:latest",
    );
    expect(formatScanTargetName({ target_image: "" })).toBe("Cible inconnue");
  });
});
