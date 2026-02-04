import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import MobileHeaderButton from "~/app/_components/header/mobile-header-button";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
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
  usePathname: vi.fn(() => "/roles"),
}));

describe("MobileHeaderButton selected state", () => {
  test("shows selected logo when pathname matches href", () => {
    render(<MobileHeaderButton href="/roles" label="Roles" />);
    expect(screen.getByRole("img", { name: "Selected" })).toBeInTheDocument();
  });
});
