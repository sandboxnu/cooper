import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ScreenSizeIndicator } from "~/app/_components/screen-size-indicator";

// jsdom has no matchMedia; stub it so the effect can run.
function mockMatchMedia(matchingQuery: string | null) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === matchingQuery,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("ScreenSizeIndicator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("shows the largest matching breakpoint", () => {
    mockMatchMedia("(min-width: 1536px)");
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen:/).textContent).toContain("2xl");
  });

  test("falls back to xs when nothing matches", () => {
    mockMatchMedia(null);
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen:/).textContent).toContain("xs");
  });

  test("reports md for a mid-size breakpoint", () => {
    mockMatchMedia("(min-width: 768px)");
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen:/).textContent).toContain("md");
  });
});
