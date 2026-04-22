import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingPage } from "../components/ui/LoadingPage";

describe("LoadingPage Component", () => {
  it("renders correctly with default message", () => {
    render(<LoadingPage />);
    expect(screen.getByText(/Initialisation du Système/i)).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<LoadingPage message="Chargement en cours" />);
    expect(screen.getByText("Chargement en cours")).toBeInTheDocument();
  });
});
