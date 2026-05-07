import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RoleBadge } from "../components/ui/RoleBadge";

describe("RoleBadge Component", () => {
  it("renders correctly for a known role (superadmin)", () => {
    render(<RoleBadge role="superadmin" />);
    expect(screen.getByText(/Super Administrateur/i)).toBeInTheDocument();
  });

  it("renders correctly for a client role (owner)", () => {
    render(<RoleBadge role="owner" />);
    expect(screen.getByText(/Propriétaire/i)).toBeInTheDocument();
  });

  it("renders correctly for an unknown role", () => {
    render(<RoleBadge role="unknown-role" />);
    expect(screen.getByText("unknown-role")).toBeInTheDocument();
  });

  it("hides icon when showIcon is false", () => {
    const { container } = render(
      <RoleBadge role="superadmin" showIcon={false} />,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = render(
      <RoleBadge role="superadmin" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
