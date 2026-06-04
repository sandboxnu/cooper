import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no PointerEvent, so Radix's `event.button === 0` open check never
// passes. Back it with MouseEvent (which carries `button`) so pointerdown opens.
if (typeof window.PointerEvent === "undefined") {
  class PointerEvent extends MouseEvent {
    public pointerId?: number;
    public pointerType?: string;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId;
      this.pointerType = params.pointerType;
    }
  }
  window.PointerEvent = PointerEvent as typeof window.PointerEvent;
}

// Radix UI relies on pointer-capture and scrollIntoView APIs that jsdom does
// not implement. Polyfill them so menus/popovers can open during tests.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => undefined;
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => undefined;
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => undefined;
}

// Unmount React trees between tests so queries don't leak across cases.
afterEach(() => {
  cleanup();
});
