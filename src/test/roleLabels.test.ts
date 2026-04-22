import { describe, it, expect } from "vitest";
import { getRoleLabel, getRoleConfig, ROLE_CONFIGS } from "../utils/roleLabels";

describe("Role Labels Utility", () => {
  it("getRoleLabel returns correct labels", () => {
    expect(getRoleLabel("superadmin")).toBe("Super Administrateur");
    expect(getRoleLabel("unknown")).toBe("unknown");
  });

  it("getRoleConfig returns correct configs", () => {
    expect(getRoleConfig("superadmin")).toEqual(ROLE_CONFIGS.superadmin);
    expect(getRoleConfig("unknown")).toBeUndefined();
  });
});
