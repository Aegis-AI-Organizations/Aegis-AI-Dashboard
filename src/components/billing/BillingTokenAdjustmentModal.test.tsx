import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BillingTokenAdjustmentModal } from "./BillingTokenAdjustmentModal";

describe("BillingTokenAdjustmentModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <BillingTokenAdjustmentModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        companyName="Test Corp"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders correctly when open", () => {
    render(
      <BillingTokenAdjustmentModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        companyName="Test Corp"
      />,
    );
    expect(screen.getByText("Ajustement de Tokens")).toBeInTheDocument();
    expect(screen.getByText("Test Corp")).toBeInTheDocument();
  });

  it("validates input and calls onSubmit", async () => {
    render(
      <BillingTokenAdjustmentModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        companyName="Test Corp"
      />,
    );

    const amountInput = screen.getByPlaceholderText("Ex: 50 ou -20");
    const reasonInput = screen.getByPlaceholderText(/Ajustement manuel/i);

    fireEvent.change(amountInput, { target: { value: "50" } });
    fireEvent.change(reasonInput, { target: { value: "Reason for test" } });
    fireEvent.submit(screen.getByText("Confirmer").closest("form")!);

    await waitFor(() =>
      expect(mockOnSubmit).toHaveBeenCalledWith(50, "Reason for test"),
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows error for invalid amount", async () => {
    render(
      <BillingTokenAdjustmentModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        companyName="Test Corp"
      />,
    );

    const amountInput = screen.getByPlaceholderText("Ex: 50 ou -20");

    fireEvent.change(amountInput, { target: { value: "" } });
    fireEvent.submit(screen.getByText("Confirmer").closest("form")!);

    await waitFor(() =>
      expect(screen.getByText("Montant invalide")).toBeInTheDocument(),
    );
  });

  it("shows error for short reason", async () => {
    render(
      <BillingTokenAdjustmentModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        companyName="Test Corp"
      />,
    );

    const amountInput = screen.getByPlaceholderText("Ex: 50 ou -20");
    const reasonInput = screen.getByPlaceholderText(/Ajustement manuel/i);

    fireEvent.change(amountInput, { target: { value: "10" } });
    fireEvent.change(reasonInput, { target: { value: "no" } });
    fireEvent.submit(screen.getByText("Confirmer").closest("form")!);

    await waitFor(() =>
      expect(
        screen.getByText("Veuillez fournir un motif plus détaillé"),
      ).toBeInTheDocument(),
    );
  });
});
