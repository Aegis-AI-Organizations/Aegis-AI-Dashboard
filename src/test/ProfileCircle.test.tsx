import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileCircle } from "../components/ui/ProfileCircle";
import { useAuthStore } from "../store/AuthStore";

describe("ProfileCircle Component", () => {
  it("renders initials correctly", () => {
    render(<ProfileCircle name="John Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders image correctly when avatarUrl is provided", () => {
    render(
      <ProfileCircle avatarUrl="https://example.com/avatar.png" name="John" />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("uses auth user if no props provided", () => {
    useAuthStore.getState().setAuth("token", { name: "Jane Smith" } as any);
    render(<ProfileCircle />);
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("shows status dot when showStatus is true", () => {
    const { container } = render(
      <ProfileCircle name="John" showStatus={true} />,
    );
    expect(container.querySelector(".bg-emerald-500")).toBeInTheDocument();
  });

  it("applies correct size classes", () => {
    const { container } = render(<ProfileCircle name="John" size="xl" />);
    expect(container.firstChild?.firstChild).toHaveClass("w-28 h-28");
  });
});
