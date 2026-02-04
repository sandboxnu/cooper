import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ProfileButtonClient from "~/app/_components/profile/profile-button-client";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test mock
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

vi.mock("~/app/_components/auth/actions", () => ({
  handleSignOut: vi.fn(),
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

type SessionLike = Parameters<typeof ProfileButtonClient>[0]["session"];

describe("ProfileButtonClient", () => {
  const mockSession: SessionLike = {
    user: {
      id: "u1",
      email: "test@neu.edu",
      name: "Test User",
      image: "/custom-avatar.png",
    },
    session: {},
  };

  test("renders profile image with session user image", () => {
    render(<ProfileButtonClient session={mockSession} />);
    const img = screen.getByTestId("profile-image");
    expect(img).toHaveAttribute("src", "/custom-avatar.png");
    expect(img).toHaveAttribute("alt", "Profile");
  });

  test("renders default image when session user image is null", () => {
    const sessionNoImage: SessionLike = {
      ...mockSession,
      user: { ...mockSession.user, image: null },
    };
    render(<ProfileButtonClient session={sessionNoImage} />);
    const img = screen.getByTestId("profile-image");
    expect(img).toHaveAttribute("src", "/svg/defaultProfile.svg");
  });

  test("renders Profile link in dropdown content", () => {
    render(<ProfileButtonClient session={mockSession} />);
    const profileLink = screen.getByRole("link", { name: "Profile" });
    expect(profileLink).toHaveAttribute("href", "/profile");
  });

  test("renders Log Out button in dropdown content", () => {
    render(<ProfileButtonClient session={mockSession} />);
    expect(
      screen.getByRole("button", { name: /log out/i }),
    ).toBeInTheDocument();
  });
});
