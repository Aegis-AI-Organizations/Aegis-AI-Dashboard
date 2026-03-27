import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Settings } from "../pages/Settings";
import { Users } from "../pages/Users";

describe("static pages", () => {
  it("renders users page", () => {
    render(<Users />);
    expect(
      screen.getByText("Manage platform access, roles, and user permissions."),
    ).toBeInTheDocument();
  });

  it("renders settings page", () => {
    render(<Settings />);
    expect(
      screen.getByText(
        "Configure application preferences and global configurations.",
      ),
    ).toBeInTheDocument();
  });
});
