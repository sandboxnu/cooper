import "@testing-library/jest-dom/vitest";

// jsdom does not provide matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    dispatchEvent: () => false,
  }),
});

// jsdom does not provide ResizeObserver (required by cmdk/Command)
const noop = () => {
  /* stub for jsdom */
};
class ResizeObserverMock {
  observe = noop;
  unobserve = noop;
  disconnect = noop;
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// jsdom does not implement scrollIntoView (used by cmdk/Command)
Element.prototype.scrollIntoView = noop;
