import { describe, it, expect } from "vitest";
import { getInitials, getAvatarContent } from "../utils/user";

describe("user utils", () => {
  describe("getInitials", () => {
    it("returns initials from name with two parts", () => {
      expect(getInitials("Jean Dupont")).toBe("JD");
    });

    it("returns initials from name with more than two parts", () => {
      expect(getInitials("Jean Marie De La Fontaine")).toBe("JF");
    });

    it("returns first two letters for single name", () => {
      expect(getInitials("Aegis")).toBe("AE");
    });

    it("returns initials from email if name is missing", () => {
      expect(getInitials(undefined, "test@example.com")).toBe("TE");
    });

    it("returns AD if both name and email are missing", () => {
      expect(getInitials(undefined, undefined)).toBe("AD");
    });

    it("handles whitespace in name", () => {
      expect(getInitials("  John   Doe  ")).toBe("JD");
    });
  });

  describe("getAvatarContent", () => {
    it("returns image type if avatar_url is present", () => {
      const user = { avatar_url: "https://example.com/avatar.png" };
      expect(getAvatarContent(user)).toEqual({
        type: "image",
        value: "https://example.com/avatar.png",
      });
    });

    it("returns initials type if avatar_url is missing", () => {
      const user = { name: "John Doe" };
      expect(getAvatarContent(user)).toEqual({
        type: "initials",
        value: "JD",
      });
    });

    it("handles empty avatar_url as missing", () => {
      const user = { name: "John Doe", avatar_url: "  " };
      expect(getAvatarContent(user)).toEqual({
        type: "initials",
        value: "JD",
      });
    });
  });
});
