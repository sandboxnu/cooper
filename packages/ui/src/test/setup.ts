import "@testing-library/jest-dom/vitest";
import * as React from "react";

// Ensure React is available globally for components that use React.forwardRef etc.
(globalThis as unknown as { React: typeof React }).React = React;

if (typeof ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {
      /* stub for jsdom */
    }
    unobserve() {
      /* stub for jsdom */
    }
    disconnect() {
      /* stub for jsdom */
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- may be missing in some jsdom versions
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {
    /* stub for jsdom */
  };
}
