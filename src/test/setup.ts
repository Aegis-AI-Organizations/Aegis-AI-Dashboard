import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock EventSource for Vitest/jsdom
if (typeof window !== "undefined") {
  (window as any).EventSource = vi.fn().mockImplementation((_url: string) => ({
    onmessage: null,
    onerror: null,
    close: vi.fn(),
  }));
}
