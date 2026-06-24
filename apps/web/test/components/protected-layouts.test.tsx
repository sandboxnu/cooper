import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSession, redirect, findFirst } = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn(),
  findFirst: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@cooper/auth", () => ({ getSession }));
vi.mock("@cooper/db/client", () => ({
  db: { query: { User: { findFirst } } },
}));
vi.mock("@cooper/ui", () => ({
  CustomToaster: () => <div data-testid="toaster" />,
}));
vi.mock("~/app/_components/header/header-layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-layout">{children}</div>
  ),
}));
vi.mock("~/app/_components/onboarding/onboarding-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="onboarding">{children}</div>
  ),
}));

import LandingLayout from "~/app/(pages)/(landing)/layout";
import ProtectedLayout from "~/app/(pages)/(protected)/layout";

describe("(landing) RootLayout", () => {
  beforeEach(() => vi.clearAllMocks());

  test("redirects authenticated users to /roles", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } });
    await LandingLayout({ children: <div /> });
    expect(redirect).toHaveBeenCalledWith("/roles");
  });

  test("renders children for anonymous visitors", async () => {
    getSession.mockResolvedValue(null);
    render(await LandingLayout({ children: <div data-testid="child" /> }));
    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

describe("(protected) ProtectedLayout", () => {
  beforeEach(() => vi.clearAllMocks());

  test("redirects to / when there is no session", async () => {
    getSession.mockResolvedValue(null);
    await ProtectedLayout({ children: <div /> });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  test("redirects disabled users to /", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } });
    findFirst.mockResolvedValue({ isDisabled: true });
    await ProtectedLayout({ children: <div /> });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  test("renders children for an enabled, authenticated user", async () => {
    getSession.mockResolvedValue({ user: { id: "u1" } });
    findFirst.mockResolvedValue({ isDisabled: false });
    render(await ProtectedLayout({ children: <div data-testid="child" /> }));
    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
