import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProofBadge } from "../components/ui/ProofBadge";

describe("ProofBadge Component", () => {
  it("renders each proof level with its label", () => {
    const { rerender } = render(<ProofBadge proofLevel="exploited" />);
    expect(screen.getByText("Exploitée")).toBeInTheDocument();

    rerender(<ProofBadge proofLevel="detected" />);
    expect(screen.getByText("Détectée")).toBeInTheDocument();

    rerender(<ProofBadge proofLevel="unverified" />);
    expect(screen.getByText("Non vérifiée")).toBeInTheDocument();
  });

  it("names the producer in the tooltip", () => {
    render(<ProofBadge proofLevel="unverified" source="agent-crew" />);
    expect(screen.getByText("Non vérifiée")).toHaveAttribute(
      "title",
      expect.stringContaining("Source : Agent IA."),
    );
  });

  it("renders nothing for findings saved before the proof contract", () => {
    const { container, rerender } = render(<ProofBadge />);
    expect(container).toBeEmptyDOMElement();

    rerender(<ProofBadge proofLevel="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
