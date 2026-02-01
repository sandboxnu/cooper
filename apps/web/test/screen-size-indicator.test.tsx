import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ScreenSizeIndicator } from "~/app/_components/screen-size-indicator";

describe("ScreenSizeIndicator", () => {
  test("renders Screen label", () => {
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen:/)).toBeInTheDocument();
  });

  test("shows xs when no media matches", () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen: xs/)).toBeInTheDocument();
  });

  test("shows sm when min-width 640px matches", () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(min-width: 640px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen: sm/)).toBeInTheDocument();
  });

  test("shows md when min-width 768px matches", () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(min-width: 768px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen: md/)).toBeInTheDocument();
  });

  test("shows lg when min-width 1024px matches", () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(min-width: 1024px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen: lg/)).toBeInTheDocument();
  });

  test("shows xl when min-width 1280px matches", () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(min-width: 1280px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen: xl/)).toBeInTheDocument();
  });

  test("shows 2xl when min-width 1536px matches", () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(min-width: 1536px)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<ScreenSizeIndicator />);
    expect(screen.getByText(/Screen: 2xl/)).toBeInTheDocument();
  });

  test("has fixed position and z-50 class", () => {
    const { container } = render(<ScreenSizeIndicator />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("fixed");
    expect(wrapper).toHaveClass("z-50");
  });
});
