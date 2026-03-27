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
if (typeof window !== "undefined" && !(window as any).EventSource) {
  (window as any).EventSource = class {
    onmessage: any = null;
    onerror: any = null;
    close = vi.fn();
    constructor(_url: string) {}
  };
}
