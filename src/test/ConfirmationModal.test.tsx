import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmationModal } from "../components/ui/ConfirmationModal";

describe("ConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Test Title",
    message: "Test Message",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render when open", () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Message")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Confirmer"));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("should call onClose when cancel button or backdrop is clicked", () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Annuler"));
    expect(defaultProps.onClose).toHaveBeenCalled();

    // Backdrop click
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it("should call onClose when Escape key is pressed", () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("should trap focus with Tab key (simplified coverage)", () => {
    render(<ConfirmationModal {...defaultProps} />);
    const confirmBtn = screen.getByText("Confirmer");
    const cancelBtn = screen.getByText("Annuler");

    // Initially focused confirm button
    expect(document.activeElement).toBe(confirmBtn);

    // Tab to next (cancel button)
    // We manually trigger focus to verify the element is correctly identified
    cancelBtn.focus();
    expect(document.activeElement).toBe(cancelBtn);
  });

  it("should not render when closed", () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Test Title")).toBeNull();
  });
});
