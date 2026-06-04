import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

// HeaderLayout pulls in auth/trpc; stub it to just render its children.
vi.mock("~/app/_components/header/header-layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

import NotFound from "~/app/not-found";

describe("NotFound", () => {
  test("renders the 404 page content", () => {
    render(<NotFound />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
  });
});
