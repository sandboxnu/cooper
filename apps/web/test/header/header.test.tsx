import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import Header from "~/app/_components/header/header";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
    <img src="/menu.svg" alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("~/trpc/react", () => ({
  api: {
    auth: {
      getSession: {
        useQuery: () => ({ data: null, isLoading: false }),
      },
    },
  },
}));

vi.mock("~/app/_components/cooper-logo", () => ({
  default: () => <div data-testid="cooper-logo">Logo</div>,
}));

vi.mock("~/app/_components/header/mobile-header-button", () => ({
  default: ({
    label,
    children,
    href: _href,
  }: {
    href?: string;
    label?: string;
    children?: React.ReactNode;
  }) => (
    <div data-testid="mobile-header-button">
      {label}
      {children}
    </div>
  ),
}));

describe("Header", () => {
  test("renders Cooper title", () => {
    render(<Header auth={<span>Auth</span>} />);
    expect(
      screen.getByRole("heading", { name: /cooper/i }),
    ).toBeInTheDocument();
  });

  test("renders Submit Feedback link", () => {
    render(<Header auth={<span>Auth</span>} />);
    expect(
      screen.getByRole("link", { name: /submit feedback or bug reports/i }),
    ).toBeInTheDocument();
  });

  test("opens mobile menu when burger is clicked", () => {
    render(<Header auth={<span>Auth</span>} />);
    const burger = screen.getByRole("button", { name: /hamburger menu/i });
    fireEvent.click(burger);
    expect(screen.getByText("Jobs")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  test("closes mobile menu when X is clicked", () => {
    render(<Header auth={<span>Auth</span>} />);
    fireEvent.click(screen.getByRole("button", { name: /hamburger menu/i }));
    const closeButton = screen.getByRole("button", { name: /^x$/i });
    fireEvent.click(closeButton);
    expect(screen.queryByText("Jobs")).not.toBeInTheDocument();
  });
});
