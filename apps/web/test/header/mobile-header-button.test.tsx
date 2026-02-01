import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import MobileHeaderButton from "~/app/_components/header/mobile-header-button";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img src={src} alt={alt} />
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
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

describe("MobileHeaderButton", () => {
  test("renders label", () => {
    render(<MobileHeaderButton label="Jobs" />);
    expect(screen.getByText("Jobs")).toBeInTheDocument();
  });

  test("renders as Link when href is provided", () => {
    render(<MobileHeaderButton href="/roles" label="Roles" />);
    const link = screen.getByRole("link", { name: /roles/i });
    expect(link).toHaveAttribute("href", "/roles");
  });

  test("renders icon when iconSrc is provided", () => {
    render(
      <MobileHeaderButton
        href="/"
        iconSrc="/svg/apartment.svg"
        label="Jobs"
      />,
    );
    expect(screen.getByRole("img", { name: /jobs/i })).toBeInTheDocument();
  });

});
