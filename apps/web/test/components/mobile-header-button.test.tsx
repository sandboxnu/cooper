import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

import MobileHeaderButton from "~/app/_components/header/mobile-header-button";

describe("MobileHeaderButton", () => {
  beforeEach(() => {
    pathname = "/";
  });

  test("renders the label", () => {
    render(<MobileHeaderButton label="Home" href="/home" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  test("renders children", () => {
    render(
      <MobileHeaderButton href="/home">
        <span>child node</span>
      </MobileHeaderButton>,
    );
    expect(screen.getByText("child node")).toBeInTheDocument();
  });

  test("wraps the button in a link when href is provided", () => {
    render(<MobileHeaderButton label="Roles" href="/roles" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/roles");
  });

  test("renders no link when href is omitted", () => {
    render(<MobileHeaderButton label="Plain" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("shows the selected indicator when the path matches href", () => {
    pathname = "/roles";
    render(<MobileHeaderButton label="Roles" href="/roles" />);
    expect(screen.getByAltText("Selected")).toBeInTheDocument();
  });

  test("hides the selected indicator when the path does not match", () => {
    pathname = "/companies";
    render(<MobileHeaderButton label="Roles" href="/roles" />);
    expect(screen.queryByAltText("Selected")).not.toBeInTheDocument();
  });

  test("fires onClick when the link is clicked", () => {
    const onClick = vi.fn();
    render(
      <MobileHeaderButton label="Roles" href="/roles" onClick={onClick} />,
    );
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalled();
  });
});
