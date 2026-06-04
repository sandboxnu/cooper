import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const oauth2 = vi.fn().mockResolvedValue({ error: null });
const signOutClient = vi.fn().mockResolvedValue(undefined);
vi.mock("@cooper/auth/client", () => ({
  authClient: {
    signIn: { oauth2: (...args: unknown[]) => oauth2(...args) },
    signOut: () => signOutClient(),
  },
}));

const signIn = vi.fn();
const signInAsPreviewUser = vi.fn();
const signOut = vi.fn();
vi.mock("@cooper/auth", () => ({
  signIn: (...args: unknown[]) => signIn(...args),
  signInAsPreviewUser: (...args: unknown[]) => signInAsPreviewUser(...args),
  signOut: (...args: unknown[]) => signOut(...args),
}));

const handleGoogleSignIn = vi.fn();
const handlePreviewSignIn = vi.fn();
vi.mock("~/app/_components/auth/actions", () => ({
  handleGoogleSignIn: () => handleGoogleSignIn(),
  handlePreviewSignIn: () => handlePreviewSignIn(),
}));

import AdminSignInButton from "~/app/_components/auth/admin-signin-button";
import LoginButtonClient from "~/app/_components/auth/login-button-client";
import LoginButton from "~/app/_components/auth/login-button";
import LogoutButton from "~/app/_components/auth/logout-button";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth server actions", () => {
  // The real actions module is exercised separately from the mocked import
  // above by importing it directly inside these tests.
  test("handleGoogleSignIn signs in with google", async () => {
    const actions = await vi.importActual<
      typeof import("~/app/_components/auth/actions")
    >("~/app/_components/auth/actions");
    await actions.handleGoogleSignIn();
    expect(signIn).toHaveBeenCalledWith("google", { redirectTo: "/" });
  });

  test("handlePreviewSignIn signs in as preview user", async () => {
    const actions = await vi.importActual<
      typeof import("~/app/_components/auth/actions")
    >("~/app/_components/auth/actions");
    await actions.handlePreviewSignIn();
    expect(signInAsPreviewUser).toHaveBeenCalledWith({ redirectTo: "/" });
  });

  test("handleSignOut signs out", async () => {
    const actions = await vi.importActual<
      typeof import("~/app/_components/auth/actions")
    >("~/app/_components/auth/actions");
    await actions.handleSignOut();
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });
});

describe("AdminSignInButton", () => {
  test("starts an admin oauth2 sign-in on click", async () => {
    render(<AdminSignInButton />);
    fireEvent.click(screen.getByRole("button", { name: /continue as admin/i }));
    await waitFor(() =>
      expect(oauth2).toHaveBeenCalledWith({
        providerId: "googleAdmin",
        callbackURL: "/roles",
      }),
    );
  });
});

describe("LoginButtonClient", () => {
  test("renders the google sign-in image button", () => {
    render(<LoginButtonClient />);
    expect(screen.getByAltText("Login")).toBeInTheDocument();
  });
});

describe("LoginButton", () => {
  test("renders the preview variant", () => {
    render(<LoginButton isPreview />);
    expect(screen.getByText("Sign in as preview user")).toBeInTheDocument();
  });

  test("renders the default variant and triggers oauth2", async () => {
    render(<LoginButton />);
    expect(screen.getByText("Log in with Husky email")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Log in with Husky email"));
    await waitFor(() =>
      expect(oauth2).toHaveBeenCalledWith({
        providerId: "google",
        callbackURL: "/roles",
      }),
    );
  });
});

describe("LogoutButton", () => {
  test("signs out on click", async () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: "Sign Out" }));
    await waitFor(() => expect(signOutClient).toHaveBeenCalledOnce());
  });
});
