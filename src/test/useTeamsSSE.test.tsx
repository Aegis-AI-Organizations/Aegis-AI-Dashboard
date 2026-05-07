import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTeamsSSE } from "../hooks/useTeamsSSE";
import { useAuthStore } from "../store/AuthStore";
import React from "react";

// Robust EventSource Mock
let mockEventSourceInstance: any = null;

class MockEventSource {
  onmessage: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;
  url: string;
  constructor(url: string) {
    this.url = url;
    mockEventSourceInstance = this;
  }
  close = vi.fn();
}

vi.stubGlobal("EventSource", MockEventSource);

const TestComponent: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  useTeamsSSE(onUpdate);
  return <div />;
};

describe("useTeamsSSE Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEventSourceInstance = null;
    useAuthStore.getState().setAuth("test-token", {} as any);
  });

  it("initializes EventSource with correct URL and token", () => {
    render(<TestComponent onUpdate={vi.fn()} />);
    expect(mockEventSourceInstance).not.toBeNull();
    expect(mockEventSourceInstance.url).toContain("token=test-token");
    expect(mockEventSourceInstance.url).toContain("/admin/teams/stream");
  });

  it("calls onUpdate for valid non-heartbeat messages", () => {
    const onUpdate = vi.fn();
    render(<TestComponent onUpdate={onUpdate} />);

    act(() => {
      mockEventSourceInstance.onmessage({
        data: JSON.stringify({ event_type: "COMPANY_CREATED" }),
      });
    });

    expect(onUpdate).toHaveBeenCalled();
  });

  it("ignores heartbeat messages", () => {
    const onUpdate = vi.fn();
    render(<TestComponent onUpdate={onUpdate} />);

    act(() => {
      mockEventSourceInstance.onmessage({
        data: JSON.stringify({ event_type: "HEARTBEAT" }),
      });
    });

    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("handles parse errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<TestComponent onUpdate={vi.fn()} />);

    act(() => {
      mockEventSourceInstance.onmessage({ data: "invalid-json" });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to parse"),
      expect.any(Error),
    );
  });

  it("handles SSE errors", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<TestComponent onUpdate={vi.fn()} />);

    act(() => {
      mockEventSourceInstance.onerror({ error: "failed" });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("SSE Error"),
      { error: "failed" },
    );
  });

  it("closes EventSource on unmount", () => {
    const { unmount } = render(<TestComponent onUpdate={vi.fn()} />);
    const closeSpy = mockEventSourceInstance.close;
    unmount();
    expect(closeSpy).toHaveBeenCalled();
  });
});
