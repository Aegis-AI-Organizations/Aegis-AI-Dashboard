import { describe, expect, it } from "vitest";
import {
  auditActionLabel,
  formatAuditDate,
  formatAuditIp,
  toAuditDate,
} from "../utils/auditDisplay";

describe("toAuditDate", () => {
  it("reads ISO strings", () => {
    expect(toAuditDate("2026-11-16T10:30:00Z")?.toISOString()).toBe(
      "2026-11-16T10:30:00.000Z",
    );
  });

  it("reads protobuf timestamps with seconds and nanos", () => {
    expect(
      toAuditDate({ seconds: 1782892613, nanos: 102417000 })?.toISOString(),
    ).toBe("2026-07-01T07:56:53.102Z");
  });

  it("reads seconds sent as strings", () => {
    expect(toAuditDate({ seconds: "1782892613" })?.getTime()).toBe(
      1782892613000,
    );
  });

  it("returns null for unreadable values", () => {
    expect(toAuditDate(undefined)).toBeNull();
    expect(toAuditDate("not a date")).toBeNull();
    expect(toAuditDate({})).toBeNull();
  });
});

describe("formatAuditDate", () => {
  it("never returns Invalid Date", () => {
    const formatted = formatAuditDate({ seconds: 1782892613, nanos: 0 });
    expect(formatted.date).not.toMatch(/Invalid/);
    expect(formatted.time).toMatch(/\d{2}:\d{2}/);
  });

  it("falls back to an explicit label", () => {
    expect(formatAuditDate(null)).toEqual({ date: "Date inconnue", time: "" });
  });
});

describe("auditActionLabel", () => {
  it("translates known actions", () => {
    expect(auditActionLabel("ONBOARD_COMPANY")).toBe("Entreprise ajoutée");
    expect(auditActionLabel("UPDATE_USER_ROLE")).toBe("Rôle modifié");
  });

  it("keeps unknown actions readable", () => {
    expect(auditActionLabel("ROTATE_AGENT_TOKEN")).toBe("Rotate agent token");
  });
});

describe("formatAuditIp", () => {
  it("removes the gRPC prefix and port", () => {
    expect(formatAuditIp("ipv4:192.168.117.10:54558")).toBe("192.168.117.10");
    expect(formatAuditIp("ipv6:[::1]:50051")).toBe("::1");
    expect(formatAuditIp("10.0.0.1")).toBe("10.0.0.1");
  });
});
