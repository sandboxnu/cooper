import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ProfileButton from "~/app/_components/profile/profile-button";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="profile-image" />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@cooper/auth", () => ({
  signOut: vi.fn(),
}));

vi.mock("@cooper/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

describe("ProfileButton", () => {
  const mockSession = {
    user: {
      id: "u1",
      email: "test@neu.edu",
      name: "Test User",
      image: null,
    },
    session: {},
  } as never;

  test("renders profile image", () => {
    render(<ProfileButton session={mockSession} />);
    const img = screen.getByTestId("profile-image");
    expect(img).toHaveAttribute("alt", "Logout");
    expect(img).toHaveAttribute("src", "/svg/defaultProfile.svg");
  });

  test("renders Profile link in dropdown content", () => {
    render(<ProfileButton session={mockSession} />);
    const profileLink = screen.getByRole("link", { name: "Profile" });
    expect(profileLink).toHaveAttribute("href", "/profile");
  });

  test("renders Log Out button in dropdown content", () => {
    render(<ProfileButton session={mockSession} />);
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });
});
