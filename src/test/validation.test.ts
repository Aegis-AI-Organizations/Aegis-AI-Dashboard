import { describe, it, expect } from "vitest";
import { validatePassword, getPasswordError } from "../utils/validation";

describe("Validation Utils", () => {
  it("validatePassword correctly identifies complex passwords", () => {
    expect(validatePassword("Complex1!")).toBe(true);
    expect(validatePassword("simple")).toBe(false);
    expect(validatePassword("NoSpecial1")).toBe(false);
  });

  it("getPasswordError returns correct messages", () => {
    expect(getPasswordError("short")).toContain("8 caractères");
    expect(getPasswordError("nouppercase1!")).toContain("majuscule");
    expect(getPasswordError("NODIGIT!")).toContain("chiffre");
    expect(getPasswordError("NoSpecial1")).toContain("caractère spécial");
    expect(getPasswordError("ValidPass1!")).toBeNull();
  });
});
